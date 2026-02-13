// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// IMPORTANT: iOS Simulator ke liye localhost kaam karta hai
// Real device ke liye apne computer ka IP use karo
// Example: const API_BASE_URL = 'http://192.168.1.100:8080/api';
const API_BASE_URL = 'http://192.168.1.11:8080/api';

// Axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - har request mein token add karo
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - errors handle karo
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout kar do
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// =====================================================
// USER SERVICE APIs
// =====================================================

/**
 * User Registration
 * @param {Object} userData - {username, email, password, fullName, phoneNumber}
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed';
  }
};

/**
 * User Login
 * @param {Object} credentials - {usernameOrEmail, password}
 */
export const loginUser = async (credentials) => {
  try {
    console.log('Login Request:', credentials);
    const response = await api.post('/users/login', credentials);
    console.log('Login Response:', response.data);
    if (response.data.success && response.data.data.token) {
      // Token aur user data save karo
      await AsyncStorage.setItem('authToken', response.data.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

/**
 * Get User Profile
 * @param {number} userId 
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch profile';
  }
};

/**
 * Logout User
 */
export const logoutUser = async () => {
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('user');
};

// =====================================================
// TRANSACTION SERVICE APIs
// =====================================================

/**
 * Add New Transaction
 * @param {Object} transactionData - {userId, amount, type, category, description, transactionDate, paymentMethod}
 */
export const addTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to add transaction';
  }
};

/**
 * Get All Transactions for User
 * @param {number} userId 
 */
export const getTransactions = async (userId) => {
  try {
    const response = await api.get(`/transactions/user/${userId}`);
    return response.data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch transactions';
  }
};

/**
 * Get Transaction Summary
 * @param {number} userId 
 */
export const getTransactionSummary = async (userId) => {
  try {
    const response = await api.get(`/transactions/user/${userId}/summary`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch summary';
  }
};

/**
 * Get Transactions by Type (INCOME/EXPENSE)
 * @param {number} userId 
 * @param {string} type 
 */
export const getTransactionsByType = async (userId, type) => {
  try {
    const response = await api.get(`/transactions/user/${userId}/type/${type}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch transactions';
  }
};

/**
 * Delete Transaction
 * @param {number} transactionId 
 */
export const deleteTransaction = async (transactionId) => {
  try {
    const response = await api.delete(`/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete transaction';
  }
};




export const updateTransaction = async (transactionId, transactionData) => {
  try {
    const response = await api.put(
      `/transactions/${transactionId}`,
      transactionData
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// =====================================================
// BUDGET SERVICE APIs
// =====================================================

/**
 * Create Budget
 * @param {Object} budgetData - {userId, category, budgetAmount, startDate, endDate, period}
 */
export const createBudget = async (budgetData) => {
  try {
    const response = await api.post('/budgets', budgetData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create budget';
  }
};

/**
 * Get All Budgets for User
 * @param {number} userId 
 */
export const getBudgets = async (userId) => {
  try {
    const response = await api.get(`/budgets/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch budgets';
  }
};

/**
 * Delete Budget
 * @param {number} budgetId 
 */
export const deleteBudget = async (budgetId) => {
  try {
    const response = await api.delete(`/budgets/${budgetId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete budget';
  }
};

// =====================================================
// REPORT SERVICE APIs
// =====================================================

/**
 * Get Monthly Report
 * @param {number} userId 
 * @param {string} month - JANUARY, FEBRUARY, etc.
 */
export const getMonthlyReport = async (userId, month = 'JANUARY') => {
  try {
    const response = await api.get(`/reports/monthly/${userId}?month=${month}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch report';
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get Current User from AsyncStorage
 */
export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if User is Authenticated
 */
export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return !!token;
};

/**
 * Get Auth Token
 */
export const getAuthToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

export default api;