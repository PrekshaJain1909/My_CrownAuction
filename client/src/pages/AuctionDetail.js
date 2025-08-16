import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionAPI, bidAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';
import { toast } from 'react-toastify';
import moment from 'moment';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isSeller } = useAuth();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [makingDecision, setMakingDecision] = useState(false);

  useEffect(() => {
    fetchAuctionDetails();
    fetchBids();
  }, [id]);

  useEffect(() => {
    if (auction) {
      // Join auction room for real-time updates
      socketService.joinAuction(auction.id);

      // Set up real-time listeners
      socketService.onNewBid(handleNewBid);
      socketService.onAuctionEnded(handleAuctionEnded);
      socketService.onSellerDecision(handleSellerDecision);
      socketService.onCounterOfferResponse(handleCounterOfferResponse);

      // Set up timer for active auctions
      if (auction.status === 'active') {
        const timer = setInterval(updateTimeRemaining, 1000);
        return () => {
          clearInterval(timer);
          socketService.leaveAuction(auction.id);
          socketService.off('newBid');
          socketService.off('auctionEnded');
          socketService.off('sellerDecision');
          socketService.off('counterOfferResponse');
        };
      }

      return () => {
        socketService.leaveAuction(auction.id);
        socketService.off('newBid');
        socketService.off('auctionEnded');
        socketService.off('sellerDecision');
        socketService.off('counterOfferResponse');
      };
    }
  }, [auction]);

  const fetchAuctionDetails = async () => {
    try {
      const response = await auctionAPI.getById(id);
      setAuction(response.data);
      updateTimeRemaining(response.data);
    } catch (error) {
      console.error('Error fetching auction:', error);
      toast.error('Failed to load auction details');
      navigate('/auctions');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await bidAPI.getAuctionBids(id);
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const updateTimeRemaining = (auctionData = auction) => {
    if (!auctionData || auctionData.status !== 'active') {
      setTimeRemaining('');
      return;
    }

    const now = moment();
    const end = moment(auctionData.endDate);

    if (end.isBefore(now)) {
      setTimeRemaining('Auction Ended');
      return;
    }

    const duration = moment.duration(end.diff(now));
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    if (days > 0) {
      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    } else if (minutes > 0) {
      setTimeRemaining(`${minutes}m ${seconds}s`);
    } else {
      setTimeRemaining(`${seconds}s`);
    }
  };

  const handleNewBid = (data) => {
    if (data.auctionId === auction.id) {
      // Update auction's current highest bid
      setAuction(prev => ({
        ...prev,
        currentHighestBid: data.amount
      }));

      // Add new bid to the list
      const newBid = {
        id: Date.now(), // Temporary ID
        amount: data.amount,
        bidder: data.bidder,
        timestamp: data.timestamp
      };
      setBids(prev => [newBid, ...prev]);
    }
  };

  const handleAuctionEnded = (data) => {
    if (data.auctionId === auction.id) {
      setAuction(prev => ({
        ...prev,
        status: 'ended',
        winnerId: data.winnerId,
        finalPrice: data.finalPrice
      }));
      setTimeRemaining('Auction Ended');
    }
  };

  const handleSellerDecision = (data) => {
    if (data.auctionId === auction.id) {
      setAuction(prev => ({
        ...prev,
        sellerDecision: data.decision,
        counterOfferAmount: data.counterOfferAmount,
        counterOfferStatus: data.counterOfferAmount ? 'pending' : null
      }));
    }
  };

  const handleCounterOfferResponse = (data) => {
    if (data.auctionId === auction.id) {
      setAuction(prev => ({
        ...prev,
        counterOfferStatus: data.response,
        finalPrice: data.finalPrice,
        status: data.response === 'accepted' ? 'completed' : 'ended'
      }));
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    const minBid = parseFloat(auction.currentHighestBid || auction.startingPrice) + parseFloat(auction.bidIncrement);

    if (amount < minBid) {
      toast.error(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }

    setPlacingBid(true);
    try {
      await bidAPI.placeBid({
        auctionId: auction.id,
        amount: amount
      });

      setBidAmount('');
      toast.success('Bid placed successfully!');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to place bid';
      toast.error(message);
    } finally {
      setPlacingBid(false);
    }
  };

  const handleSellerDecisionSubmit = async (decision) => {
    setMakingDecision(true);
    try {
      await auctionAPI.makeDecision(
        auction.id,
        decision,
        decision === 'counter_offered' ? parseFloat(counterOfferAmount) : null
      );

      toast.success(`Decision submitted: ${decision.replace('_', ' ')}`);
      setCounterOfferAmount('');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to submit decision';
      toast.error(message);
    } finally {
      setMakingDecision(false);
    }
  };

  const handleCounterOfferResponseSubmit = async (response) => {
    try {
      await auctionAPI.respondToCounterOffer(auction.id, response);
      toast.success(`Counter offer ${response}`);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to respond to counter offer';
      toast.error(message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      active: 'badge-success',
      ended: 'badge-info',
      completed: 'badge-secondary',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  };

  const canPlaceBid = () => {
    return isAuthenticated() &&
           auction.status === 'active' &&
           auction.sellerId !== user?.id;
  };

  const isAuctionSeller = () => {
    return isAuthenticated() && auction.sellerId === user?.id;
  };

  const isAuctionWinner = () => {
    return isAuthenticated() && auction.winnerId === user?.id;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center">
          <div className="spinner"></div>
          <p>Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container">
        <div className="text-center">
          <h4>Auction not found</h4>
          <button onClick={() => navigate('/auctions')} className="btn btn-primary">
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Main Content */}
        <div>
          {/* Auction Header */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h1 className="card-title mb-0">{auction.itemName}</h1>
              <span className={`badge ${getStatusBadge(auction.status)}`}>
                {auction.status}
              </span>
            </div>

            <div>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                {auction.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div className="mb-3">
                    <strong>Seller:</strong> {auction.seller?.username}
                  </div>
                  <div className="mb-3">
                    <strong>Starting Price:</strong> ${parseFloat(auction.startingPrice).toFixed(2)}
                  </div>
                  <div className="mb-3">
                    <strong>Bid Increment:</strong> ${parseFloat(auction.bidIncrement).toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="mb-3">
                    <strong>Started:</strong> {moment(auction.goLiveDate).format('MMM DD, YYYY HH:mm')}
                  </div>
                  <div className="mb-3">
                    <strong>Ends:</strong> {moment(auction.endDate).format('MMM DD, YYYY HH:mm')}
                  </div>
                  {auction.status === 'active' && timeRemaining && (
                    <div className="mb-3">
                      <strong style={{ color: '#DC3545' }}>Time Remaining:</strong>
                      <span style={{ color: '#DC3545', fontWeight: 'bold', marginLeft: '8px' }}>
                        {timeRemaining}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bidding History */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Bidding History</h3>
            </div>

            {bids.length > 0 ? (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {bids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`d-flex justify-content-between align-items-center p-3 ${
                      index === 0 ? 'bg-light' : ''
                    }`}
                    style={{ borderBottom: '1px solid #eee' }}
                  >
                    <div>
                      <strong>${parseFloat(bid.amount).toFixed(2)}</strong>
                      <span style={{ marginLeft: '10px', color: '#666' }}>
                        by {bid.bidder?.username}
                      </span>
                      {index === 0 && (
                        <span className="badge badge-success ml-2">Highest Bid</span>
                      )}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {moment(bid.timestamp).format('MMM DD, HH:mm:ss')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p style={{ color: '#666' }}>No bids placed yet</p>
                <p style={{ color: '#999', fontSize: '14px' }}>
                  Starting price: ${parseFloat(auction.startingPrice).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Current Bid Card */}
          <div className="card mb-4">
            <div className="card-header text-center">
              <h4 className="card-title mb-0">Current Highest Bid</h4>
            </div>

            <div className="text-center">
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#007BFF', marginBottom: '10px' }}>
                ${parseFloat(auction.currentHighestBid || auction.startingPrice).toFixed(2)}
              </div>

              {bids.length > 0 && (
                <div style={{ color: '#666', marginBottom: '15px' }}>
                  by {bids[0]?.bidder?.username}
                </div>
              )}

              {auction.status === 'active' && (
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Next bid: ${(parseFloat(auction.currentHighestBid || auction.startingPrice) + parseFloat(auction.bidIncrement)).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Bidding Form */}
          {canPlaceBid() && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Place Your Bid</h5>
              </div>

              <form onSubmit={handlePlaceBid}>
                <div className="form-group">
                  <label htmlFor="bidAmount" className="form-label">Bid Amount ($)</label>
                  <input
                    type="number"
                    id="bidAmount"
                    className="form-control"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={parseFloat(auction.currentHighestBid || auction.startingPrice) + parseFloat(auction.bidIncrement)}
                    step="0.01"
                    required
                    placeholder={`Min: $${(parseFloat(auction.currentHighestBid || auction.startingPrice) + parseFloat(auction.bidIncrement)).toFixed(2)}`}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={placingBid}
                >
                  {placingBid ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
                      Placing Bid...
                    </>
                  ) : (
                    'Place Bid'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Seller Decision Panel */}
          {isAuctionSeller() && auction.status === 'ended' && auction.sellerDecision === 'pending' && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Make Your Decision</h5>
              </div>

              <div>
                <p style={{ marginBottom: '15px' }}>
                  Final bid: <strong>${parseFloat(auction.finalPrice || auction.currentHighestBid).toFixed(2)}</strong>
                </p>

                <div className="d-flex flex-column" style={{ gap: '10px' }}>
                  <button
                    className="btn btn-success"
                    onClick={() => handleSellerDecisionSubmit('accepted')}
                    disabled={makingDecision}
                  >
                    Accept Bid
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleSellerDecisionSubmit('rejected')}
                    disabled={makingDecision}
                  >
                    Reject Bid
                  </button>

                  <div>
                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder="Counter offer amount"
                      value={counterOfferAmount}
                      onChange={(e) => setCounterOfferAmount(e.target.value)}
                      step="0.01"
                    />
                    <button
                      className="btn btn-warning w-100"
                      onClick={() => handleSellerDecisionSubmit('counter_offered')}
                      disabled={makingDecision || !counterOfferAmount}
                    >
                      Make Counter Offer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Counter Offer Response Panel */}
          {isAuctionWinner() && auction.sellerDecision === 'counter_offered' && auction.counterOfferStatus === 'pending' && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Counter Offer</h5>
              </div>

              <div>
                <p style={{ marginBottom: '15px' }}>
                  Your bid: <strong>${parseFloat(auction.finalPrice || auction.currentHighestBid).toFixed(2)}</strong><br/>
                  Counter offer: <strong>${parseFloat(auction.counterOfferAmount).toFixed(2)}</strong>
                </p>

                <div className="d-flex" style={{ gap: '10px' }}>
                  <button
                    className="btn btn-success"
                    onClick={() => handleCounterOfferResponseSubmit('accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleCounterOfferResponseSubmit('rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {auction.status === 'completed' && (
            <div className="alert alert-success">
              <h6>:tada: Auction Completed!</h6>
              <p>Final price: <strong>${parseFloat(auction.finalPrice).toFixed(2)}</strong></p>
              {auction.winner && (
                <p>Winner: <strong>{auction.winner.username}</strong></p>
              )}
            </div>
          )}

          {auction.status === 'ended' && auction.sellerDecision === 'rejected' && (
            <div className="alert alert-info">
              <h6>Auction Ended</h6>
              <p>The seller rejected the highest bid.</p>
            </div>
          )}

          {!isAuthenticated() && auction.status === 'active' && (
            <div className="alert alert-warning">
              <h6>Login Required</h6>
              <p>Please login to place bids on this auction.</p>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-sm"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;