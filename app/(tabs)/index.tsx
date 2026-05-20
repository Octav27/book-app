import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getReviews } from '../../database/sqlite';

export default function Home() {
  const [reviews, setReviews] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchReviews = async () => {
        const data = await getReviews();
        setReviews(data);
      };
      fetchReviews();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.rating}>Rating: {item.rating}/5</Text>
      <Text style={styles.reviewText}>{item.reviewText}</Text>
      {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.image} /> : null}
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reviews yet.</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  list: { padding: 16 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  rating: { fontSize: 14, color: '#F5A623', marginBottom: 8, fontWeight: '600' },
  reviewText: { fontSize: 16, color: '#333', marginBottom: 12 },
  image: { width: '100%', height: 150, borderRadius: 8, marginBottom: 8 },
  date: { fontSize: 12, color: '#999', textAlign: 'right' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666' }
});
