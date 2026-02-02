// screens/SettingsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import { getCurrentUser, logoutUser } from '../services/api';

const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const menuItems = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Edit Profile',
          color: '#6366f1',
          onPress: () => Alert.alert('Coming Soon', 'Edit profile feature'),
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Security',
          color: '#10b981',
          onPress: () => Alert.alert('Coming Soon', 'Security settings'),
        },
        {
          icon: 'lock-closed-outline',
          label: 'Privacy',
          color: '#f59e0b',
          onPress: () => Alert.alert('Coming Soon', 'Privacy settings'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          color: '#8b5cf6',
          toggle: true,
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          color: '#ec4899',
          toggle: true,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: 'finger-print-outline',
          label: 'Biometric Login',
          color: '#06b6d4',
          toggle: true,
          value: biometric,
          onToggle: setBiometric,
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: 'star-outline',
          label: 'Rate Us',
          color: '#f59e0b',
          onPress: () => Alert.alert('Thank you!', 'Please rate us on App Store'),
        },
        {
          icon: 'share-social-outline',
          label: 'Share App',
          color: '#10b981',
          onPress: () => Alert.alert('Share', 'Share Finance Tracker with friends'),
        },
        {
          icon: 'help-circle-outline',
          label: 'Help & Support',
          color: '#3b82f6',
          onPress: () => Alert.alert('Help', 'Contact support@financetracker.com'),
        },
        {
          icon: 'information-circle-outline',
          label: 'About',
          color: '#6b7280',
          onPress: () => Alert.alert('Finance Tracker', 'Version 1.0.0\n\nManage your money smartly'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <GlassCard style={styles.profileCard} gradient gradientColors={['#6366f1', '#8b5cf6']}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#ec4899', '#f59e0b']}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {getInitials(user?.fullName || user?.username)}
              </Text>
            </LinearGradient>
          </View>
          
          <Text style={styles.userName}>
            {user?.fullName || user?.username || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            <GlassCard style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    disabled={item.toggle}
                  >
                    <View style={styles.menuLeft}>
                      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                        <Ionicons name={item.icon} size={20} color={item.color} />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    
                    {item.toggle ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#d1d5db', true: item.color }}
                        thumbColor="#fff"
                      />
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    )}
                  </TouchableOpacity>
                  
                  {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </GlassCard>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Finance Tracker v1.0.0</Text>

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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
    padding: 20,
  },
  profileCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default SettingsScreen;