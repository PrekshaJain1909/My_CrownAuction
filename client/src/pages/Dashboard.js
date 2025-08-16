import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI, bidAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

const Dashboard = () => {
  const { user, isSeller } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    sellingAuctions: [],
    wonAuctions: [],
    userBids: [],
    stats: {
      totalAuctions: 0,
      activeAuctions: 0,
      completedAuctions: 0,
      totalBids: 0,
      wonAuctions: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const promises = [];
      if (isSeller()) promises.push(auctionAPI.getUserSelling());
      promises.push(auctionAPI.getUserWon());
      promises.push(bidAPI.getUserBids());

      const results = await Promise.all(promises);
      
      let sellingAuctions = [], wonAuctions = [], userBids = [];
      if (isSeller()) {
        [sellingAuctions, wonAuctions, userBids] = results;
      } else {
        [wonAuctions, userBids] = results;
      }

      setData({
        sellingAuctions,
        wonAuctions,
        userBids,
        stats: {
          totalAuctions: sellingAuctions.length,
          activeAuctions: sellingAuctions.filter(a => a.status === 'active').length,
          completedAuctions: sellingAuctions.filter(a => a.status === 'completed').length,
          totalBids: userBids.length,
          wonAuctions: wonAuctions.length
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-200 text-amber-800',
      active: 'bg-green-500 text-white',
      ended: 'bg-gray-400 text-white',
      completed: 'bg-teal-500 text-white',
      cancelled: 'bg-red-400 text-white'
    };
    return badges[status] || 'bg-gray-200 text-gray-800';
  };

  const formatTimeRemaining = (endDate, status) => {
    if (status !== 'active') return status === 'pending' ? 'Not Started' : 'Ended';
    const now = moment();
    const end = moment(endDate);
    if (end.isBefore(now)) return 'Ended';

    const duration = moment.duration(end.diff(now));
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-green-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8">
      <style jsx>{`
        .stat-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          border: 1px solid rgba(16, 185, 129, 0.2);
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 15px rgba(0, 75, 80, 0.1);
        }
       .tab-button {
  position: relative;
  padding: 12px 24px;
  margin: 0 4px;
  font-size: 16px;
  font-weight: 500;
  color: #4b5563;
  background-color: transparent;
  border: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.tab-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.tab-button:active {
  transform: translateY(1px);
}

.tab-button:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background-color: #10b981;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.tab-button.active {
  color: #111827;
  font-weight: 600;
}

.tab-button.active:after {
  width: 100%;
  left: 0;
  transform: translateX(0);
}

/* Optional focus style */
.tab-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}
        .auction-card {
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 75, 80, 0.05);
        }
        .auction-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 15px rgba(0, 75, 80, 0.1);
        }
        .won-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-800">Your Dashboard</h1>
            <p className="text-green-600">
              Welcome back, <span className="font-semibold">{user?.username}</span>!
            </p>
          </div>

          {isSeller() && (
            <Link 
              to="/create-auction" 
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Auction
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          {isSeller() && (
            <>
              <div className="stat-card p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">{data.stats.totalAuctions}</div>
                <div className="text-sm text-green-600">Total Auctions</div>
                <div className="mt-3 h-1 bg-green-100 rounded-full">
                  <div className="h-1 bg-green-400 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="stat-card p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">{data.stats.activeAuctions}</div>
                <div className="text-sm text-green-600">Active Auctions</div>
                <div className="mt-3 h-1 bg-green-100 rounded-full">
                  <div className="h-1 bg-green-400 rounded-full" style={{ width: `${Math.min(100, (data.stats.activeAuctions / data.stats.totalAuctions) * 100 || 0)}%` }}></div>
                </div>
              </div>

              <div className="stat-card p-5 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-700 mb-1">{data.stats.completedAuctions}</div>
                <div className="text-sm text-green-600">Completed</div>
                <div className="mt-3 h-1 bg-green-100 rounded-full">
                  <div className="h-1 bg-green-400 rounded-full" style={{ width: `${Math.min(100, (data.stats.completedAuctions / data.stats.totalAuctions) * 100 || 0)}%` }}></div>
                </div>
              </div>
            </>
          )}

          <div className="stat-card p-5 rounded-xl text-center">
            <div className="text-3xl font-bold text-green-700 mb-1">{data.stats.totalBids}</div>
            <div className="text-sm text-green-600">Total Bids</div>
            <div className="mt-3 h-1 bg-green-100 rounded-full">
              <div className="h-1 bg-green-400 rounded-full" style={{ width: `${Math.min(100, data.stats.totalBids / 20 * 100)}%` }}></div>
            </div>
          </div>

          <div className="stat-card p-5 rounded-xl text-center">
            <div className="text-3xl font-bold text-green-700 mb-1">{data.stats.wonAuctions}</div>
            <div className="text-sm text-green-600">Auctions Won</div>
            <div className="mt-3 h-1 bg-green-100 rounded-full">
              <div className="h-1 bg-green-400 rounded-full" style={{ width: `${Math.min(100, (data.stats.wonAuctions / data.stats.totalBids) * 100 || 0)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-green-100">
          {/* Tabs */}
          <div className="border-b border-green-100">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`tab-button px-5 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'overview' ? 'text-green-700 active' : 'text-green-500 hover:text-green-700'}`}
              >
                Overview
              </button>

              {isSeller() && (
                <button
                  onClick={() => setActiveTab('selling')}
                  className={`tab-button px-5 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'selling' ? 'text-green-700 active' : 'text-green-500 hover:text-green-700'}`}
                >
                  My Auctions ({data.sellingAuctions.length})
                </button>
              )}

              <button
                onClick={() => setActiveTab('bidding')}
                className={`tab-button px-5 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'bidding' ? 'text-green-700 active' : 'text-green-500 hover:text-green-700'}`}
              >
                My Bids ({data.userBids.length})
              </button>

              <button
                onClick={() => setActiveTab('won')}
                className={`tab-button px-5 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'won' ? 'text-green-700 active' : 'text-green-500 hover:text-green-700'}`}
              >
                Won Auctions ({data.wonAuctions.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {isSeller() && data.sellingAuctions.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-green-800">Your Active Auctions</h3>
                      <Link to="/auctions/selling" className="text-sm text-green-600 hover:text-green-800 font-medium">
                        View all
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.sellingAuctions.slice(0, 3).filter(a => a.status === 'active').map(auction => (
                        <div key={auction.id} className="auction-card border border-green-100 rounded-lg overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-green-900">{auction.itemName}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(auction.status)}`}>
                                {auction.status}
                              </span>
                            </div>
                            <p className="text-sm text-green-600 mb-3 line-clamp-2">{auction.description}</p>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-green-500">Current Bid</span>
                              <span className="font-semibold text-green-700">
                                ${parseFloat(auction.currentHighestBid || auction.startingPrice).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-green-500">Time Left</span>
                              <span className="text-sm font-medium text-red-600">
                                {formatTimeRemaining(auction.endDate, auction.status)}
                              </span>
                            </div>
                          </div>
                          <Link 
                            to={`/auctions/${auction.id}`} 
                            className="block w-full py-2 bg-green-50 text-center text-green-700 font-medium text-sm hover:bg-green-100 transition-colors"
                          >
                            View Auction
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.userBids.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-green-800">Recent Bids</h3>
                      <Link to="/bids" className="text-sm text-green-600 hover:text-green-800 font-medium">
                        View all
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {data.userBids.slice(0, 5).map(bid => (
                        <div key={bid.id} className="p-3 border border-green-100 rounded-lg hover:bg-green-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-green-900">{bid.auction?.itemName}</h4>
                              <p className="text-xs text-green-500">
                                {moment(bid.timestamp).format('MMM D, YYYY h:mm A')}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-700">
                                ${parseFloat(bid.amount).toFixed(2)}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(bid.auction?.status)}`}>
                                {bid.auction?.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.wonAuctions.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-green-800">Recently Won</h3>
                      <Link to="/auctions/won" className="text-sm text-green-600 hover:text-green-800 font-medium">
                        View all
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.wonAuctions.slice(0, 2).map(auction => (
                        <div key={auction.id} className="auction-card border border-green-100 rounded-lg overflow-hidden bg-green-50">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-green-900">{auction.itemName}</h4>
                              <span className="text-xs px-2 py-1 rounded-full won-badge text-white">
                                Won
                              </span>
                            </div>
                            <p className="text-sm text-green-600 mb-3 line-clamp-2">{auction.description}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-green-500">Final Price</span>
                                <span className="text-green-700 font-semibold">${parseFloat(auction.finalPrice).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-green-500">Seller</span>
                                <span className="text-green-700">{auction.seller?.username}</span>
                              </div>
                            </div>
                          </div>
                          <Link 
                            to={`/auctions/${auction.id}`} 
                            className="block w-full py-2 bg-green-100 text-center text-green-800 font-medium text-sm hover:bg-green-200 transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!isSeller() || data.sellingAuctions.length === 0) &&
                 data.userBids.length === 0 &&
                 data.wonAuctions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" />
                      </svg> */}
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">Welcome to GreenAuctions!</h3>
                    <p className="text-green-600 mb-4">
                      Start by browsing auctions and placing your first bid.
                    </p>
                    <Link 
                      to="/auctions" 
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Browse Auctions
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Selling Tab */}
            {activeTab === 'selling' && isSeller() && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-green-800">Your Auctions</h3>
                  <Link 
                    to="/create-auction" 
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Auction
                  </Link>
                </div>

                {data.sellingAuctions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-green-100">
                      <thead className="bg-green-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Item</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Current Bid</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Time Left</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Bids</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-green-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-green-100">
                        {data.sellingAuctions.map(auction => (
                          <tr key={auction.id} className="hover:bg-green-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-md flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" />
                                  </svg>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-green-900">{auction.itemName}</div>
                                  <div className="text-sm text-green-500">Started {moment(auction.startDate).format('MMM D')}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(auction.status)}`}>
                                {auction.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900 font-medium">
                              ${parseFloat(auction.currentHighestBid || auction.startingPrice).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                              {auction.status === 'active' ? (
                                <span className="text-red-600 font-medium">
                                  {formatTimeRemaining(auction.endDate, auction.status)}
                                </span>
                              ) : (
                                <span className="text-green-600">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-900">
                              {auction.bidCount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link 
                                to={`/auctions/${auction.id}`} 
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                View
                              </Link>
                              <Link 
                                to={`/auctions/${auction.id}/edit`} 
                                className="text-amber-600 hover:text-amber-900"
                              >
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">No auctions created yet</h3>
                    <p className="text-green-600 mb-4">Create your first auction to start selling items</p>
                    <Link 
                      to="/create-auction" 
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Create Auction
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Bidding Tab */}
            {activeTab === 'bidding' && (
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-6">Your Bidding Activity</h3>

                {data.userBids.length > 0 ? (
                  <div className="space-y-4">
                    {data.userBids.map(bid => (
                      <div key={bid.id} className="auction-card border border-green-100 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-green-900 mb-1">{bid.auction?.itemName}</h4>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(bid.auction?.status)}`}>
                                {bid.auction?.status}
                              </span>
                              <span className="text-xs text-green-500">
                                {moment(bid.timestamp).format('MMM D, YYYY h:mm A')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-green-700">
                              ${parseFloat(bid.amount).toFixed(2)}
                            </div>
                            {bid.isHighest && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                Highest Bid
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-green-100 flex justify-between items-center">
                          <div className="text-sm text-green-600">
                            {bid.auction?.status === 'active' ? (
                              <span>Ends in <span className="font-medium">{formatTimeRemaining(bid.auction?.endDate, bid.auction?.status)}</span></span>
                            ) : bid.auction?.status === 'completed' ? (
                              <span>Auction completed</span>
                            ) : (
                              <span>Auction not started</span>
                            )}
                          </div>
                          <Link 
                            to={`/auctions/${bid.auction?.id}`} 
                            className="text-sm text-green-600 hover:text-green-800 font-medium"
                          >
                            View Auction →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">No bids placed yet</h3>
                    <p className="text-green-600 mb-4">Browse auctions and place your first bid</p>
                    <Link 
                      to="/auctions" 
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Browse Auctions
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Won Tab */}
            {activeTab === 'won' && (
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-6">Auctions You've Won</h3>

                {data.wonAuctions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {data.wonAuctions.map(auction => (
                      <div key={auction.id} className="auction-card border border-green-100 rounded-lg overflow-hidden bg-green-50">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-lg font-semibold text-green-900">{auction.itemName}</h4>
                            <span className="text-xs px-2 py-1 rounded-full won-badge text-white">
                              Won {moment(auction.endDate).format('MMM D')}
                            </span>
                          </div>
                          <p className="text-sm text-green-600 mb-4 line-clamp-2">{auction.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-green-500">Final Price</span>
                              <span className="text-green-700 font-semibold">${parseFloat(auction.finalPrice).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-green-500">Seller</span>
                              <span className="text-green-700">{auction.seller?.username}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-green-500">Your Bids</span>
                              <span className="text-green-700">{auction.userBidCount || 1}</span>
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-green-100 px-5 py-3 bg-white">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-600">Payment Status</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          </div>
                        </div>
                        <Link 
                          to={`/auctions/${auction.id}`} 
                          className="block w-full py-3 text-center bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">No auctions won yet</h3>
                    <p className="text-green-600 mb-4">Keep bidding to win your first auction!</p>
                    <Link 
                      to="/auctions" 
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Browse Auctions
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;