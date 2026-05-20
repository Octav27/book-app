import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { addReview } from '../../database/sqlite';
import * as Linking from 'expo-linking';

const reviewSchema = z.object({
  rating: z.string().refine((val) => {
    const num = parseInt(val);
    return num >= 1 && num <= 5;
  }, "Rating must be a number between 1 and 5"),
  reviewText: z.string().min(10, "Review must be at least 10 characters long"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function AddReviewScreen() {
  const { bookId, title } = useLocalSearchParams();
  const router = useRouter();
  
  const [imageUri, setImageUri] = useState<string>('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: '', reviewText: '' }
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Permission required", 
        "We need camera roll permissions to make this work!",
        [{ text: "Cancel" }, { text: "Settings", onPress: () => Linking.openSettings() }]
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
       Alert.alert(
        "Permission required", 
        "We need location permissions to save where you read the book!",
        [{ text: "Cancel" }, { text: "Settings", onPress: () => Linking.openSettings() }]
      );
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    Alert.alert("Success", "Location fetched successfully!");
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await addReview(
        bookId as string, 
        title as string, 
        parseInt(data.rating), 
        data.reviewText, 
        imageUri, 
        location?.lat || 0, 
        location?.lng || 0
      );
      Alert.alert("Success", "Review added successfully!");
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save review.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Review for: {title}</Text>
      
      <Controller
        control={control}
        name="rating"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Rating (1-5)"
            placeholder="e.g. 5"
            keyboardType="numeric"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.rating?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="reviewText"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Review Text"
            placeholder="Write your review here..."
            multiline
            numberOfLines={4}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.reviewText?.message}
          />
        )}
      />

      <View style={styles.actions}>
        <Button title="Pick an Image from Gallery" onPress={pickImage} variant="outline" />
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.imagePreview} /> : null}
        
        <Button title="Tag Current Location" onPress={getLocation} variant="outline" />
        {location ? <Text style={styles.locationText}>Location attached!</Text> : null}
      </View>

      <Button title="Save Review" onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  actions: { marginVertical: 16 },
  imagePreview: { width: '100%', height: 200, resizeMode: 'cover', marginTop: 8, borderRadius: 8 },
  locationText: { color: 'green', marginTop: 4, fontWeight: 'bold' }
});
