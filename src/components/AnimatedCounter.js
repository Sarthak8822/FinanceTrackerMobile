// src/components/AnimatedCounter.js
import React, { useEffect, useRef } from 'react';
import { Text, Animated, Easing } from 'react-native';

/**
 * Animated Counter Component
 * Smoothly animates numbers from 0 to target value
 */
const AnimatedCounter = ({ 
  value, 
  duration = 1000, 
  prefix = '₹', 
  style,
  decimals = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <AnimatedText
      animatedValue={animatedValue}
      prefix={prefix}
      style={style}
      decimals={decimals}
    />
  );
};

// Separate component for animated text to optimize re-renders
const AnimatedText = ({ animatedValue, prefix, style, decimals }) => {
  return (
    <Animated.Text style={style}>
      {animatedValue.interpolate({
        inputRange: [0, 1000000],
        outputRange: ['0', '1000000'],
        extrapolate: 'clamp',
      })}
    </Animated.Text>
  );
};

export default AnimatedCounter;

// Simple version without animation (fallback)
export const SimpleCounter = ({ value, prefix = '₹', style }) => {
  return (
    <Text style={style}>
      {prefix}{value.toLocaleString('en-IN')}
    </Text>
  );
};