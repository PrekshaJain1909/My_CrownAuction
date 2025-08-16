import React, { useState } from 'react';

// Mock functions for demo
const mockNavigate = (path) => console.log(`Navigate to: ${path}`);
const mockToast = {
  error: (msg) => console.log(`Error: ${msg}`),
  success: (msg) => console.log(`Success: ${msg}`)
};

const CreateAuction = () => {
  const navigate = mockNavigate;
  const toast = mockToast;
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    startingPrice: '',
    bidIncrement: '',
    goLiveDate: '',
    duration: '60'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.itemName.trim() && formData.description.trim();
      case 2:
        return formData.startingPrice && formData.bidIncrement && 
               parseFloat(formData.startingPrice) > 0 && parseFloat(formData.bidIncrement) > 0;
      case 3:
        return formData.goLiveDate && formData.duration;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please fill in all required fields before continuing');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      toast.error('Please complete all fields');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Auction created successfully!');
      navigate('/dashboard');
      setLoading(false);
    }, 2000);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }
    return `${mins}m`;
  };

  const getEndTime = () => {
    if (formData.goLiveDate && formData.duration) {
      const start = new Date(formData.goLiveDate);
      const end = new Date(start.getTime() + parseInt(formData.duration) * 60000);
      return end.toLocaleString();
    }
    return '';
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
            ${currentStep >= step 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
              : 'bg-gray-200 text-gray-500'}
          `}>
            {currentStep > step ? '✓' : step}
          </div>
          {step < 3 && (
            <div className={`
              w-16 h-1 mx-2 transition-all duration-300
              ${currentStep > step ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  const InputField = ({ label, icon, error, children, helper }) => (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
        <span className="text-lg">{icon}</span>
        {label}
      </label>
      <div className="relative">
        {children}
      </div>
      {helper && (
        <p className="text-sm text-gray-500 mt-1">{helper}</p>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Your Auction</h1>
          <p className="text-gray-600 text-lg">List your item and connect with potential buyers</p>
        </div>

        <StepIndicator />

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-1">
                {currentStep === 1 && "Item Details"}
                {currentStep === 2 && "Pricing Setup"}
                {currentStep === 3 && "Schedule & Launch"}
              </h2>
              <p className="opacity-90">
                {currentStep === 1 && "Tell us about what you're selling"}
                {currentStep === 2 && "Set your starting price and bid rules"}
                {currentStep === 3 && "Choose when and how long to run your auction"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Step 1: Item Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <InputField 
                  label="What are you selling?" 
                  icon="🏷️"
                  helper="Give your item a clear, descriptive name"
                >
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="e.g., Vintage Guitar, Designer Watch, Art Piece..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors duration-200 text-gray-800"
                    maxLength="100"
                  />
                </InputField>

                <InputField 
                  label="Item Description" 
                  icon="📝"
                  helper={`${formData.description.length}/1000 characters - Be detailed to attract more bidders`}
                >
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your item's condition, history, unique features, and why someone would want to bid on it..."
                    rows="6"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors duration-200 text-gray-800 resize-none"
                    maxLength="1000"
                  />
                </InputField>

                {/* Preview Card */}
                {(formData.itemName || formData.description) && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <span>👀</span> Preview
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <h5 className="font-bold text-gray-800">{formData.itemName || 'Your Item Name'}</h5>
                      <p className="text-gray-600 text-sm mt-1">
                        {formData.description || 'Your detailed description will appear here...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField 
                    label="Starting Price" 
                    icon="💰"
                    helper="The minimum price to start bidding"
                  >
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        name="startingPrice"
                        value={formData.startingPrice}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors duration-200 text-gray-800"
                      />
                    </div>
                  </InputField>

                  <InputField 
                    label="Bid Increment" 
                    icon="📈"
                    helper="Minimum amount each new bid must increase"
                  >
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        name="bidIncrement"
                        value={formData.bidIncrement}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors duration-200 text-gray-800"
                      />
                    </div>
                  </InputField>
                </div>

                {formData.startingPrice && formData.bidIncrement && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span>💡</span> Bidding Example
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Starting bid:</span>
                        <span className="font-bold">${parseFloat(formData.startingPrice).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next minimum bid:</span>
                        <span className="font-bold text-green-600">
                          ${(parseFloat(formData.startingPrice) + parseFloat(formData.bidIncrement)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>After that:</span>
                        <span className="font-bold text-green-600">
                          ${(parseFloat(formData.startingPrice) + parseFloat(formData.bidIncrement) * 2).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Schedule */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <InputField 
                  label="When should your auction start?" 
                  icon="🕒"
                  helper="Must be at least 5 minutes from now"
                >
                  <input
                    type="datetime-local"
                    name="goLiveDate"
                    value={formData.goLiveDate}
                    onChange={handleChange}
                    min={getMinDateTime()}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors duration-200 text-gray-800"
                  />
                </InputField>

                <InputField 
                  label="How long should it run?" 
                  icon="⏱️"
                  helper="Choose the duration for your auction"
                >
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-colors duration-200 text-gray-800"
                  >
                    <option value="5">5 minutes (Quick Test)</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                    <option value="480">8 hours</option>
                    <option value="720">12 hours</option>
                    <option value="1440">1 day</option>
                    <option value="2880">2 days</option>
                    <option value="4320">3 days</option>
                    <option value="10080">1 week</option>
                  </select>
                </InputField>

                {/* Timeline Preview */}
                {formData.goLiveDate && formData.duration && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span>📅</span> Auction Timeline
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-800">Starts</p>
                          <p className="text-sm text-gray-600">{new Date(formData.goLiveDate).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="ml-1.5 border-l-2 border-dashed border-green-300 h-4"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-800">Ends</p>
                          <p className="text-sm text-gray-600">{getEndTime()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Duration:</span> {formatDuration(parseInt(formData.duration))}
                      </p>
                    </div>
                  </div>
                )}

                {/* Final Summary */}
                {currentStep === 3 && formData.itemName && formData.startingPrice && (
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span>📋</span> Auction Summary
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Item:</p>
                        <p className="font-medium text-gray-800">{formData.itemName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Starting Price:</p>
                        <p className="font-medium text-green-600">${parseFloat(formData.startingPrice).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Bid Increment:</p>
                        <p className="font-medium text-gray-800">${parseFloat(formData.bidIncrement).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration:</p>
                        <p className="font-medium text-gray-800">{formatDuration(parseInt(formData.duration))}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    ← Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>

              <div>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !validateStep(3)}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        🚀 Launch Auction
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Guidelines Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-green-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📖</span> Auction Guidelines
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">✅ Best Practices</h4>
              <ul className="space-y-1">
                <li>• Use clear, high-quality descriptions</li>
                <li>• Set competitive starting prices</li>
                <li>• Choose reasonable bid increments</li>
                <li>• Respond promptly to bidder questions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">ℹ️ Important Notes</h4>
              <ul className="space-y-1">
                <li>• Details cannot be changed once live</li>
                <li>• You'll receive real-time notifications</li>
                <li>• Payment processing is automated</li>
                <li>• Disputes are handled by our team</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;