import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../services/api';
import moment from 'moment';

const Home = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    ended: 0
  });
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    fetchFeaturedAuctions();
  }, []);

  const fetchFeaturedAuctions = async () => {
    try {
      const response = await auctionAPI.getAll();
      const auctions = response.data;

      // Get featured auctions (active ones, limited to 6)
      const activeAuctions = auctions
        .filter(auction => auction.status === 'active')
        .slice(0, 6);

      setFeaturedAuctions(activeAuctions);

      // Calculate stats
      setStats({
        total: auctions.length,
        active: auctions.filter(a => a.status === 'active').length,
        ended: auctions.filter(a => a.status === 'ended' || a.status === 'completed').length
      });
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      active: 'status-active',
      ended: 'status-ended',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return badges[status] || 'status-default';
  };

  const formatTimeRemaining = (endDate) => {
    const now = moment();
    const end = moment(endDate);

    if (end.isBefore(now)) {
      return 'Ended';
    }

    const duration = moment.duration(end.diff(now));
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="home-wrapper">
      {/* Hero Section with Animated Background */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-element element-1">💎</div>
          <div className="floating-element element-2">🏆</div>
          <div className="floating-element element-3">💰</div>
          <div className="floating-element element-4">⚡</div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-text">🔥 Live Auctions Available</span>
          </div>
          
          <h1 className="hero-title">
            Discover Treasures at
            <span className="highlight-text"> AuctionHub</span>
          </h1>
          
          <p className="hero-subtitle">
            Join the excitement of live bidding and discover amazing deals. 
            From collectibles to electronics, find what you're looking for.
          </p>
          
          <div className="hero-actions">
            <Link to="/auctions" className="cta-primary">
              <span>Start Bidding</span>
              <div className="button-shine"></div>
            </Link>
            <Link to="/register" className="cta-secondary">
              <span>Join Community</span>
            </Link>
          </div>

          {/* Live Stats Bar */}
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Auctions</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item pulse">
              <div className="stat-number">{stats.active}</div>
              <div className="stat-label">Live Now</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">{stats.ended}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Auctions Section */}
      <section className="auctions-section">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">Live Auctions</h2>
            <p className="section-subtitle">Bid now before time runs out</p>
          </div>
          
          <div className="auction-tabs">
            <button 
              className={`tab-button ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={() => setActiveTab('trending')}
            >
              🔥 Trending
            </button>
            <button 
              className={`tab-button ${activeTab === 'ending' ? 'active' : ''}`}
              onClick={() => setActiveTab('ending')}
            >
              ⏰ Ending Soon
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <p>Loading amazing auctions...</p>
          </div>
        ) : featuredAuctions.length > 0 ? (
          <div className="auctions-grid">
            {featuredAuctions.map((auction, index) => (
              <div key={auction.id} className="auction-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="card-header">
                  <div className="item-category">📦 General</div>
                  <div className={`status-badge ${getStatusBadge(auction.status)}`}>
                    {auction.status}
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="item-title">{auction.itemName}</h3>
                  <p className="item-description">
                    {auction.description.length > 80
                      ? `${auction.description.substring(0, 80)}...`
                      : auction.description
                    }
                  </p>
                  
                  <div className="auction-details">
                    <div className="detail-row">
                      <span className="detail-label">Current Bid</span>
                      <span className="current-bid">
                        ${parseFloat(auction.currentHighestBid || auction.startingPrice).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Seller</span>
                      <span className="seller-name">{auction.seller?.username}</span>
                    </div>
                    
                    {auction.status === 'active' && (
                      <div className="detail-row">
                        <span className="detail-label">Time Left</span>
                        <span className="time-remaining">
                          {formatTimeRemaining(auction.endDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="card-footer">
                  <Link to={`/auctions/${auction.id}`} className="bid-button">
                    <span>Place Bid</span>
                    <div className="button-arrow">→</div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <h3>No Active Auctions</h3>
            <p>Be the first to know when new auctions go live!</p>
            <Link to="/register" className="empty-cta">Get Notified</Link>
          </div>
        )}
        
        <div className="section-footer">
          <Link to="/auctions" className="view-all-link">
            View All Auctions
            <span className="link-arrow">↗</span>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Why Bidders Choose Us</h2>
          <p>Experience the future of online auctions</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon lightning">⚡</div>
            <h3>Instant Bidding</h3>
            <p>Lightning-fast bid processing with real-time updates. Never miss a beat in the auction action.</p>
            <div className="feature-highlight">Real-time sync</div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon shield">🛡️</div>
            <h3>Secure Platform</h3>
            <p>Bank-level security with encrypted transactions and verified seller profiles for peace of mind.</p>
            <div className="feature-highlight">256-bit encryption</div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon bell">🔔</div>
            <h3>Smart Alerts</h3>
            <p>Get notified instantly when you're outbid or when auctions you're watching are ending soon.</p>
            <div className="feature-highlight">Push notifications</div>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon handshake">🤝</div>
            <h3>Fair Trading</h3>
            <p>Transparent bidding process with counter-offer options and dispute resolution support.</p>
            <div className="feature-highlight">100% transparent</div>
          </div>
        </div>
      </section>

      <style>{`
        .home-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .hero-section {
          position: relative;
          padding: 80px 20px 60px;
          overflow: hidden;
          background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%);
          color: white;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }

        .floating-element {
          position: absolute;
          font-size: 40px;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .element-1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .element-2 {
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .element-3 {
          bottom: 30%;
          left: 20%;
          animation-delay: 4s;
        }

        .element-4 {
          top: 40%;
          right: 30%;
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        .hero-content {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          z-index: 2;
        }

        .hero-badge {
          display: inline-block;
          margin-bottom: 24px;
        }

        .badge-text {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          margin: 0 0 24px 0;
          line-height: 1.2;
        }

        .highlight-text {
          background: linear-gradient(135deg, #a7f3d0, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin: 0 0 40px 0;
          opacity: 0.9;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 60px;
          flex-wrap: wrap;
        }

        .cta-primary, .cta-secondary {
          position: relative;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          text-decoration: none;
          transition: all 0.3s ease;
          overflow: hidden;
          display: inline-block;
        }

        .cta-primary {
          background: linear-gradient(135deg, #ffffff, #f0fdf4);
          color: #065f46;
          border: 2px solid transparent;
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255, 255, 255, 0.3);
          color: #065f46;
          text-decoration: none;
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.6s;
        }

        .cta-primary:hover .button-shine {
          left: 100%;
        }

        .cta-secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .cta-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
          color: white;
          text-decoration: none;
        }

        .stats-bar {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 24px 40px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin: 0 auto;
          max-width: 500px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-item.pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.3);
        }

        .auctions-section {
          padding: 80px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #064e3b;
          margin: 0 0 8px 0;
        }

        .section-subtitle {
          color: #16a34a;
          font-size: 1.125rem;
          margin: 0;
        }

        .auction-tabs {
          display: flex;
          gap: 8px;
        }

        .tab-button {
          padding: 12px 20px;
          border: 2px solid #bbf7d0;
          background: white;
          color: #16a34a;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button.active {
          background: #16a34a;
          color: white;
          border-color: #16a34a;
        }

        .tab-button:hover:not(.active) {
          background: #f0fdf4;
          border-color: #16a34a;
        }

        .loading-container {
          text-align: center;
          padding: 80px 20px;
          color: #16a34a;
        }

        .loading-spinner {
          position: relative;
          margin: 0 auto 24px;
          width: 60px;
          height: 60px;
        }

        .spinner-ring {
          position: absolute;
          border: 3px solid transparent;
          border-top: 3px solid #16a34a;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-ring:nth-child(1) {
          width: 60px;
          height: 60px;
          animation-delay: 0s;
        }

        .spinner-ring:nth-child(2) {
          width: 45px;
          height: 45px;
          top: 7.5px;
          left: 7.5px;
          animation-delay: -0.3s;
        }

        .spinner-ring:nth-child(3) {
          width: 30px;
          height: 30px;
          top: 15px;
          left: 15px;
          animation-delay: -0.6s;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .auctions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .auction-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.1);
          border: 1px solid #d1fae5;
          transition: all 0.3s ease;
          animation: slideUp 0.6s ease forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .auction-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(34, 197, 94, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px 0;
        }

        .item-category {
          font-size: 0.875rem;
          color: #16a34a;
          font-weight: 500;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-active {
          background: #dcfce7;
          color: #166534;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-ended {
          background: #e5e7eb;
          color: #374151;
        }

        .card-content {
          padding: 16px 20px;
        }

        .item-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #064e3b;
          margin: 0 0 12px 0;
        }

        .item-description {
          color: #6b7280;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }

        .auction-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .current-bid {
          font-size: 1.125rem;
          font-weight: 700;
          color: #16a34a;
        }

        .seller-name {
          color: #374151;
          font-weight: 600;
        }

        .time-remaining {
          color: #dc2626;
          font-weight: 600;
          background: #fef2f2;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .card-footer {
          padding: 0 20px 20px;
        }

        .bid-button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, #16a34a, #059669);
          color: white;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .bid-button:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateX(4px);
          color: white;
          text-decoration: none;
        }

        .button-arrow {
          font-size: 1.25rem;
          transition: transform 0.3s ease;
        }

        .bid-button:hover .button-arrow {
          transform: translateX(4px);
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 24px;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          color: #374151;
          margin: 0 0 12px 0;
        }

        .empty-state p {
          margin: 0 0 32px 0;
          font-size: 1.125rem;
        }

        .empty-cta {
          display: inline-block;
          padding: 12px 24px;
          background: #16a34a;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .empty-cta:hover {
          background: #059669;
          transform: translateY(-2px);
          color: white;
          text-decoration: none;
        }

        .section-footer {
          text-align: center;
        }

        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #16a34a;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.125rem;
          transition: all 0.3s ease;
        }

        .view-all-link:hover {
          color: #059669;
          text-decoration: none;
        }

        .link-arrow {
          transition: transform 0.3s ease;
        }

        .view-all-link:hover .link-arrow {
          transform: translateX(4px) translateY(-4px);
        }

        .features-section {
          background: white;
          padding: 80px 20px;
          border-top: 1px solid #d1fae5;
        }

        .features-header {
          text-align: center;
          margin-bottom: 60px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .features-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #064e3b;
          margin: 0 0 16px 0;
        }

        .features-header p {
          font-size: 1.25rem;
          color: #6b7280;
          margin: 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: #f9fafb;
          padding: 32px 24px;
          border-radius: 20px;
          text-align: center;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          border-color: #bbf7d0;
          background: white;
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 20px;
          display: block;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #064e3b;
          margin: 0 0 16px 0;
        }

        .feature-card p {
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        .feature-highlight {
          display: inline-block;
          padding: 6px 12px;
          background: #dcfce7;
          color: #166534;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .cta-primary, .cta-secondary {
            width: 100%;
            max-width: 280px;
          }
          
          .stats-bar {
            flex-direction: column;
            gap: 20px;
            padding: 20px;
          }
          
          .stat-divider {
            width: 60px;
            height: 1px;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .auctions-grid {
            grid-template-columns: 1fr;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;