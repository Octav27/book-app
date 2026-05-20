import { View, Text, StyleSheet, Button } from 'react-native';
import { useStore } from '../../store/useStore';
import * as SecureStore from 'expo-secure-store';

export default function Profile() {
  const { user, logout, isOffline } = useStore();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.username}>@{user?.username}</Text>
      
      <View style={styles.statusContainer}>
        <Text style={{ color: isOffline ? 'red' : 'green' }}>
          {isOffline ? 'Offline Mode' : 'Online'}
        </Text>
      </View>

      <Button title="Logout" onPress={handleLogout} color="#FF3B30" />
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold' },
  username: { fontSize: 16, color: '#666', marginBottom: 40 },
  statusContainer: { marginBottom: 40, padding: 10, borderRadius: 8, backgroundColor: '#f0f0f0' }
});
