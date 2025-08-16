import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isSeller, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navStyles = {
    background: 'linear-gradient(135deg, #2d5016 0%, #4a7c59 50%, #5d8a66 100%)',
    boxShadow: '0 4px 20px rgba(45, 80, 22, 0.3)',
    padding: '0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '3px solid #7fb069'
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  };

  const logoStyles = {
    textDecoration: 'none',
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    letterSpacing: '1px',
    transition: 'all 0.3s ease'
  };

  const linkStyles = {
    textDecoration: 'none',
    color: '#e8f5e8',
    fontSize: '16px',
    fontWeight: '500',
    padding: '8px 16px',
    borderRadius: '25px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  const linkHoverStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    transform: 'translateY(-2px)'
  };

  const userInfoStyles = {
    color: '#b8e6b8',
    fontSize: '14px',
    fontWeight: '500'
  };

  const badgeStyles = {
    admin: {
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    seller: {
      backgroundColor: '#fd7e14',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    buyer: {
      backgroundColor: '#20c997',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  };

  const buttonStyles = {
    primary: {
      backgroundColor: '#7fb069',
      color: 'white',
      border: '2px solid #7fb069',
      padding: '10px 20px',
      borderRadius: '25px',
      fontSize: '14px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#e8f5e8',
      border: '2px solid #7fb069',
      padding: '10px 20px',
      borderRadius: '25px',
      fontSize: '14px',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }
  };

  return (
    <nav style={navStyles}>
      <div style={containerStyles}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          height: '70px' 
        }}>
          {/* Enhanced Logo */}
          <Link to="/" style={logoStyles}>
            <span style={{ marginRight: '8px' }}>🏆</span>
            CrownAuctions
          </Link>

          {/* Navigation Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <Link to="/" style={linkStyles}>
                Home
              </Link>
              <Link to="/auctions" style={linkStyles}>
                Auctions
              </Link>
            </div>

            {isAuthenticated() ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/dashboard" style={linkStyles}>
                  Dashboard
                </Link>
                
                {isSeller() && (
                  <Link to="/create-auction" style={linkStyles}>
                    + New Auction
                  </Link>
                )}

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '8px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '30px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={userInfoStyles}>
                    Hello, {user?.username}
                  </span>
                  <span style={
                    user?.role === 'admin' ? badgeStyles.admin :
                    user?.role === 'seller' ? badgeStyles.seller : badgeStyles.buyer
                  }>
                    {user?.role}
                  </span>
                  <button 
                    onClick={handleLogout}
                    style={buttonStyles.secondary}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc3545';
                      e.target.style.borderColor = '#dc3545';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = '#7fb069';
                      e.target.style.color = '#e8f5e8';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link 
                  to="/login" 
                  style={buttonStyles.primary}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#6a9c54';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#7fb069';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  style={buttonStyles.secondary}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#7fb069';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#e8f5e8';
                  }}
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;