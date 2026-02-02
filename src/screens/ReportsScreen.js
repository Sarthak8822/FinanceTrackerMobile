// screens/ReportsScreen.js - FIXED with proper period filtering

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import PieChart, { CATEGORY_COLORS } from '../components/PieChart';
import GlassCard from '../components/GlassCard';
import { getCurrentUser, getTransactions, getTransactionSummary } from '../services/api';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        navigation.replace('Login');
        return;
      }

      // Load ALL transactions
      const transactions = await getTransactions(user.id);
      setAllTransactions(transactions);
      
      // Filter based on selected period
      filterByPeriod(transactions, selectedPeriod);
    } catch (error) {
      console.error('Load reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByPeriod = (transactions, period) => {
    const now = new Date();
    let filtered = [];

    if (period === 'This Month') {
      // Current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      filtered = transactions.filter(t => {
        const transDate = new Date(t.transactionDate);
        return transDate >= startOfMonth && transDate <= endOfMonth;
      });
    } else if (period === 'Last Month') {
      // Previous month
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      filtered = transactions.filter(t => {
        const transDate = new Date(t.transactionDate);
        return transDate >= startOfLastMonth && transDate <= endOfLastMonth;
      });
    } else {
      // All Time
      filtered = transactions;
    }

    setFilteredTransactions(filtered);
    calculateSummaryAndCategories(filtered);
  };

  const calculateSummaryAndCategories = (transactions) => {
    // Calculate summary
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    setSummary({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    });

    // Group expenses by category
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        if (expensesByCategory[t.category]) {
          expensesByCategory[t.category] += parseFloat(t.amount);
        } else {
          expensesByCategory[t.category] = parseFloat(t.amount);
        }
      });

    // Convert to chart data with DIFFERENT colors
    const chartData = Object.keys(expensesByCategory).map(category => ({
      category,
      value: expensesByCategory[category],
      color: CATEGORY_COLORS[category] || '#6b7280',
    }));

    setCategoryData(chartData);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    filterByPeriod(allTransactions, period);
  };

  const savingsRate = summary.totalIncome > 0 
    ? ((summary.balance / summary.totalIncome) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reports</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['This Month', 'Last Month', 'All Time'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => handlePeriodChange(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <SummaryCard
            icon="trending-up"
            label="Total Income"
            amount={summary.totalIncome}
            color="#10b981"
            gradient={['#10b981', '#059669']}
          />
          <SummaryCard
            icon="trending-down"
            label="Total Expense"
            amount={summary.totalExpense}
            color="#ef4444"
            gradient={['#ef4444', '#dc2626']}
          />
          <SummaryCard
            icon="wallet"
            label="Balance"
            amount={summary.balance}
            color={summary.balance >= 0 ? '#10b981' : '#ef4444'}
            gradient={summary.balance >= 0 ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
          />
          <SummaryCard
            icon="trending-up"
            label="Savings Rate"
            amount={savingsRate}
            suffix="%"
            prefix=""
            color="#06b6d4"
            gradient={['#06b6d4', '#0891b2']}
          />
        </View>

        {/* Transaction Count */}
        <View style={styles.countCard}>
          <Ionicons name="receipt-outline" size={24} color="#6366f1" />
          <Text style={styles.countText}>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} in {selectedPeriod}
          </Text>
        </View>

        {/* Expense Breakdown */}
        {categoryData.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expense Breakdown</Text>
            <GlassCard style={styles.chartCard}>
              <PieChart data={categoryData} />
            </GlassCard>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="pie-chart-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No expenses in {selectedPeriod}</Text>
            <Text style={styles.emptySubtext}>
              {selectedPeriod === 'This Month' 
                ? 'Start adding expenses to see your spending breakdown'
                : 'No transactions found for this period'}
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// Summary Card Component
const SummaryCard = ({ icon, label, amount, color, gradient, prefix = '₹', suffix = '' }) => (
  <View style={styles.summaryCard}>
    <GlassCard gradient gradientColors={gradient}>
      <View style={styles.summaryCardIcon}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <Text style={styles.summaryCardLabel}>{label}</Text>
      <Text style={styles.summaryCardAmount}>
        {prefix}{typeof amount === 'number' ? amount.toLocaleString('en-IN') : amount}{suffix}
      </Text>
    </GlassCard>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#6366f1',
  },
  periodButtonText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '48%',
    marginBottom: 12,
  },
  summaryCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryCardLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  summaryCardAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  countCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  countText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  chartCard: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    paddingHorizontal: 32,
  },
});

export default ReportsScreen;