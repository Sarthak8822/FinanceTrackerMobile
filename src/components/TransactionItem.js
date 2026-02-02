// src/components/TransactionItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, borderRadius, spacing } from '../utils/colors';
import { getCategoryColor, getTransactionColor } from '../utils/colors';

// Category Icons Mapping
const categoryIcons = {
  Food: 'fast-food',
  Transport: 'car',
  Shopping: 'cart',
  Entertainment: 'game-controller',
  Health: 'fitness',
  Bills: 'flash',
  Salary: 'cash',
  Other: 'ellipsis-horizontal',
};

/**
 * Transaction List Item Component
 * Shows individual transaction with icon, details, and amount
 */
const TransactionItem = ({ transaction, onPress, onDelete }) => {
  const isIncome = transaction.type === 'INCOME';
  const iconName = categoryIcons[transaction.category] || 'ellipsis-horizontal';
  const iconColor = getCategoryColor(transaction.category);
  const amountColor = getTransactionColor(transaction.type);

  // Format date
  const date = new Date(transaction.transactionDate);
  const formattedDate = date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        {/* Category Icon */}
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>

        {/* Transaction Details */}
        <View style={styles.details}>
          <Text style={styles.category}>{transaction.category}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
          {transaction.description && (
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description}
            </Text>
          )}
        </View>
      </View>

      {/* Amount */}
      <View style={styles.rightSection}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
        </Text>
        {transaction.paymentMethod && (
          <Text style={styles.paymentMethod}>{transaction.paymentMethod}</Text>
        )}
      </View>

      {/* Delete Button (Optional) */}
      {onDelete && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete(transaction.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.gray900,
    marginBottom: 2,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.gray500,
    marginBottom: 2,
  },
  description: {
    fontSize: fontSize.xs,
    color: colors.gray400,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: fontSize.xs,
    color: colors.gray400,
  },
  deleteButton: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
});

export default TransactionItem;