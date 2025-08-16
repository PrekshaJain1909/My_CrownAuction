const express = require('express');
const { Op } = require('sequelize');
const { Auction, User, Bid } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { client } = require('../config/redis');
const { sendBidNotification } = require('../utils/emailService');
const router = express.Router();

// Place a bid
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { auctionId, amount } = req.body;

    // Get auction details
    const auction = await Auction.findByPk(auctionId, {
      include: [
        { model: User, as: 'seller', attributes: ['id', 'username', 'email'] }
      ]
    });

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // Check if auction is active
    const now = new Date();
    if (auction.status !== 'active' || now < auction.goLiveDate || now > auction.endDate) {
      return res.status(400).json({ error: 'Auction is not currently active' });
    }

    // Check if user is not the seller
    if (auction.sellerId === req.user.id) {
      return res.status(400).json({ error: 'Sellers cannot bid on their own auctions' });
    }

    // Get current highest bid from Redis
    const redisKey = `auction:${auctionId}:highest_bid`;
    const currentBidData = await client.get(redisKey);
    let currentHighestBid = auction.startingPrice;

    if (currentBidData) {
      const bidData = JSON.parse(currentBidData);
      currentHighestBid = parseFloat(bidData.amount);
    }

    // Validate bid amount
    const minBidAmount = currentHighestBid + parseFloat(auction.bidIncrement);
    if (amount < minBidAmount) {
      return res.status(400).json({
        error: `Bid must be at least $${minBidAmount.toFixed(2)}`
      });
    }

    // Get previous highest bidder to notify them
    let previousHighestBidder = null;
    if (currentBidData) {
      const bidData = JSON.parse(currentBidData);
      if (bidData.bidder && bidData.bidder.id !== req.user.id) {
        previousHighestBidder = await User.findByPk(bidData.bidder.id);
      }
    }

    // Create bid record in database
    const bid = await Bid.create({
      amount,
      auctionId,
      bidderId: req.user.id,
      isHighest: true
    });

    // Update previous highest bids to not be highest
    await Bid.update(
      { isHighest: false },
      {
        where: {
          auctionId,
          id: { [Op.ne]: bid.id }
        }
      }
    );

    // Update Redis with new highest bid
    await client.set(redisKey, JSON.stringify({
      amount: amount,
      bidder: {
        id: req.user.id,
        username: req.user.username
      },
      timestamp: new Date()
    }));

    // Update auction's current highest bid in database
    auction.currentHighestBid = amount;
    await auction.save();

    // Get bidder details for response
    const bidder = await User.findByPk(req.user.id, {
      attributes: ['id', 'username']
    });

    // Emit real-time update to all clients in the auction room
    const io = req.app.get('io');
    io.to(`auction:${auctionId}`).emit('newBid', {
      auctionId,
      amount,
      bidder: {
        id: bidder.id,
        username: bidder.username
      },
      timestamp: new Date()
    });

    // Send notification to previous highest bidder (outbid notification)
    if (previousHighestBidder) {
      io.to(`user:${previousHighestBidder.id}`).emit('outbid', {
        auctionId,
        auctionName: auction.itemName,
        newBidAmount: amount,
        message: 'You have been outbid!'
      });
    }

    // Send notification to seller
    io.to(`user:${auction.seller.id}`).emit('newBidOnAuction', {
      auctionId,
      auctionName: auction.itemName,
      bidAmount: amount,
      bidderName: bidder.username,
      message: 'New bid placed on your auction!'
    });

    // Send email notification to seller (async, don't wait)
    sendBidNotification(auction, bidder, auction.seller, amount).catch(console.error);

    res.status(201).json({
      message: 'Bid placed successfully',
      bid: {
        id: bid.id,
        amount: bid.amount,
        auctionId: bid.auctionId,
        bidder: {
          id: bidder.id,
          username: bidder.username
        },
        timestamp: bid.timestamp
      }
    });

  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bids for an auction
router.get('/auction/:auctionId', async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const bids = await Bid.findAll({
      where: { auctionId },
      include: [
        { model: User, as: 'bidder', attributes: ['id', 'username'] }
      ],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json(bids);
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's bids
router.get('/user/my-bids', authenticateToken, async (req, res) => {
  try {
    const bids = await Bid.findAll({
      where: { bidderId: req.user.id },
      include: [
        {
          model: Auction,
          as: 'auction',
          attributes: ['id', 'itemName', 'status', 'endDate'],
          include: [
            { model: User, as: 'seller', attributes: ['id', 'username'] }
          ]
        }
      ],
      order: [['timestamp', 'DESC']]
    });

    res.json(bids);
  } catch (error) {
    console.error('Error fetching user bids:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get highest bid for an auction
router.get('/auction/:auctionId/highest', async (req, res) => {
  try {
    const { auctionId } = req.params;

    // Try to get from Redis first
    const redisKey = `auction:${auctionId}:highest_bid`;
    const redisData = await client.get(redisKey);

    if (redisData) {
      const bidData = JSON.parse(redisData);
      return res.json({
        amount: bidData.amount,
        bidder: bidData.bidder,
        timestamp: bidData.timestamp,
        source: 'redis'
      });
    }

    // Fallback to database
    const highestBid = await Bid.findOne({
      where: { auctionId, isHighest: true },
      include: [
        { model: User, as: 'bidder', attributes: ['id', 'username'] }
      ],
      order: [['timestamp', 'DESC']]
    });

    if (!highestBid) {
      // Get auction starting price
      const auction = await Auction.findByPk(auctionId);
      return res.json({
        amount: auction ? auction.startingPrice : 0,
        bidder: null,
        timestamp: null,
        source: 'starting_price'
      });
    }

    res.json({
      amount: highestBid.amount,
      bidder: {
        id: highestBid.bidder.id,
        username: highestBid.bidder.username
      },
      timestamp: highestBid.timestamp,
      source: 'database'
    });

  } catch (error) {
    console.error('Error fetching highest bid:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;