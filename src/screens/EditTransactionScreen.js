// screens/EditTransactionScreen.js - NEW Screen for Editing

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import GlassCard from '../components/GlassCard';
import { updateTransaction } from '../services/api';

const CATEGORIES = {
  INCOME: [
    { name: 'Salary', icon: '💰', color: '#10b981' },
    { name: 'Business', icon: '💼', color: '#059669' },
    { name: 'Investment', icon: '📈', color: '#8b5cf6' },
    { name: 'Other', icon: '💵', color: '#6b7280' },
  ],
  EXPENSE: [
    { name: 'Food', icon: '🍔', color: '#f59e0b' },
    { name: 'Transport', icon: '🚗', color: '#3b82f6' },
    { name: 'Shopping', icon: '🛍️', color: '#ec4899' },
    { name: 'Entertainment', icon: '🎮', color: '#8b5cf6' },
    { name: 'Health', icon: '💊', color: '#10b981' },
    { name: 'Bills', icon: '⚡', color: '#ef4444' },
    { name: 'Rent', icon: '🏠', color: '#06b6d4' },
    { name: 'Education', icon: '📚', color: '#a855f7' },
    { name: 'Other', icon: '💳', color: '#6b7280' },
  ],
};

const PAYMENT_METHODS = [
  { name: 'CASH', icon: '💵' },
  { name: 'UPI', icon: '📱' },
  { name: 'CREDIT_CARD', icon: '💳' },
  { name: 'DEBIT_CARD', icon: '💳' },
  { name: 'NET_BANKING', icon: '🏦' },
];

const EditTransactionScreen = ({ navigation, route }) => {
  const { transaction } = route.params;
  
  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(
    CATEGORIES[transaction.type].find(c => c.name === transaction.category)
  );
  const [description, setDescription] = useState(transaction.description || '');
  const [date, setDate] = useState(new Date(transaction.transactionDate));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(transaction.paymentMethod || 'CASH');
  const [loading, setLoading] = useState(false);

  const categories = CATEGORIES[type];

  const handleUpdate = async () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Please fill amount and select category');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);

      const updatedData = {
        id: transaction.id,
        userId: transaction.userId,
        amount: amountValue,
        type,
        category: category.name,
        description: description.trim() || undefined,
        transactionDate: date.toISOString().split('T')[0],
        paymentMethod,
      };

      await updateTransaction(transaction.id, updatedData);
      
      Alert.alert('Success', '✅ Transaction updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Update transaction error:', error);
      Alert.alert('Error', error.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Transaction</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Type Display (Read-only) */}
        <View style={styles.typeDisplay}>
          <Text style={styles.typeLabel}>Type:</Text>
          <View style={[
            styles.typeBadge,
            { backgroundColor: type === 'INCOME' ? '#10b981' : '#ef4444' }
          ]}>
            <Text style={styles.typeBadgeText}>
              {type === 'INCOME' ? '💰 Income' : '💸 Expense'}
            </Text>
          </View>
        </View>

        {/* Amount Input */}
        <GlassCard style={styles.amountCard}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </GlassCard>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryButton,
                  category?.name === cat.name && {
                    backgroundColor: cat.color + '20',
                    borderColor: cat.color,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[
                  styles.categoryName,
                  category?.name === cat.name && { 
                    color: cat.color,
                    fontWeight: '700' 
                  }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <GlassCard style={styles.inputCard}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a note..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </GlassCard>

        {/* Date */}
        <GlassCard style={styles.inputCard}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#6366f1" />
            <Text style={styles.dateText}>
              {date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.name}
                style={[
                  styles.paymentButton,
                  paymentMethod === method.name && styles.paymentButtonActive
                ]}
                onPress={() => setPaymentMethod(method.name)}
              >
                <Text style={styles.paymentIcon}>{method.icon}</Text>
                <Text style={[
                  styles.paymentName,
                  paymentMethod === method.name && styles.paymentNameActive
                ]}>
                  {method.name.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.updateButtonText}>Update Transaction</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#6366f1',
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
    padding: 20,
  },
  typeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  amountCard: {
    padding: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6366f1',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: '700',
    color: '#1f2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  inputCard: {
    padding: 20,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 16,
    color: '#1f2937',
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentButton: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentButtonActive: {
    backgroundColor: '#6366f1',
  },
  paymentIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  paymentNameActive: {
    color: '#fff',
  },
  updateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});

export default EditTransactionScreen;