import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';

interface BookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail: string;
    };
  };
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isOffline } = useStore();
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim() || isOffline) {
      if (isOffline) alert("Cannot search while offline");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
      setResults(response.data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: BookItem }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/books/${item.id}`)}
    >
      <Image 
        source={{ uri: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150' }} 
        style={styles.thumbnail} 
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.volumeInfo.title}</Text>
        <Text style={styles.author} numberOfLines={1}>
          {item.volumeInfo.authors?.join(', ') || 'Unknown Author'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <View style={{ flex: 1 }}>
          <Input 
            label=""
            placeholder="Search books..." 
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <View style={{ marginLeft: 8, marginTop: 8 }}>
          <Button title="Search" onPress={handleSearch} isLoading={loading} />
        </View>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={results}
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
  searchBar: { flexDirection: 'row', paddingHorizontal: 16, alignItems: 'center', backgroundColor: '#FFF', paddingBottom: 16 },
  list: { padding: 16 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    borderRadius: 8, 
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  thumbnail: { width: 60, height: 90, borderRadius: 4, backgroundColor: '#E1E1E1' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  author: { fontSize: 14, color: '#666' }
});
