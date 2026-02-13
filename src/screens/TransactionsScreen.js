// screens/TransactionsScreen.js - UPDATED with Payment Filter & Edit

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import TransactionItem from '../components/TransactionItem';
import { getCurrentUser, getTransactions, deleteTransaction } from '../services/api';

const TYPE_FILTERS = ['All', 'Income', 'Expense'];
const PAYMENT_FILTERS = ['All', 'CASH', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING'];

const TransactionsScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        navigation.replace('Login');
        return;
      }

      const data = await getTransactions(user.id);
      // Sort by date descending
      const sorted = data.sort((a, b) => 
        new Date(b.transactionDate) - new Date(a.transactionDate)
      );
      setTransactions(sorted);
      applyFilters(sorted, typeFilter, paymentFilter);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = (data, type, payment) => {
    let filtered = data;

    // Apply type filter
    if (type === 'Income') {
      filtered = filtered.filter(t => t.type === 'INCOME');
    } else if (type === 'Expense') {
      filtered = filtered.filter(t => t.type === 'EXPENSE');
    }

    // Apply payment method filter
    if (payment !== 'All') {
      filtered = filtered.filter(t => t.paymentMethod === payment);
    }

    setFilteredTransactions(filtered);
  };

  const handleTypeFilterChange = (newType) => {
    setTypeFilter(newType);
    applyFilters(transactions, newType, paymentFilter);
  };

  const handlePaymentFilterChange = (newPayment) => {
    setPaymentFilter(newPayment);
    applyFilters(transactions, typeFilter, newPayment);
  };

  const handleEdit = (transaction) => {
    console.log("Transaction::::::::::", transaction)
    navigation.navigate('EditTransactionScreen', { transaction });
  };


     const handleDelete = (id) => {
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
              await deleteTransaction(id);
              loadTransactions();
              Alert.alert('Success', 'Transaction deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.transactionDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  const sections = Object.keys(groupedTransactions).map(date => ({
    title: date,
    data: groupedTransactions[date],
  }));

  // Calculate total
  const getTotal = () => {
    return filteredTransactions.reduce((sum, t) => {
      return t.type === 'INCOME' ? sum + t.amount : sum - t.amount;
    }, 0);
  };

  const total = getTotal();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddTransaction')}>
          <Ionicons name="add-circle" size={28} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Type Filter Bar */}
      <View style={styles.filterBar}>
        {TYPE_FILTERS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterButton,
              typeFilter === option && styles.filterButtonActive,
            ]}
            onPress={() => handleTypeFilterChange(option)}
          >
            <Text
              style={[
                styles.filterText,
                typeFilter === option && styles.filterTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Payment Method Filter */}
      <View style={styles.paymentFilterContainer}>
        <Text style={styles.filterLabel}>Payment Method:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.paymentFilterScroll}
        >
          {PAYMENT_FILTERS.map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentFilterChip,
                paymentFilter === method && styles.paymentFilterChipActive,
              ]}
              onPress={() => handlePaymentFilterChange(method)}
            >
              <Text
                style={[
                  styles.paymentFilterText,
                  paymentFilter === method && styles.paymentFilterTextActive,
                ]}
              >
                {method === 'All' ? 'All' : method.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>
          {typeFilter === 'All' ? 'Net Balance' : typeFilter === 'Income' ? 'Total Income' : 'Total Expense'}
        </Text>
        <Text 
          style={[
            styles.summaryAmount,
            { color: total >= 0 ? '#10b981' : '#ef4444' },
          ]}
        >
          {total >= 0 ? '+' : ''}₹{Math.abs(total).toLocaleString('en-IN')}
        </Text>
        <Text style={styles.summaryCount}>
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </Text>
        {paymentFilter !== 'All' && (
          <Text style={styles.summaryPayment}>via {paymentFilter.replace('_', ' ')}</Text>
        )}
      </View>

      {/* Transactions List */}
      {sections.length > 0 ? (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={styles.dateHeader}>{item.title}</Text>
              {item.data.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() => navigation.navigate('TransactionDetailScreen', { transaction })}
                  onEdit={() => navigation.navigate('EditTransactionScreen', { transaction })}
                  onDelete={handleDelete}
                  showEdit={true}
                />
              ))}
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No transactions found</Text>
          <Text style={styles.emptySubtext}>
            {paymentFilter !== 'All' 
              ? `No ${typeFilter.toLowerCase()} transactions via ${paymentFilter.replace('_', ' ')}`
              : `No ${typeFilter.toLowerCase()} transactions yet`
            }
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddTransaction')}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  paymentFilterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  paymentFilterScroll: {
    flexDirection: 'row',
  },
  paymentFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentFilterChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  paymentFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  paymentFilterTextActive: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 13,
    color: '#9ca3af',
  },
  summaryPayment: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  section: {
    marginTop: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default TransactionsScreen;