import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useStore } from '../store/useStore';
import { initDb } from '../database/sqlite';
import { ActivityIndicator, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, login, setOfflineStatus } = useStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        await initDb();
        // Check for token
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          // Mock user load
          login({ name: 'User', username: 'user123' });
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();

    const unsubscribe = NetInfo.addEventListener(state => {
      setOfflineStatus(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isReady, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="books" options={{ headerShown: false }} />
    </Stack>
  );
}
