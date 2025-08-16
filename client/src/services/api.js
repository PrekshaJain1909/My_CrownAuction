import axios from 'axios';
 
 const API_BASE_URL = process.env.NODE_ENV === 'production' 
   ? '' 
   : 'http://localhost:5000';
 
 const api = axios.create({
   baseURL: `${API_BASE_URL}/api`,
   headers: {
     'Content-Type': 'application/json',
   },
 });
 
 // Request interceptor to add auth token
 api.interceptors.request.use(
   (config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   },
   (error) => {
     return Promise.reject(error);
   }
 );
 
 // Response interceptor to handle auth errors
 api.interceptors.response.use(
   (response) => response,
   (error) => {
     if (error.response?.status === 401) {
       localStorage.removeItem('token');
       localStorage.removeItem('user');
       window.location.href = '/login';
     }
     return Promise.reject(error);
   }
 );
 
 // Auth API
 export const authAPI = {
   register: (userData) => api.post('/auth/register', userData),
   login: (credentials) => api.post('/auth/login', credentials),
 };
 
 // Auction API
 export const auctionAPI = {
   getAll: () => api.get('/auctions'),
   getById: (id) => api.get(`/auctions/${id}`),
   create: (auctionData) => api.post('/auctions', auctionData),
   updateStatus: (id, status) => api.patch(`/auctions/${id}/status, { status }`),
   makeDecision: (id, decision, counterOfferAmount) => 
     api.post(`/auctions/${id}/decision`, { decision, counterOfferAmount }),
   respondToCounterOffer: (id, response) => 
     api.post(`/auctions/${id}/counter-offer-response`, { response }),
   getUserSelling: () => api.get('/auctions/user/selling'),
   getUserWon: () => api.get('/auctions/user/won'),
 };
 
 // Bid API
 export const bidAPI = {
   placeBid: (bidData) => api.post('/bids', bidData),
   getAuctionBids: (auctionId, limit = 50, offset = 0) => 
     api.get(`/bids/auction/${auctionId}?limit=${limit}&offset=${offset}`),
   getUserBids: () => api.get('/bids/user/my-bids'),
   getHighestBid: (auctionId) => api.get(`/bids/auction/${auctionId}/highest`),
 };
 
 // Health check
 export const healthAPI = {
   check: () => api.get('/health'),
 };
 
 export default api;