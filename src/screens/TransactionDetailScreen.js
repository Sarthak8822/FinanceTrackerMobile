// screens/TransactionDetailScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import { deleteTransaction } from '../services/api';
import { CATEGORY_EMOJIS, CATEGORY_COLORS } from '../components/PieChart';

const TransactionDetailScreen = ({ navigation, route }) => {
  const { transaction } = route.params;
  
  const isIncome = transaction.type === 'INCOME';
  const emoji = CATEGORY_EMOJIS[transaction.category] || '💳';
  const color = CATEGORY_COLORS[transaction.category] || '#6b7280';

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
              Alert.alert('Success', 'Transaction deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert('Coming Soon', 'Edit transaction feature will be available soon!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={isIncome ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.amount}>
            {isIncome ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.typeBadgeText}>
              {isIncome ? '💰 Income' : '💸 Expense'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Details Card */}
        <View style={styles.detailsCard}>
          <DetailRow
            icon="pricetag"
            label="Category"
            value={transaction.category}
            color={color}
          />
          
          <View style={styles.divider} />
          
          <DetailRow
            icon="calendar"
            label="Date"
            value={formatDate(transaction.transactionDate)}
          />
          
          <View style={styles.divider} />
          
          <DetailRow
            icon="card"
            label="Payment Method"
            value={transaction.paymentMethod?.replace('_', ' ') || 'Not specified'}
          />
          
          {transaction.description && (
            <>
              <View style={styles.divider} />
              <DetailRow
                icon="document-text"
                label="Description"
                value={transaction.description}
                multiline
              />
            </>
          )}
          
          <View style={styles.divider} />
          
          <DetailRow
            icon="time"
            label="Created At"
            value={new Date(transaction.createdAt || transaction.transactionDate).toLocaleString('en-IN')}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#3b82f620' }]}>
              <Ionicons name="create-outline" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>Edit Transaction</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#ef444420' }]}>
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </View>
            <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete Transaction</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const DetailRow = ({ icon, label, value, color, multiline }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLeft}>
      <Ionicons name={icon} size={20} color={color || '#6b7280'} />
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text 
      style={[
        styles.detailValue, 
        multiline && styles.detailValueMultiline,
        color && { color }
      ]}
      numberOfLines={multiline ? undefined : 1}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    maxWidth: '50%',
    textAlign: 'right',
  },
  detailValueMultiline: {
    maxWidth: '60%',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  actionsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default TransactionDetailScreen;