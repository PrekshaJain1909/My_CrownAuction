const express = require('express');
 const { Auction, User, Bid } = require('../models');
 const { authenticateToken, requireRole } = require('../middleware/auth');
 const { client } = require('../config/redis');
 const moment = require('moment');
 const router = express.Router();
 
 // Get all auctions
 router.get('/', async (req, res) => {
   try {
     const auctions = await Auction.findAll({
       include: [
         { model: User, as: 'seller', attributes: ['id', 'username', 'email'] },
         { model: User, as: 'winner', attributes: ['id', 'username', 'email'] }
       ],
       order: [['createdAt', 'DESC']]
     });
 
     res.json(auctions);
   } catch (error) {
     console.error('Error fetching auctions:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
 });
 
 // Get auction by ID
 router.get('/:id', async (req, res) => {
   try {
     const auction = await Auction.findByPk(req.params.id, {
       include: [
         { model: User, as: 'seller', attributes: ['id', 'username', 'email'] },
         { model: User, as: 'winner', attributes: ['id', 'username', 'email'] },
         { 
           model: Bid, 
           as: 'bids', 
           include: [{ model: User, as: 'bidder', attributes: ['id', 'username'] }],
           order: [['timestamp', 'DESC']]
         }
       ]
     });
 
     if (!auction) {
       return res.status(404).json({ error: 'Auction not found' });
     }
 
     // Get current highest bid from Redis
     const redisKey = `auction:${auction.id}:highest_bid`;
     const highestBidData = await client.get(redisKey);
     
     if (highestBidData) {
       const bidData = JSON.parse(highestBidData);
       auction.dataValues.currentHighestBid = bidData.amount;
       auction.dataValues.highestBidder = bidData.bidder;
     }
 
     res.json(auction);
   } catch (error) {
     console.error('Error fetching auction:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
 });
 
 // Create auction
 router.post('/', authenticateToken, requireRole(['seller', 'admin']), async (req, res) => {
   try {
     const { itemName, description, startingPrice, bidIncrement, goLiveDate, duration } = req.body;
 
     // Calculate end date
     const goLive = new Date(goLiveDate);
     const endDate = new Date(goLive.getTime() + duration * 60000); // duration in minutes
 
     const auction = await Auction.create({
       itemName,
       description,
       startingPrice,
       bidIncrement,
       currentHighestBid: startingPrice,
       goLiveDate: goLive,
       duration,
       endDate,
       sellerId: req.user.id
     });
 
     // Initialize Redis entry for this auction
     const redisKey = `auction:${auction.id}:highest_bid`;
     await client.set(redisKey, JSON.stringify({
       amount: startingPrice,
       bidder: null,
       timestamp: new Date()
     }));
 
     res.status(201).json(auction);
   } catch (error) {
     console.error('Error creating auction:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
 });
 
 // Update auction status (for admin or seller)
 router.patch('/:id/status', authenticateToken, async (req, res) => {
   try {
     const { status } = req.body;
     const auction = await Auction.findByPk(req.params.id);
 
     if (!auction) {
       return res.status(404).json({ error: 'Auction not found' });
     }
 
     // Check if user is seller or admin
     if (auction.sellerId !== req.user.id && req.user.role !== 'admin') {
       return res.status(403).json({ error: 'Unauthorized' });
     }
 
     auction.status = status;
     await auction.save();
 
     res.json(auction);
   } catch (error) {
     console.error('Error updating auction status:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
 });
 
 // Seller decision on auction end
 router.post('/:id/decision', authenticateToken, requireRole(['seller', 'admin']), async (req, res) => {
   try {
     const { decision, counterOfferAmount } = req.body;
     const auction = await Auction.findByPk(req.params.id, {
       include: [
         { model: User, as: 'winner', attributes: ['id', 'username', 'email'] },
         { model: User, as: 'seller', attributes: ['id', 'username', 'email'] }
       ]
     });
 
     if (!auction) {
       return res.status(404).json({ error: 'Auction not found' });
     }
 
     if (auction.sellerId !== req.user.id && req.user.role !== 'admin') {
       return res.status(403).json({ error: 'Unauthorized' });
     }
 
     if (auction.status !== 'ended') {
       return res.status(400).json({ error: 'Auction must be ended to make a decision' });
     }
 
     auction.sellerDecision = decision;
 
     if (decision === 'counter_offered' && counterOfferAmount) {
       auction.counterOfferAmount = counterOfferAmount;
       auction.counterOfferStatus = 'pending';
     }
 
     if (decision === 'accepted') {
       auction.status = 'completed';
       auction.finalPrice = auction.currentHighestBid;
     }
 
     await auction.save();
 
     // Emit socket event for real-time updates
     req.app.get('io').to(`auction:${auction.id}`).emit('sellerDecision', {
       auctionId: auction.id,
       decision,
       counterOfferAmount
     });
 
     res.json(auction);
   } catch (error) {
     console.error('Error processing seller decision:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
 });
 
 // Counter offer response
 router.post('/:id/counter-offer-response', authenticateToken, async (req, res) => {
   try {
     const { response } = req.body; // 'accepted' or 'rejected'
     const auction = await Auction.findByPk(req.params.id, {
       include: [
         { model: User, as: 'winner', attributes: ['id', 'username', 'email'] },
         { model: User, as: 'seller', attributes: ['id', 'username', 'email'] }
       ]
     });
 
     if (!auction) {
       return res.status(404).json({ error: 'Auction not found' });
     }
 
     if (auction.winnerId !== req.user.id) {
       return res.status(403).json({ error: 'Only the winner can respond to counter offers' });
     }
 
     if (auction.sellerDecision !== 'counter_offered' || auction.counterOfferStatus !== 'pending') {
       return res.status(400).json({ error: 'No pending counter offer found' });
     }
 
     auction.counterOfferStatus = response;
 
     if (response === 'accepted') {
       auction.status = 'completed';
       auction.finalPrice = auction.counterOfferAmount;
     } else {
       auction.status = 'ended'; // Back to ended status
     }
 
     await auction.save();
 
     // Emit socket event for real-time updates
     req.app.get('io').to(`auction:${auction.id}`).emit('counterOfferResponse', {
       auctionId: auction.id,
       response,
       finalPrice: auction.finalPrice
     });
 
     res.json(auction);
   } catch (error) {
     console.error('Error processing counter offer response:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
 });
 
 // Get user's auctions (as seller)
 router.get('/user/selling', authenticateToken, async (req, res) => {
   try {
     const auctions = await Auction.findAll({
       where: { sellerId: req.user.id },
       include: [
         { model: User, as: 'winner', attributes: ['id', 'username', 'email'] }
       ],
       order: [['createdAt', 'DESC']]
     });
 
     res.json(auctions);
   } catch (error) {
     console.error('Error fetching user auctions:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
 });
 
 // Get user's won auctions
 router.get('/user/won', authenticateToken, async (req, res) => {
   try {
     const auctions = await Auction.findAll({
       where: { winnerId: req.user.id },
       include: [
         { model: User, as: 'seller', attributes: ['id', 'username', 'email'] }
       ],
       order: [['createdAt', 'DESC']]
     });
 
     res.json(auctions);
   } catch (error) {
     console.error('Error fetching won auctions:', error);
     res.status(500).json({ error: 'Internal server error' });
   }
 });
 
 module.exports = router;