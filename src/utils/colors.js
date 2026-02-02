// src/utils/colors.js

/**
 * App Color Palette
 * Beautiful iOS-inspired color scheme with gradients
 */

export const colors = {
  // Primary Colors - Vibrant Purple to Blue gradient
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  
  // Secondary Colors - Pink to Orange gradient
  secondary: '#ec4899',
  secondaryDark: '#db2777',
  secondaryLight: '#f472b6',
  
  // Success Colors - Green
  success: '#10b981',
  successDark: '#059669',
  successLight: '#34d399',
  
  // Error/Danger Colors - Red
  error: '#ef4444',
  errorDark: '#dc2626',
  errorLight: '#f87171',
  
  // Warning Colors - Amber
  warning: '#f59e0b',
  warningDark: '#d97706',
  warningLight: '#fbbf24',
  
  // Info Colors - Cyan
  info: '#06b6d4',
  infoDark: '#0891b2',
  infoLight: '#22d3ee',
  
  // Neutral Colors - Gray scale
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Background Colors
  background: '#f8fafc',
  backgroundDark: '#0f172a',
  
  // Card Colors
  card: '#ffffff',
  cardDark: '#1e293b',
  
  // Text Colors
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textLight: '#ffffff',
  
  // Category Colors (for pie charts)
  categoryColors: {
    Food: '#f59e0b',       // Amber
    Transport: '#3b82f6',  // Blue
    Shopping: '#ec4899',   // Pink
    Entertainment: '#8b5cf6', // Purple
    Health: '#10b981',     // Green
    Bills: '#ef4444',      // Red
    Salary: '#10b981',     // Green
    Other: '#6b7280',      // Gray
  },
  
  // Gradient Combinations
  gradients: {
    primary: ['#6366f1', '#8b5cf6'],
    secondary: ['#ec4899', '#f59e0b'],
    success: ['#10b981', '#059669'],
    ocean: ['#06b6d4', '#3b82f6'],
    sunset: ['#f59e0b', '#ef4444'],
    purple: ['#8b5cf6', '#ec4899'],
    green: ['#10b981', '#34d399'],
  },
};

/**
 * Get category color
 * @param {string} category 
 */
export const getCategoryColor = (category) => {
  return colors.categoryColors[category] || colors.categoryColors.Other;
};

/**
 * Get transaction type color
 * @param {string} type - INCOME or EXPENSE
 */
export const getTransactionColor = (type) => {
  return type === 'INCOME' ? colors.success : colors.error;
};

/**
 * Shadow styles for iOS
 */
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

/**
 * Border radius values
 */
export const borderRadius = {
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  full: 9999,
};

/**
 * Spacing values
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Font sizes
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/**
 * Font weights
 */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export default colors;