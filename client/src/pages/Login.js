import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    const credentials = {
      buyer: { email: 'buyer@demo.com', password: 'password123' },
      seller: { email: 'seller@demo.com', password: 'password123' },
      admin: { email: 'admin@demo.com', password: 'password123' }
    };
    setFormData(credentials[type]);
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="brand-logo">
              <div className="logo-icon">🏛️</div>
              <h1>CrownAuctions</h1>
            </div>
            <h2>Welcome Back</h2>
            <p className="welcome-text">Sign in to access your auctions and continue bidding</p>
          </div>

          {/* Login Form */}
          <div className="form-section">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <div className="input-wrapper">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="form-input"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="signin-btn">
                {loading ? (
                  <div className="loading-content">
                    <div className="spinner"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Demo Section */}
            <div className="demo-section">
              <button 
                type="button" 
                onClick={() => setShowDemo(!showDemo)}
                className="demo-toggle"
              >
                {showDemo ? '← Hide' : '🎭 Try Demo Accounts'}
              </button>
              
              {showDemo && (
                <div className="demo-accounts">
                  <p className="demo-title">Quick Access Demo Accounts:</p>
                  <div className="demo-buttons">
                    <button onClick={() => fillDemoCredentials('buyer')} className="demo-btn buyer">
                      <span className="demo-role">👤 Buyer</span>
                      <span className="demo-email">buyer@demo.com</span>
                    </button>
                    <button onClick={() => fillDemoCredentials('seller')} className="demo-btn seller">
                      <span className="demo-role">🏪 Seller</span>
                      <span className="demo-email">seller@demo.com</span>
                    </button>
                    <button onClick={() => fillDemoCredentials('admin')} className="demo-btn admin">
                      <span className="demo-role">⚙️ Admin</span>
                      <span className="demo-email">admin@demo.com</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Links */}
            <div className="auth-footer">
              <p className="signup-prompt">
                New to CrownAuctions?{' '}
                <Link to="/register" className="signup-link">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          background: linear-gradient(145deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .login-container {
          width: 100%;
          max-width: 440px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .welcome-section {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          padding: 40px 32px 32px;
          text-align: center;
          position: relative;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .logo-icon {
          font-size: 28px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .brand-logo h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .welcome-section h2 {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 8px 0;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .welcome-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin: 0;
          line-height: 1.5;
        }

        .form-section {
          padding: 32px;
        }

        .login-form {
          margin-bottom: 24px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-wrapper label {
          display: block;
          font-size: 15px;
          font-weight: 600;
          color: #065f46;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #a7f3d0;
          border-radius: 12px;
          font-size: 16px;
          color: #064e3b;
          background: #f0fdf4;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #10b981;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
          transform: translateY(-1px);
        }

        .form-input::placeholder {
          color: #6b7280;
        }

        .signin-btn {
          width: 100%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 16px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .signin-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .signin-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .signin-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .demo-section {
          margin: 24px 0;
          padding: 20px;
          background: #f0fdf4;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }

        .demo-toggle {
          background: none;
          border: none;
          color: #059669;
          font-weight: 600;
          cursor: pointer;
          font-size: 15px;
          padding: 0;
          transition: color 0.2s ease;
        }

        .demo-toggle:hover {
          color: #047857;
        }

        .demo-accounts {
          margin-top: 16px;
        }

        .demo-title {
          font-size: 14px;
          color: #065f46;
          margin: 0 0 12px 0;
          font-weight: 500;
        }

        .demo-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .demo-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: white;
          border: 1px solid #d1fae5;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .demo-btn:hover {
          background: #ecfdf5;
          border-color: #a7f3d0;
          transform: translateX(4px);
        }

        .demo-role {
          font-weight: 600;
          color: #065f46;
        }

        .demo-email {
          color: #6b7280;
          font-size: 13px;
        }

        .auth-footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #d1fae5;
        }

        .signup-prompt {
          color: #6b7280;
          font-size: 15px;
          margin: 0;
        }

        .signup-link {
          color: #059669;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .signup-link:hover {
          color: #047857;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-wrapper {
            padding: 12px;
          }
          
          .welcome-section {
            padding: 32px 24px 24px;
          }
          
          .form-section {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;