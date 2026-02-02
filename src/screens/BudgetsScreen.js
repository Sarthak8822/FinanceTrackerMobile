// screens/BudgetsScreen.js - FIXED VERSION with Rent category

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import { getCurrentUser, getBudgets, createBudget, deleteBudget } from '../services/api';

// UPDATED CATEGORIES with Rent
const CATEGORIES = [
  { name: 'Food', icon: 'fast-food', color: '#f59e0b', emoji: '🍔' },
  { name: 'Transport', icon: 'car', color: '#3b82f6', emoji: '🚗' },
  { name: 'Shopping', icon: 'cart', color: '#ec4899', emoji: '🛍️' },
  { name: 'Entertainment', icon: 'game-controller', color: '#8b5cf6', emoji: '🎮' },
  { name: 'Health', icon: 'fitness', color: '#10b981', emoji: '💊' },
  { name: 'Bills', icon: 'receipt', color: '#ef4444', emoji: '💡' },
  { name: 'Rent', icon: 'home', color: '#06b6d4', emoji: '🏠' },  // NEW CATEGORY
  { name: 'Education', icon: 'school', color: '#8b5cf6', emoji: '📚' },
];

const BudgetsScreen = ({ navigation }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: 'Food',
    amount: '',
  });
  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [])
  );

  const loadBudgets = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigation.replace('Login');
        return;
      }
      setUser(currentUser);

      const data = await getBudgets(currentUser.id);
      setBudgets(data);
    } catch (error) {
      console.error('Load budgets error:', error);
      Alert.alert('Error', 'Failed to load budgets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateBudget = async () => {
    if (!newBudget.amount || parseFloat(newBudget.amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => b.category === newBudget.category);
    if (existingBudget) {
      Alert.alert('Error', `Budget for ${newBudget.category} already exists. Please delete it first.`);
      return;
    }

    try {
      setCreating(true);
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

      const budgetData = {
        userId: user.id,
        category: newBudget.category,
        budgetAmount: parseFloat(newBudget.amount),
        startDate,
        endDate,
        period: 'MONTHLY',
      };

      console.log('Creating budget:', budgetData);
      await createBudget(budgetData);

      Alert.alert('Success', '✅ Budget created successfully!');
      setShowAddModal(false);
      setNewBudget({ category: 'Food', amount: '' });
      loadBudgets();
    } catch (error) {
      console.error('Create budget error:', error);
      Alert.alert('Error', error.message || 'Failed to create budget');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (budgetId) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budgetId);
              Alert.alert('Success', 'Budget deleted');
              loadBudgets();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const getStatus = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return { label: 'EXCEEDED', color: '#ef4444' };
    if (percentage >= 80) return { label: 'WARNING', color: '#f59e0b' };
    return { label: 'SAFE', color: '#10b981' };
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBudgets();
  };

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Budgets</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Ionicons name="add-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const categoryInfo = CATEGORIES.find(c => c.name === budget.category) || CATEGORIES[0];
            const percentage = Math.min((budget.spentAmount / budget.budgetAmount) * 100, 100);
            const status = getStatus(budget.spentAmount, budget.budgetAmount);

            return (
              <View key={budget.id} style={styles.budgetCard}>
                {/* Header */}
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetInfo}>
                    <View style={[styles.iconContainer, { backgroundColor: categoryInfo.color + '20' }]}>
                      <Text style={styles.emoji}>{categoryInfo.emoji}</Text>
                    </View>
                    <View style={styles.budgetTitleContainer}>
                      <Text style={styles.budgetTitle}>{budget.category}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>
                          {status.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(budget.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Amount Info */}
                <View style={styles.amountInfo}>
                  <View>
                    <Text style={styles.spentLabel}>Spent</Text>
                    <Text style={[styles.spentAmount, { color: status.color }]}>
                      ₹{budget.spentAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.budgetLabel}>Budget</Text>
                    <Text style={styles.budgetAmount}>
                      ₹{budget.budgetAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${percentage}%`,
                          backgroundColor: status.color,
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
                </View>

                {/* Remaining */}
                <Text style={styles.remainingText}>
                  ₹{Math.max(0, budget.budgetAmount - budget.spentAmount).toLocaleString('en-IN')} remaining
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No budgets yet</Text>
            <Text style={styles.emptySubtext}>Create a budget to track your spending</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Budget</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoryScroll}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryOption,
                    newBudget.category === cat.name && { 
                      backgroundColor: cat.color,
                      borderColor: cat.color,
                    },
                  ]}
                  onPress={() => setNewBudget({ ...newBudget, category: cat.name })}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text 
                    style={[
                      styles.categoryName,
                      newBudget.category === cat.name && { color: '#fff' },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Monthly Budget</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={newBudget.amount}
                onChangeText={(text) => setNewBudget({ ...newBudget, amount: text })}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#d1d5db"
              />
            </View>

            <TouchableOpacity 
              style={styles.createBudgetButton} 
              onPress={handleCreateBudget}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createBudgetButtonText}>Create Budget</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingTop: 16,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  budgetTitleContainer: {
    flex: 1,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  spentLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  spentAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  remainingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 450,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 24,
  },
  categoryOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginRight: 12,
    minWidth: 100,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6b7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    paddingVertical: 16,
  },
  createBudgetButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  createBudgetButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});

export default BudgetsScreen;