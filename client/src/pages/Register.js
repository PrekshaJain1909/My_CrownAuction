import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);

      if (result.success) {
        toast.success("Registration successful! Welcome to CrownAuctions!");
        navigate("/");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && formData.username && formData.email) {
      setCurrentStep(2);
    } else if (currentStep === 1) {
      toast.error("Please fill in your username and email");
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  return (
    <div className="signup-wrapper">
      <div className="background-pattern"></div>
      
      <div className="signup-container">
        {/* Left Side - Branding */}
        <div className="branding-panel">
          <div className="brand-content">
            <div className="brand-icon">🎯</div>
            <h1 className="brand-title">CrownAuctions</h1>
            <p className="brand-tagline">Where Every Bid Counts</p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Lightning-fast bidding</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure transactions</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌍</span>
                <span>Global marketplace</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="form-panel">
          <div className="form-container">
            {/* Progress Indicator */}
            <div className="progress-bar">
              <div className="progress-step-wrapper">
                <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                  <span>1</span>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                  <span>2</span>
                </div>
              </div>
              <div className="step-labels">
                <span className={currentStep === 1 ? 'active-label' : ''}>Account Info</span>
                <span className={currentStep === 2 ? 'active-label' : ''}>Security</span>
              </div>
            </div>

            {/* Form Header */}
            <div className="form-header">
              <h2>Create Your Account</h2>
              <p>Join thousands of successful bidders and sellers</p>
            </div>

            {/* Multi-step Form */}
            <form onSubmit={handleSubmit} className="registration-form">
              {currentStep === 1 && (
                <div className="form-step">
                  <div className="field-group">
                    <div className="input-container">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        minLength="3"
                        placeholder=" "
                        className="form-field"
                      />
                      <label htmlFor="username" className="floating-label">Username</label>
                      <div className="field-border"></div>
                    </div>
                  </div>

                  <div className="field-group">
                    <div className="input-container">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder=" "
                        className="form-field"
                      />
                      <label htmlFor="email" className="floating-label">Email Address</label>
                      <div className="field-border"></div>
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="select-label">What brings you here?</label>
                    <div className="role-selection">
                      <label className={`role-option ${formData.role === 'buyer' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="role"
                          value="buyer"
                          checked={formData.role === 'buyer'}
                          onChange={handleChange}
                          hidden
                        />
                        <div className="role-content">
                          <span className="role-emoji">🛒</span>
                          <div>
                            <div className="role-title">I want to buy</div>
                            <div className="role-desc">Bid on amazing items</div>
                          </div>
                        </div>
                      </label>
                      <label className={`role-option ${formData.role === 'seller' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="role"
                          value="seller"
                          checked={formData.role === 'seller'}
                          onChange={handleChange}
                          hidden
                        />
                        <div className="role-content">
                          <span className="role-emoji">💼</span>
                          <div>
                            <div className="role-title">I want to sell</div>
                            <div className="role-desc">Create auctions & earn</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button type="button" onClick={nextStep} className="continue-btn">
                    Continue →
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-step">
                  <div className="field-group">
                    <div className="input-container">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        placeholder=" "
                        className="form-field"
                      />
                      <label htmlFor="password" className="floating-label">Create Password</label>
                      <div className="field-border"></div>
                    </div>
                    <div className="password-strength">
                      <span className={formData.password.length >= 6 ? 'requirement-met' : 'requirement'}>
                        ✓ At least 6 characters
                      </span>
                    </div>
                  </div>

                  <div className="field-group">
                    <div className="input-container">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength="6"
                        placeholder=" "
                        className="form-field"
                      />
                      <label htmlFor="confirmPassword" className="floating-label">Confirm Password</label>
                      <div className="field-border"></div>
                    </div>
                    {formData.confirmPassword && (
                      <div className="password-match">
                        <span className={formData.password === formData.confirmPassword ? 'match-success' : 'match-error'}>
                          {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords don\'t match'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={prevStep} className="back-btn">
                      ← Back
                    </button>
                    <button type="submit" disabled={loading} className="submit-btn">
                      {loading ? (
                        <div className="loading-spinner">
                          <div className="spinner-circle"></div>
                          <span>Creating...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Login Link */}
            <div className="auth-switch">
              <span>Already have an account? </span>
              <Link to="/login" className="switch-link">Sign in instead</Link>
            </div>

            {/* Terms */}
            <div className="terms-notice">
              <p>By signing up, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a></p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .signup-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .background-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%);
          background-size: 100px 100px;
        }

        .signup-container {
          display: flex;
          max-width: 1000px;
          width: 100%;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          position: relative;
          z-index: 1;
        }

        .branding-panel {
          flex: 1;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          padding: 60px 40px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-content {
          text-align: center;
          max-width: 300px;
        }

        .brand-icon {
          font-size: 48px;
          margin-bottom: 20px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }

        .brand-title {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .brand-tagline {
          font-size: 18px;
          opacity: 0.9;
          margin: 0 0 40px 0;
          font-weight: 300;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          opacity: 0.95;
        }

        .feature-icon {
          font-size: 20px;
        }

        .form-panel {
          flex: 1;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
        }

        .progress-bar {
          margin-bottom: 40px;
        }

        .progress-step-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .progress-step {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .progress-step.active {
          background: #10b981;
          color: white;
        }

        .progress-line {
          flex: 1;
          height: 2px;
          background: #e5e7eb;
          margin: 0 16px;
        }

        .step-labels {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #6b7280;
        }

        .active-label {
          color: #10b981 !important;
          font-weight: 600;
        }

        .form-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .form-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .form-header p {
          color: #6b7280;
          font-size: 16px;
          margin: 0;
        }

        .form-step {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .field-group {
          position: relative;
        }

        .input-container {
          position: relative;
        }

        .form-field {
          width: 100%;
          padding: 20px 16px 8px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          background: #fafafa;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-field:focus {
          outline: none;
          border-color: #10b981;
          background: white;
        }

        .floating-label {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          pointer-events: none;
          transition: all 0.3s ease;
          font-size: 16px;
        }

        .form-field:focus + .floating-label,
        .form-field:not(:placeholder-shown) + .floating-label {
          top: 12px;
          font-size: 12px;
          color: #10b981;
          transform: none;
        }

        .field-border {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: #10b981;
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .form-field:focus ~ .field-border {
          transform: scaleX(1);
        }

        .select-label {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .role-selection {
          display: flex;
          gap: 12px;
        }

        .role-option {
          flex: 1;
          cursor: pointer;
        }

        .role-content {
          padding: 20px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .role-option.selected .role-content {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .role-emoji {
          font-size: 24px;
        }

        .role-title {
          font-weight: 600;
          color: #374151;
          font-size: 15px;
        }

        .role-desc {
          font-size: 13px;
          color: #6b7280;
        }

        .password-strength, .password-match {
          margin-top: 8px;
          font-size: 14px;
        }

        .requirement {
          color: #6b7280;
        }

        .requirement-met {
          color: #10b981;
        }

        .match-success {
          color: #10b981;
        }

        .match-error {
          color: #ef4444;
        }

        .continue-btn, .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .continue-btn:hover, .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .form-actions {
          display: flex;
          gap: 12px;
        }

        .back-btn {
          flex: 1;
          background: #f3f4f6;
          color: #374151;
          border: none;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: #e5e7eb;
        }

        .submit-btn {
          flex: 2;
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner-circle {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .auth-switch {
          text-align: center;
          margin: 32px 0 24px;
          color: #6b7280;
          font-size: 15px;
        }

        .switch-link {
          color: #10b981;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .switch-link:hover {
          color: #059669;
          text-decoration: underline;
        }

        .terms-notice {
          text-align: center;
          font-size: 13px;
          color: #9ca3af;
          line-height: 1.5;
        }

        .terms-notice a {
          color: #10b981;
          text-decoration: none;
        }

        .terms-notice a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .signup-container {
            flex-direction: column;
            max-width: 500px;
          }
          
          .branding-panel {
            padding: 40px 20px;
          }
          
          .form-panel {
            padding: 30px 20px;
          }
          
          .role-selection {
            flex-direction: column;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .back-btn, .submit-btn {
            flex: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;