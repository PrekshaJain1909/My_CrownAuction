import io from 'socket.io-client';
 
 const SOCKET_URL = process.env.NODE_ENV === 'production' 
   ? window.location.origin 
   : 'http://localhost:5000';
 
 class SocketService {
   constructor() {
     this.socket = null;
     this.isConnected = false;
   }
 
   connect() {
     if (!this.socket) {
       this.socket = io(SOCKET_URL, {
         transports: ['websocket', 'polling'],
         upgrade: true,
       });
 
       this.socket.on('connect', () => {
         console.log('Connected to server');
         this.isConnected = true;
       });
 
       this.socket.on('disconnect', () => {
         console.log('Disconnected from server');
         this.isConnected = false;
       });
 
       this.socket.on('connect_error', (error) => {
         console.error('Connection error:', error);
       });
     }
     return this.socket;
   }
 
   disconnect() {
     if (this.socket) {
       this.socket.disconnect();
       this.socket = null;
       this.isConnected = false;
     }
   }
 
   // Join auction room for real-time updates
   joinAuction(auctionId) {
     if (this.socket) {
       this.socket.emit('joinAuction', auctionId);
     }
   }
 
   // Leave auction room
   leaveAuction(auctionId) {
     if (this.socket) {
       this.socket.emit('leaveAuction', auctionId);
     }
   }
 
   // Join user room for personal notifications
   joinUser(userId) {
     if (this.socket) {
       this.socket.emit('joinUser', userId);
     }
   }
 
   // Listen for new bids
   onNewBid(callback) {
     if (this.socket) {
       this.socket.on('newBid', callback);
     }
   }
 
   // Listen for auction end
   onAuctionEnded(callback) {
     if (this.socket) {
       this.socket.on('auctionEnded', callback);
     }
   }
 
   // Listen for auction start
   onAuctionStarted(callback) {
     if (this.socket) {
       this.socket.on('auctionStarted', callback);
     }
   }
 
   // Listen for outbid notifications
   onOutbid(callback) {
     if (this.socket) {
       this.socket.on('outbid', callback);
     }
   }
 
   // Listen for new bid notifications (for sellers)
   onNewBidOnAuction(callback) {
     if (this.socket) {
       this.socket.on('newBidOnAuction', callback);
     }
   }
 
   // Listen for auction ended notifications (for sellers)
   onAuctionEndedSeller(callback) {
     if (this.socket) {
       this.socket.on('auctionEndedSeller', callback);
     }
   }
 
   // Listen for auction won notifications
   onAuctionWon(callback) {
     if (this.socket) {
       this.socket.on('auctionWon', callback);
     }
   }
 
   // Listen for seller decisions
   onSellerDecision(callback) {
     if (this.socket) {
       this.socket.on('sellerDecision', callback);
     }
   }
 
   // Listen for counter offer responses
   onCounterOfferResponse(callback) {
     if (this.socket) {
       this.socket.on('counterOfferResponse', callback);
     }
   }
 
   // Remove all listeners for a specific event
   off(event) {
     if (this.socket) {
       this.socket.off(event);
     }
   }
 
   // Remove all listeners
   removeAllListeners() {
     if (this.socket) {
       this.socket.removeAllListeners();
     }
   }
 
   // Get connection status
   isSocketConnected() {
     return this.isConnected && this.socket?.connected;
   }
 }
 
 // Create a singleton instance
 const socketService = new SocketService();
 
 export default socketService;