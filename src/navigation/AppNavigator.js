import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ListScreen } from '../screens/ListScreen';
import { DetailScreen } from '../screens/DetailScreen';

const Stack = createNativeStackNavigator();

/**
 * Màn hình Loading chống flash giao diện khi đang khôi phục phiên đăng nhập
 */
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.logoBadge}>
      <Text style={styles.logoText}>📚</Text>
    </View>
    <Text style={styles.appTitle}>BookShelf</Text>
    <ActivityIndicator size="large" color="#4F46E5" style={styles.spinner} />
    <Text style={styles.loadingCaption}>Preparing your library...</Text>
  </View>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'List' : 'Home'}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="List" component={ListScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  spinner: {
    marginVertical: 12,
  },
  loadingCaption: {
    fontSize: 14,
    color: '#64748B',
  },
});
