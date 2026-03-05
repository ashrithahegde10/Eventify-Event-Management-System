import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  };

  const login = async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    // Update user in state - handle both full user object and partial updates
    const updatedUser = {
      ...user,
      ...updatedUserData,
      // Ensure name is calculated if firstName/lastName are provided
      name: updatedUserData.firstName && updatedUserData.lastName
        ? `${updatedUserData.firstName} ${updatedUserData.lastName}`
        : user.name,
    };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};