// src/components/GlassCard.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius } from '../utils/colors';

/**
 * Beautiful Glassmorphic Card Component
 * iOS-style blur effect with transparency
 */
const GlassCard = ({ 
  children, 
  style, 
  onPress, 
  gradient = false,
  gradientColors = colors.gradients.primary,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  if (gradient) {
    return (
      <CardComponent
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {children}
        </LinearGradient>
      </CardComponent>
    );
  }

  return (
    <CardComponent
      style={[styles.card, styles.glass, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.large,
    overflow: 'hidden',
    ...shadows.medium,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  gradient: {
    padding: 20,
    borderRadius: borderRadius.large,
  },
});

export default GlassCard;