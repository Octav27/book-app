import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { addToWishlist } from '../../database/sqlite';
import { useStore } from '../../store/useStore';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isOffline } = useStore();
  const router = useRouter();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const apiKey = process.env.EXPO_PUBLIC_BOOKS_API_KEY ? `?key=${process.env.EXPO_PUBLIC_BOOKS_API_KEY}` : '';
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}${apiKey}`);
        setBook(response.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (!isOffline) {
      fetchBook();
    } else {
      setLoading(false);
      Alert.alert("Offline", "Cannot fetch details while offline.");
    }
  }, [id, isOffline]);

  const handleAddToWishlist = async () => {
    if (!book) return;
    try {
      const title = book.volumeInfo.title;
      const authors = book.volumeInfo.authors?.join(', ') || 'Unknown Author';
      const thumbnail = book.volumeInfo.imageLinks?.thumbnail || '';
      await addToWishlist(id as string, title, authors, thumbnail);
      Alert.alert("Success", "Added to wishlist!");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (!book) {
    return <View style={styles.container}><Text>Failed to load book.</Text></View>;
  }

  const { volumeInfo } = book;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150' }}
        style={styles.cover}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{volumeInfo.title}</Text>
        <Text style={styles.authors}>{volumeInfo.authors?.join(', ')}</Text>
        <Text style={styles.description}>{volumeInfo.description}</Text>

        <View style={styles.actions}>
          <Button title="Add to Wishlist" onPress={handleAddToWishlist} variant="secondary" />
          <Button
            title="Add Review"
            onPress={() => router.push({ pathname: '/books/add-review', params: { bookId: id, title: volumeInfo.title } })}
            variant="primary"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  cover: { width: '100%', height: 300, resizeMode: 'cover', backgroundColor: '#E1E1E1' },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  authors: { fontSize: 18, color: '#666', marginBottom: 16 },
  description: { fontSize: 16, lineHeight: 24, color: '#333' },
  actions: { marginTop: 24 }
});
