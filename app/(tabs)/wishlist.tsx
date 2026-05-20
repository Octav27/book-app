import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getWishlist, removeFromWishlist } from '../../database/sqlite';
import { Button } from '../../components/Button';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const router = useRouter();

  const fetchWishlist = async () => {
    const data = await getWishlist();
    setWishlist(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [])
  );

  const handleRemove = async (id: string) => {
    await removeFromWishlist(id);
    fetchWishlist();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/books/${item.id}`)}
    >
      <Image 
        source={{ uri: item.thumbnail || 'https://via.placeholder.com/150' }} 
        style={styles.thumbnail} 
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{item.authors}</Text>
        <Button title="Remove" onPress={() => handleRemove(item.id)} variant="outline" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your wishlist is empty.</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  list: { padding: 16 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 8, 
    padding: 12,
    elevation: 2,
  },
  thumbnail: { width: 80, height: 120, borderRadius: 4, backgroundColor: '#E1E1E1' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  author: { fontSize: 14, color: '#666', marginBottom: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666' }
});
