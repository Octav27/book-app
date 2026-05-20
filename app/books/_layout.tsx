import { Stack } from 'expo-router';

export default function BooksLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: 'Book Details' }} />
      <Stack.Screen name="add-review" options={{ title: 'Add Review', presentation: 'modal' }} />
    </Stack>
  );
}
