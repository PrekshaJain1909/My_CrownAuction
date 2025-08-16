import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket';

const NotificationManager = () => {
  const { user, isAuthenticated } = useAuth();

  // Custom green-themed toast configurations
  const notificationStyles = {
    success: {
      position: "top-right",
      autoClose: 9000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        fontSize: '15px',
        fontWeight: '500'
      }
    },
    warning: {
      position: "top-right",
      autoClose: 8500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        fontSize: '15px',
        fontWeight: '500'
      }
    },
    info: {
      position: "top-right",
      autoClose: 7500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        fontSize: '15px',
        fontWeight: '500'
      }
    },
    error: {
      position: "top-right",
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        fontSize: '15px',
        fontWeight: '500'
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated() || !user) return;

    // Establish socket connection with enhanced error handling
    const initializeConnection = () => {
      try {
        if (!socketService.isSocketConnected()) {
          socketService.connect();
          socketService.joinUser(user.id);
        }
      } catch (error) {
        console.error('Socket connection failed:', error);
      }
    };

    initializeConnection();

    // Enhanced outbid notification with custom styling
    const handleBidOvertaken = (data) => {
      toast.warning(
        `🔔 Bid Alert: You've been outbid on "${data.auctionName}"!\nNew leading bid: $${data.newBidAmount.toLocaleString()}`,
        notificationStyles.warning
      );
    };

    // Enhanced new bid notification for auction owners
    const handleIncomingBid = (data) => {
      toast.info(
        `💰 New Bid Alert: $${data.bidAmount.toLocaleString()} placed on "${data.auctionName}"\nBidder: ${data.bidderName}`,
        notificationStyles.info
      );
    };

    // Enhanced auction completion notification for sellers
    const handleAuctionCompletion = (data) => {
      if (data.hasWinner) {
        toast.success(
          `🎯 Auction Complete: "${data.auctionName}" has ended!\nFinal Price: $${data.finalPrice.toLocaleString()}\nAwaiting your decision...`,
          notificationStyles.success
        );
      } else {
        toast.info(
          `⏰ Auction Ended: "${data.auctionName}" concluded with no bids.\nConsider relisting with adjusted parameters.`,
          notificationStyles.info
        );
      }
    };

    // Enhanced victory notification
    const handleAuctionVictory = (data) => {
      toast.success(
        `🏆 Victory! You've won "${data.auctionName}"!\nWinning Bid: $${data.finalPrice.toLocaleString()}\nCongratulations on your successful bid!`,
        notificationStyles.success
      );
    };

    // Enhanced seller decision notifications
    const handleSellerResponse = (data) => {
      switch (data.decision) {
        case 'accepted':
          toast.success(
            `✅ Bid Accepted! The seller approved your offer.\nExpect confirmation details via email shortly.`,
            notificationStyles.success
          );
          break;
        case 'rejected':
          toast.error(
            `❌ Bid Declined: The seller has rejected your offer.\nConsider browsing other available auctions.`,
            notificationStyles.error
          );
          break;
        case 'counter_offered':
          toast.warning(
            `🔄 Counter Offer: Seller proposes $${data.counterOfferAmount.toLocaleString()}\nReview and respond to proceed with the transaction.`,
            notificationStyles.warning
          );
          break;
        default:
          break;
      }
    };

    // Enhanced counter offer response notifications
    const handleCounterResponse = (data) => {
      if (data.response === 'accepted') {
        toast.success(
          `🤝 Deal Sealed! Counter offer accepted.\nFinal Amount: $${data.finalPrice.toLocaleString()}\nTransaction proceeding...`,
          notificationStyles.success
        );
      } else {
        toast.info(
          `📋 Counter offer declined by buyer.\nYou may consider adjusting your offer or exploring other options.`,
          notificationStyles.info
        );
      }
    };

    // Enhanced auction launch notification
    const handleAuctionLaunch = (data) => {
      toast.info(
        `🚀 Live Now: "${data.itemName}" auction has begun!\nDon't miss out on this opportunity.`,
        notificationStyles.info
      );
    };

    // Advanced notification for urgent bidding opportunities
    const handleUrgentBidding = (data) => {
      toast.warning(
        `⚡ Final Minutes: "${data.auctionName}" ending soon!\nCurrent bid: $${data.currentBid.toLocaleString()}`,
        notificationStyles.warning
      );
    };

    // Register all event listeners with enhanced error handling
    try {
      socketService.onOutbid(handleBidOvertaken);
      socketService.onNewBidOnAuction(handleIncomingBid);
      socketService.onAuctionEndedSeller(handleAuctionCompletion);
      socketService.onAuctionWon(handleAuctionVictory);
      socketService.onSellerDecision(handleSellerResponse);
      socketService.onCounterOfferResponse(handleCounterResponse);
      socketService.onAuctionStarted(handleAuctionLaunch);
      
      // Additional event listener for urgent notifications
      socketService.on('urgentBidding', handleUrgentBidding);
    } catch (error) {
      console.error('Failed to register notification listeners:', error);
    }

    // Comprehensive cleanup function
    return () => {
      try {
        socketService.off('outbid');
        socketService.off('newBidOnAuction');
        socketService.off('auctionEndedSeller');
        socketService.off('auctionWon');
        socketService.off('sellerDecision');
        socketService.off('counterOfferResponse');
        socketService.off('auctionStarted');
        socketService.off('urgentBidding');
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };
  }, [user, isAuthenticated]);

  // This component operates invisibly in the background
  return null;
};

export default NotificationManager;