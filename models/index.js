const User = require('./User'); 1
const Auction = require('./Auction');
const Bid = require('./Bid');


// Define associations
User.hasMany(Auction, {foreignKey: 'sellerId', as: 'sellerAuctions' });
User.hasMany (Auction, {foreignKey: 'winnerId', as: 'wonAuctions' });
User.hasMany (Bid, { foreignKey: 'bidderId', as: 'bids' });

Auction.belongsTo(User, {foreignkey: 'sellerId', as: 'seller' });
Auction.belongsTo(User, {foreignKey: 'winnerId', as: 'winner' });
Auction.hasMany (Bid, {foreignkey: 'auctionId', as: 'bids' });

Bid.belongsTo(User, {foreignKey: 'bidderId', as: 'bidder' });
Bid.belongsTo(Auction, {foreignKey: 'auctionId', as: 'auction' });

module.exports = {
User,
Auction,
Bid
};