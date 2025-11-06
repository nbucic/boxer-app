import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getLocation } from '@/services/location';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { fetchAllBoxes } from '@/services/box';
import { BoxCard } from '@/components/list/BoxCard';
import { Box } from '@/types/box';
import WithFab from '@/components/layout/withFab';

const LocationDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    router.replace('/');
    return null;
  }

  const {
    data: location,
    isLoading: locationLoading,
    error: locationError,
  } = useQuery({
    queryKey: ['location', id],
    queryFn: () => getLocation(id),
    enabled: !!id,
  });

  const {
    data: boxes,
    isLoading: boxesLoading,
    error: boxesError,
  } = useQuery({
    queryKey: ['boxes', 'location', id],
    queryFn: () => fetchAllBoxes({ filter: { location: id } }),
    enabled: !!id,
  });

  const isLoading = locationLoading || boxesLoading;
  const error = locationError || boxesError;

  if (isLoading) {
    return <ActivityIndicator size={'large'} className={'flex-1'} />;
  }

  if (error || !location) {
    return (
      <View className={'flex-1 justify-center items-center'}>
        <Text>
          Error loading box: {error ? error.message : 'No such location'}
        </Text>
      </View>
    );
  }

  return (
    <WithFab onFabPress={() => router.push(`/box/create?locationId=${id}`)}>
      <VStack className="flex-1 p-4 gap-4">
        <Stack.Screen
          options={{
            title: undefined,
            headerShown: false,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            fullScreenGestureShadowEnabled: true,
          }}
        />
        <Text className="text-3xl font-bold">{location.name}</Text>
        <Text className="text-lg">{location.description}</Text>
        {/* You can add more details about the box here */}
        <Text className={'text-xl font-bold mt-5'}>
          Boxes at this location:
        </Text>
        <FlatList
          data={boxes}
          renderItem={({ item }) => <BoxCard box={item} listType={'static'} />}
          keyExtractor={(item) => (item as Box).id}
        />
      </VStack>
    </WithFab>
  );
};

export default LocationDetailsScreen;
