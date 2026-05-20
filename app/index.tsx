import { Redirect } from 'expo-router';
import { useStore } from '../store/useStore';

export default function Index() {
  const { isAuthenticated } = useStore();
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}
