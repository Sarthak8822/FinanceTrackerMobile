// src/screens/ReportsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PieChart from '../components/PieChart';
import GlassCard from '../components/GlassCard';
import { 
  getCurrentUser, 
  getTransactions,
  getTransactionSummary,
} from '../services/api';
import { colors, fontSize, fontWeight, borderRadius, spacing, getCategoryColor } from '../utils/colors';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('All Time');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      // Load summary
      const summaryData = await getTransactionSummary(user.id);
      setSummary(summaryData);

      // Load all transactions
      const transactions = await getTransactions(user.id);
      
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

      // Convert to chart data format
      const chartData = Object.keys(expensesByCategory).map(category => ({
        category,
        value: expensesByCategory[category],
        color: getCategoryColor(category),
      }));

      setCategoryData(chartData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const savingsRate = summary.totalIncome > 0 
    ? ((summary.balance / summary.totalIncome) * 100).toFixed(1)
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
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
              onPress={() => setSelectedPeriod(period)}
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
            color={colors.success}
            gradient={colors.gradients.green}
          />
          <SummaryCard
            icon="trending-down"
            label="Total Expense"
            amount={summary.totalExpense}
            color={colors.error}
            gradient={colors.gradients.sunset}
          />
          <SummaryCard
            icon="wallet"
            label="Balance"
            amount={summary.balance}
            color={colors.primary}
            gradient={colors.gradients.primary}
          />
          <SummaryCard
            icon="save"
            label="Savings Rate"
            amount={savingsRate}
            suffix="%"
            prefix=""
            color={colors.info}
            gradient={colors.gradients.ocean}
          />
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
            <Ionicons name="pie-chart-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyText}>No expenses to show</Text>
            <Text style={styles.emptySubtext}>Start adding expenses to see reports</Text>
          </View>
        )}

        {/* Category Details */}
        {categoryData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Details</Text>
            <View style={styles.categoryList}>
              {categoryData.map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                    <Text style={styles.categoryName}>{item.category}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>
                      ₹{item.value.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.categoryPercent}>
                      {((item.value / summary.totalExpense) * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Spacing for bottom */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

// Summary Card Component
const SummaryCard = ({ icon, label, amount, color, gradient, prefix = '₹', suffix = '' }) => (
  <View style={styles.summaryCard}>
    <GlassCard gradient gradientColors={gradient}>
      <View style={styles.summaryCardIcon}>
        <Ionicons name={icon} size={24} color={colors.white} />
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
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
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
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.small,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    fontWeight: fontWeight.medium,
  },
  periodButtonTextActive: {
    color: colors.white,
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryCard: {
    width: '48%',
    marginBottom: spacing.md,
  },
  summaryCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryCardLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xs,
  },
  summaryCardAmount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  chartCard: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray600,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.gray400,
    marginTop: spacing.xs,
  },
  categoryList: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.gray900,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.gray900,
    marginBottom: 2,
  },
  categoryPercent: {
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
});

export default ReportsScreen;