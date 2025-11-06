import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getBox } from '@/services/box';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';

export default function BoxDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: box,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['box', id],
    queryFn: () => getBox(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <ActivityIndicator size={'large'} className={'flex-1'} />;
  }

  if (error) {
    return (
      <View className={'flex-1 justify-center items-center'}>
        <Text>Error loading box: {error.message}</Text>
      </View>
    );
  }

  return (
    <VStack className="flex-1 p-4 gap-4">
      <Stack.Screen options={{ title: box?.name || 'Box Details' }} />
      <Text className="text-3xl font-bold">{box?.name}</Text>
      {box?.publicImageUrl ? (
        <Image
          source={{ uri: box.publicImageUrl }}
          className={'w-full aspect-square rounded-lg'}
          resizeMode={'cover'}
        />
      ) : (
        <View className={'w-full h-full rounded-lg bg-neutral-200'} />
      )}
      <Text className="text-lg">{box?.description}</Text>
      {/* You can add more details about the box here */}
    </VStack>
  );
}
