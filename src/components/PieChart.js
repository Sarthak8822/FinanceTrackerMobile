// components/PieChart.js - UPDATED with Rent and different colors

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// UPDATED Category Emojis including RENT
export const CATEGORY_EMOJIS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎮',
  Health: '💊',
  Bills: '⚡',
  Rent: '🏠',        // NEW - Rent category
  Education: '📚',
  Salary: '💰',
  Business: '💼',
  Investment: '📈',
  Other: '💳',
};

// UPDATED Category Colors - All different
export const CATEGORY_COLORS = {
  Food: '#f59e0b',        // Amber
  Transport: '#3b82f6',   // Blue
  Shopping: '#ec4899',    // Pink
  Entertainment: '#8b5cf6', // Purple
  Health: '#10b981',      // Green
  Bills: '#ef4444',       // Red
  Rent: '#06b6d4',        // Cyan - NEW
  Education: '#8b5cf6',   // Purple
  Salary: '#10b981',      // Green
  Business: '#059669',    // Dark Green
  Investment: '#a855f7',  // Light Purple
  Other: '#6b7280',       // Gray
};

/**
 * Beautiful Pie Chart Component with Emojis
 * Now shows different colors for each category
 */
const PieChart = ({ data, showLegend = true, size = 220 }) => {
  // Transform data for chart with DIFFERENT colors
  const chartData = data.map((item) => ({
    name: item.category,
    amount: item.value,
    color: CATEGORY_COLORS[item.category] || item.color || '#6b7280',
    legendFontColor: '#6b7280',
    legendFontSize: 14,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  if (total === 0 || chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyText}>No expense data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Pie Chart */}
      <View style={styles.chartContainer}>
        <RNPieChart
          data={chartData}
          width={screenWidth - 60}
          height={size}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          hasLegend={false}
          absolute
        />

        {/* Center Total with Icon */}
        <View style={styles.centerInfo}>
          <Text style={styles.totalEmoji}>💰</Text>
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalAmount}>
            ₹{total.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Custom Legend with Emojis and Different Colors */}
      {showLegend && (
        <View style={styles.legend}>
          {chartData.map((item, index) => {
            const emoji = CATEGORY_EMOJIS[item.name] || '💳';
            const percentage = ((item.amount / total) * 100).toFixed(1);

            return (
              <View key={index} style={styles.legendItem}>
                {/* Emoji + Color Dot */}
                <View style={styles.legendLeft}>
                  <Text style={styles.legendEmoji}>{emoji}</Text>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name}</Text>
                </View>

                {/* Amount + Percentage */}
                <View style={styles.legendRight}>
                  <Text style={styles.legendAmount}>
                    ₹{item.amount.toLocaleString('en-IN')}
                  </Text>
                  <View style={[styles.percentageBadge, { backgroundColor: item.color + '20' }]}>
                    <Text style={[styles.legendPercentage, { color: item.color }]}>
                      {percentage}%
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 24,
  },
  centerInfo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -70 }, { translateY: -40 }],
    alignItems: 'center',
    width: 140,
  },
  totalEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366f1',
  },
  legend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  legendRight: {
    alignItems: 'flex-end',
  },
  legendAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  legendPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PieChart;