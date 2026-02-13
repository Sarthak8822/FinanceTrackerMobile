// components/TransactionItem.js - UPDATED with Edit button

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_EMOJIS, CATEGORY_COLORS } from './PieChart';

const TransactionItem = ({ 
  transaction, 
  onPress, 
  onEdit,
  onDelete, 
  showEdit = false 
}) => {
  const isIncome = transaction.type === 'INCOME';
  const emoji = CATEGORY_EMOJIS[transaction.category] || '💳';
  const color = CATEGORY_COLORS[transaction.category] || '#6b7280';
  const amountColor = isIncome ? '#10b981' : '#ef4444';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.leftSection}>
        {/* Category Icon */}
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.details}>
          <Text style={styles.category}>{transaction.category}</Text>
          <Text style={styles.date}>
            {formatDate(transaction.transactionDate)}
          </Text>
          {transaction.description && (
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description}
            </Text>
          )}
          {/* Payment Method Badge */}
          {transaction.paymentMethod && (
            <View style={styles.paymentBadge}>
              <Ionicons name="card-outline" size={12} color="#6366f1" />
              <Text style={styles.paymentText}>
                {transaction.paymentMethod.replace('_', ' ')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {/* Amount */}
        <Text style={[styles.amount, { color: amountColor }]}>
          {isIncome ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {/* Edit Button */}
          {showEdit && onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={(e) => {
                e.stopPropagation();
                onEdit(transaction);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="create-outline" size={18} color="#6366f1" />
            </TouchableOpacity>
          )}

          {/* Delete Button */}
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                onDelete(transaction.id);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 8,
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
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 24,
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366f1',
    textTransform: 'capitalize',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 6,
    backgroundColor: '#ede9fe',
    borderRadius: 8,
  },
  deleteButton: {
    padding: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
});

export default TransactionItem;