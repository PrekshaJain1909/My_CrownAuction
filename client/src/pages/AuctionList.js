import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionAPI } from '../services/api';
import moment from 'moment';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      const res = await auctionAPI.getAll();
      setAuctions(res.data);
    } catch (err) {
      console.error('Failed to fetch auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'status-pending',
    active: 'status-active',
    ended: 'status-ended',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  };

  const timeLeft = (endDate, status) => {
    if (status !== 'active') return status === 'pending' ? 'Not started' : 'Ended';

    const now = moment();
    const end = moment(endDate);
    if (end.isBefore(now)) return 'Ended';

    const d = moment.duration(end.diff(now));
    const days = Math.floor(d.asDays());
    const h = d.hours();
    const m = d.minutes();

    if (days > 0) return `${days}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const visibleAuctions = auctions.filter(a => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = a.itemName.toLowerCase().includes(q)
      || a.description.toLowerCase().includes(q)
      || a.seller?.username.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const filterCounts = {
    all: auctions.length,
    active: auctions.filter(a => a.status === 'active').length,
    pending: auctions.filter(a => a.status === 'pending').length,
    ended: auctions.filter(a => a.status === 'ended').length,
    completed: auctions.filter(a => a.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Loading auctions...</span>
      </div>
    );
  }

  return (
    <div className="auction-wrapper">
      <div className="auction-header">
        <h1>🌿 Marketplace Auctions</h1>
        <p>
          Showing {visibleAuctions.length} of {auctions.length}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="filter-box">
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search auctions..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="filter-buttons">
            {Object.keys(filterCounts).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`filter-btn ${filter === key ? 'active' : ''}`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)} ({filterCounts[key]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auction Cards */}
      {visibleAuctions.length > 0 ? (
        <div className="auction-grid">
          {visibleAuctions.map((a) => (
            <div key={a.id} className="auction-card">
              <div className="card-header">
                <h2>{a.itemName}</h2>
                <span className={`status-badge ${statusColors[a.status] || ''}`}>
                  {a.status}
                </span>
              </div>

              <div className="card-body">
                <p>
                  {a.description.length > 100 ? a.description.slice(0, 100) + '...' : a.description}
                </p>

                <div className="info-row">
                  <span>Starting:</span>
                  <span>${parseFloat(a.startingPrice).toFixed(2)}</span>
                </div>

                <div className="info-row">
                  <span>Current Bid:</span>
                  <span className="highlight">${parseFloat(a.currentHighestBid || a.startingPrice).toFixed(2)}</span>
                </div>

                <div className="info-row">
                  <span>Seller:</span>
                  <span>{a.seller?.username}</span>
                </div>

                <div className="info-row">
                  <span>{a.status === 'pending' ? 'Starts:' : a.status === 'active' ? 'Time left:' : 'Ended:'}</span>
                  <span className={a.status === 'active' ? 'time-active' : 'time-muted'}>
                    {a.status === 'pending'
                      ? moment(a.goLiveDate).format('MMM D, YYYY HH:mm')
                      : a.status === 'active'
                      ? timeLeft(a.endDate, a.status)
                      : moment(a.endDate).format('MMM D, YYYY HH:mm')}
                  </span>
                </div>

                {a.status === 'ended' && a.winner && (
                  <div className="info-row">
                    <span>Winner:</span>
                    <span className="winner">{a.winner.username}</span>
                  </div>
                )}

                {a.status === 'completed' && (
                  <div className="info-row">
                    <span>Final Price:</span>
                    <span className="final-price">${parseFloat(a.finalPrice).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Link
                to={`/auctions/${a.id}`}
                className={`view-btn ${a.status === 'active' ? 'bid' : 'details'}`}
              >
                {a.status === 'active' ? 'View & Bid' : 'View Details'}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-auctions">
          <h3>{search || filter !== 'all' ? 'No auctions match your search' : 'No auctions available'}</h3>
          <p>
            {search || filter !== 'all' ? 'Try adjusting your search or filters.' : 'Check back later for new listings!'}
          </p>
          {(search || filter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
              className="reset-btn"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* CSS styles inside file */}
      <style>{`
        .auction-wrapper { max-width: 1200px; margin: auto; padding: 2rem; background: #f8fff9; }
        .auction-header { display: flex; flex-direction: column; gap: .3rem; margin-bottom: 1.5rem; }
        .auction-header h1 { font-size: 1.8rem; font-weight: bold; color: #166534; }
        .auction-header p { color: #4b5563; font-size: .9rem; }

        .filter-box { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.05); margin-bottom: 1.5rem; padding: 1rem; }
        .filter-controls { display: flex; flex-direction: column; gap: 1rem; }
        .search-input { border: 1px solid #d1fae5; border-radius: 8px; padding: .5rem; flex: 1; outline: none; transition: border .2s; }
        .search-input:focus { border-color: #34d399; }
        .filter-buttons { display: flex; flex-wrap: wrap; gap: .5rem; }
        .filter-btn { padding: .4rem .8rem; border-radius: 20px; font-size: .85rem; cursor: pointer; background: #e5e7eb; color: #374151; transition: all .2s; }
        .filter-btn.active { background: #10b981; color: #fff; }

        .auction-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); }
        .auction-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,.08); display: flex; flex-direction: column; transition: transform .2s; }
        .auction-card:hover { transform: translateY(-5px); }
        .card-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e5e7eb; }
        .card-header h2 { font-size: 1.1rem; font-weight: 600; color: #15803d; }

        .status-badge { font-size: .7rem; padding: .2rem .5rem; border-radius: 12px; font-weight: 500; text-transform: capitalize; }
        .status-active { background: #16a34a; color: #fff; }
        .status-pending { background: #facc15; color: #1f2937; }
        .status-ended { background: #9ca3af; color: #fff; }
        .status-completed { background: #047857; color: #fff; }
        .status-cancelled { background: #dc2626; color: #fff; }

        .card-body { padding: 1rem; display: flex; flex-direction: column; gap: .6rem; font-size: .9rem; color: #374151; }
        .info-row { display: flex; justify-content: space-between; font-size: .85rem; }
        .highlight { color: #059669; font-weight: 600; }
        .time-active { color: #dc2626; font-weight: 500; }
        .time-muted { color: #6b7280; }
        .winner { color: #15803d; font-weight: 600; }
        .final-price { color: #065f46; font-weight: 700; }

        .view-btn { text-align: center; padding: .6rem; font-weight: 500; transition: all .2s; }
        .view-btn.bid { background: #16a34a; color: #fff; }
        .view-btn.bid:hover { background: #15803d; }
        .view-btn.details { background: #e5e7eb; color: #374151; }
        .view-btn.details:hover { background: #d1d5db; }

        .no-auctions { text-align: center; padding: 4rem 1rem; }
        .no-auctions h3 { color: #374151; font-size: 1.1rem; font-weight: 600; }
        .no-auctions p { color: #9ca3af; font-size: .9rem; margin-top: .3rem; }
        .reset-btn { margin-top: 1rem; padding: .5rem 1rem; background: #10b981; color: #fff; border-radius: 8px; cursor: pointer; transition: background .2s; }
        .reset-btn:hover { background: #059669; }

        .loading-container { display: flex; justify-content: center; align-items: center; height: 16rem; }
        .spinner { width: 2rem; height: 2rem; border: 4px solid #34d399; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; }
        .loading-text { margin-left: .8rem; color: #065f46; font-weight: 500; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AuctionList;
