import React, { createContext, useContext, useState, useEffect } from 'react';
 import { authAPI } from '../services/api';
 import socketService from '../services/socket';
 
 const AuthContext = createContext();
 
 export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) {
     throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
 };
 
 export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [token, setToken] = useState(localStorage.getItem('token'));
 
   useEffect(() => {
     // Check if user is logged in on app start
     const storedUser = localStorage.getItem('user');
     const storedToken = localStorage.getItem('token');
     
     if (storedUser && storedToken) {
       try {
         const parsedUser = JSON.parse(storedUser);
         setUser(parsedUser);
         setToken(storedToken);
         
         // Connect to socket and join user room
         socketService.connect();
         socketService.joinUser(parsedUser.id);
       } catch (error) {
         console.error('Error parsing stored user:', error);
         localStorage.removeItem('user');
         localStorage.removeItem('token');
       }
     }
     
     setLoading(false);
   }, []);
 
   const login = async (email, password) => {
     try {
       const response = await authAPI.login({ email, password });
       const { token: newToken, user: userData } = response.data;
       
       // Store in localStorage
       localStorage.setItem('token', newToken);
       localStorage.setItem('user', JSON.stringify(userData));
       
       // Update state
       setToken(newToken);
       setUser(userData);
       
       // Connect to socket and join user room
       socketService.connect();
       socketService.joinUser(userData.id);
       
       return { success: true, user: userData };
     } catch (error) {
       const message = error.response?.data?.error || 'Login failed';
       return { success: false, error: message };
     }
   };
 
   const register = async (userData) => {
     try {
       const response = await authAPI.register(userData);
       const { token: newToken, user: newUser } = response.data;
       
       // Store in localStorage
       localStorage.setItem('token', newToken);
       localStorage.setItem('user', JSON.stringify(newUser));
       
       // Update state
       setToken(newToken);
       setUser(newUser);
       
       // Connect to socket and join user room
       socketService.connect();
       socketService.joinUser(newUser.id);
       
       return { success: true, user: newUser };
     } catch (error) {
       const message = error.response?.data?.error || 'Registration failed';
       return { success: false, error: message };
     }
   };
 
   const logout = () => {
     // Clear localStorage
     localStorage.removeItem('token');
     localStorage.removeItem('user');
     
     // Clear state
     setToken(null);
     setUser(null);
     
     // Disconnect socket
     socketService.disconnect();
   };
 
   const isAuthenticated = () => {
     return !!token && !!user;
   };
 
   const isSeller = () => {
     return user?.role === 'seller' || user?.role === 'admin';
   };
 
   const isAdmin = () => {
     return user?.role === 'admin';
   };
 
   const value = {
     user,
     token,
     loading,
     login,
     register,
     logout,
     isAuthenticated,
     isSeller,
     isAdmin,
   };
 
   return (
     <AuthContext.Provider value={value}>
       {children}
     </AuthContext.Provider>
   );
 };
 
 export default AuthContext;