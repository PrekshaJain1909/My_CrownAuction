# Mini Auction System - Real-Time Bidding Platform

A full-stack real-time auction platform built with React.js, Node.js, Socket.IO, PostgreSQL (Supabase), and Redis (Upstash).

## Features

### Core Functionality
- *Real-Time Bidding*: Live bidding with instant updates using WebSockets
- *Auction Management*: Create, view, and manage auctions with detailed information
- *User Authentication*: Secure login/registration with JWT tokens
- *Role-Based Access*: Buyer, Seller, and Admin roles with different permissions
- *Real-Time Notifications*: In-app notifications for bids, outbids, and auction events

### Advanced Features
- *Counter Offers*: Sellers can make counter offers to highest bidders
- *Email Notifications*: Automated email notifications using SendGrid
- *Invoice Generation*: Automatic PDF invoice generation for completed transactions
- *Dashboard*: Comprehensive user dashboard with statistics and activity tracking
- *Responsive Design*: Mobile-friendly interface with modern UI

### Technical Features
- *WebSocket Integration*: Real-time communication using Socket.IO
- *Redis Caching*: Fast bid storage and retrieval using Upstash Redis
- *Database Integration*: PostgreSQL with Sequelize ORM via Supabase
- *Docker Deployment*: Single container deployment ready for Render.com
- *State Management*: React Context API for global state management

## Tech Stack

### Frontend
- *React.js* - User interface framework
- *React Router* - Client-side routing
- *Socket.IO Client* - Real-time communication
- *Axios* - HTTP client for API calls
- *Moment.js* - Date/time manipulation
- *React Toastify* - Toast notifications

### Backend
- *Node.js* - Runtime environment
- *Express.js* - Web application framework
- *Socket.IO* - Real-time bidirectional communication
- *Sequelize* - PostgreSQL ORM
- *JWT* - Authentication tokens
- *bcryptjs* - Password hashing

### Database & Services
- *Supabase (PostgreSQL)* - Primary database
- *Upstash (Redis)* - Caching and session storage
- *SendGrid* - Email service
- *PDFKit* - PDF invoice generation

## Installation & Setup

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account and database
- Upstash Redis instance
- SendGrid account for email services

### Environment Variables
Create a .env file in the root directory with the following variables:

env
# Database Configuration (Supabase)
DATABASE_URL=postgresql://username:password@host:port/database

# Redis Configuration (Upstash)
REDIS_URL=redis://username:password@host:port

# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=your-email@domain.com

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Server Configuration
PORT=5000
NODE_ENV=development


### Local Development

1. *Clone the repository*
   bash
   git clone <repository-url>
   cd mini-auction-system
   

2. *Install dependencies*
   bash
   npm install
   npm run install-client
   

3. *Set up environment variables*
   bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   

4. *Start the development server*
   bash
   npm run dev
   

5. *Access the application*
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production Deployment

#### Docker Deployment
bash
# Build the Docker image
docker build -t mini-auction-system .

# Run the container
docker run -p 5000:5000 --env-file .env mini-auction-system


#### Render.com Deployment
1. Connect your GitHub repository to Render.com
2. Create a new Web Service
3. Set the build command: npm install && npm run install-client && npm run build
4. Set the start command: npm start
5. Add all environment variables from your .env file
6. Deploy the service

## API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login

### Auctions
- GET /api/auctions - Get all auctions
- GET /api/auctions/:id - Get auction by ID
- POST /api/auctions - Create new auction (sellers only)
- PATCH /api/auctions/:id/status - Update auction status
- POST /api/auctions/:id/decision - Seller decision on auction end
- POST /api/auctions/:id/counter-offer-response - Respond to counter offer

### Bids
- POST /api/bids - Place a bid
- GET /api/bids/auction/:auctionId - Get bids for an auction
- GET /api/bids/user/my-bids - Get user's bids
- GET /api/bids/auction/:auctionId/highest - Get highest bid for auction

## WebSocket Events

### Client to Server
- joinAuction - Join auction room for real-time updates
- leaveAuction - Leave auction room
- joinUser - Join user room for personal notifications

### Server to Client
- newBid - New bid placed on auction
- auctionEnded - Auction has ended
- auctionStarted - Auction has started
- outbid - User has been outbid
- sellerDecision - Seller made a decision
- counterOfferResponse - Response to counter offer

## Database Schema

### Users Table
- id (UUID, Primary Key)
- username (String, Unique)
- email (String, Unique)
- password (String, Hashed)
- role (Enum: buyer, seller, admin)

### Auctions Table
- id (UUID, Primary Key)
- itemName (String)
- description (Text)
- startingPrice (Decimal)
- bidIncrement (Decimal)
- currentHighestBid (Decimal)
- goLiveDate (DateTime)
- duration (Integer, minutes)
- endDate (DateTime)
- status (Enum: pending, active, ended, completed, cancelled)
- sellerId (UUID, Foreign Key)
- winnerId (UUID, Foreign Key, Nullable)
- finalPrice (Decimal, Nullable)
- sellerDecision (Enum: pending, accepted, rejected, counter_offered)
- counterOfferAmount (Decimal, Nullable)
- counterOfferStatus (Enum: pending, accepted, rejected, Nullable)

### Bids Table
- id (UUID, Primary Key)
- amount (Decimal)
- auctionId (UUID, Foreign Key)
- bidderId (UUID, Foreign Key)
- isHighest (Boolean)
- timestamp (DateTime)

## Features in Detail

### Real-Time Bidding
- Instant bid updates across all connected clients
- Live auction countdown timers
- Real-time highest bid display
- Automatic auction status updates

### Notification System
- In-app toast notifications for all auction events
- Email notifications for important events
- Outbid notifications for previous highest bidders
- Auction end notifications for sellers and winners

### Counter Offer System
- Sellers can propose counter offers instead of accepting/rejecting
- Winners can accept or reject counter offers
- Real-time updates for counter offer status
- Email notifications for counter offer events

### Invoice Generation
- Automatic PDF invoice generation for completed transactions
- Email delivery to both buyer and seller
- Detailed transaction information
- Professional invoice formatting

## Demo Accounts

For testing purposes, you can use these demo accounts:

- *Buyer*: buyer@demo.com / password123
- *Seller*: seller@demo.com / password123
- *Admin*: admin@demo.com / password123

## Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Acknowledgments

- Built as part of a software engineering internship assignment
- Uses free tier services for cost-effective deployment
- Implements modern web development best practices
- Follows real-time application architecture patterns