const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { Op } = require('sequelize');
require('dotenv').config();

// Import configurations
const sequelize = require('./config/database');
const { connectRedis } = require('./config/redis');

// Import models
const { User, Auction, Bid } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');

// Import utilities
const { sendAuctionEndNotification } = require('./utils/emailService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join auction room
  socket.on('joinAuction', (auctionId) => {
    socket.join(`auction:${auctionId}`);
    console.log(`User ${socket.id} joined auction room: ${auctionId}`);
  });

  // Leave auction room
  socket.on('leaveAuction', (auctionId) => {
    socket.leave(`auction:${auctionId}`);
    console.log(`User ${socket.id} left auction room: ${auctionId}`);
  });

  // Join user room for personal notifications
  socket.on('joinUser', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${socket.id} joined user room: ${userId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Auction status checker - runs every minute
const checkAuctionStatus = async () => {
  try {
    const now = new Date();

    // Check for auctions that should start
    const pendingAuctions = await Auction.findAll({
      where: {
        status: 'pending',
        goLiveDate: { [Op.lte]: now }
      }
    });

    for (const auction of pendingAuctions) {
      auction.status = 'active';
      await auction.save();

      // Notify all clients about auction start
      io.emit('auctionStarted', {
        auctionId: auction.id,
        itemName: auction.itemName
      });

      console.log(`Auction ${auction.id} started`);
    }

    // Check for auctions that should end
    const activeAuctions = await Auction.findAll({
      where: {
        status: 'active',
        endDate: { [Op.lte]: now }
      },
      include: [
        { model: User, as: 'seller', attributes: ['id', 'username', 'email'] }
      ]
    });

    for (const auction of activeAuctions) {
      auction.status = 'ended';

      // Find the winner (highest bidder)
      const highestBid = await Bid.findOne({
        where: { auctionId: auction.id, isHighest: true },
        include: [{ model: User, as: 'bidder', attributes: ['id', 'username', 'email'] }]
      });

      if (highestBid) {
        auction.winnerId = highestBid.bidderId;
        auction.finalPrice = highestBid.amount;
      }

      await auction.save();

      // Notify all clients about auction end
      io.to(`auction:${auction.id}`).emit('auctionEnded', {
        auctionId: auction.id,
        winnerId: auction.winnerId,
        finalPrice: auction.finalPrice,
        itemName: auction.itemName
      });

      // Notify seller about auction end
      if (auction.seller) {
        io.to(`user:${auction.seller.id}`).emit('auctionEndedSeller', {
          auctionId: auction.id,
          itemName: auction.itemName,
          finalPrice: auction.finalPrice,
          hasWinner: !!auction.winnerId
        });
      }

      // Notify winner
      if (highestBid && highestBid.bidder) {
        io.to(`user:${highestBid.bidder.id}`).emit('auctionWon', {
          auctionId: auction.id,
          itemName: auction.itemName,
          finalPrice: auction.finalPrice
        });
      }

      console.log(`Auction ${auction.id} ended. Winner: ${auction.winnerId || 'None'}`);
    }

  } catch (error) {
    console.error('Error checking auction status:', error);
  }
};

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    console.log('Connected to Redis');

    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');

    // Start auction status checker
    setInterval(checkAuctionStatus, 60000); // Check every minute
    console.log('Auction status checker started');

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

startServer();

module.exports = app;