import { ActivityIndicator, Alert, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Link, router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteLocation,
  getLocations,
  isLocationEmpty,
} from '@/services/location';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useRef } from 'react';
import WithFab from '@/components/layout/withFab';
import { ListHeader } from '@/components/list/ListHeader';
import { ItemsList } from '@/components/box/ItemsList';
import { Location } from '@/types/location';
import { LocationCard } from '@/components/list/LocationCard';
import { EmptyList } from '@/components/list/EmptyList';
import { InfoIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { showAlert } from '@/lib/helpers/alert';
import { Box } from '@/components/ui/box';

export default function Locations() {
  const queryClient = useQueryClient();
  const swipeableRefs = useRef<{ [key: string]: SwipeableMethods | null }>({});
  const { data, status, error, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations({}),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (e: Error) => {
      Alert.alert('Error', `Failed to delete location: ${e.message}`);
    },
  });

  const handleDeleteAttempt = async (locationId: string) => {
    try {
      const locationEmpty = await isLocationEmpty(locationId);

      if (!locationEmpty) {
        showAlert({
          title: 'Cannot Delete Location',
          message:
            'This location is still associated with one or more boxes. Please move or delete the boxes before deleting the location.',
        });
      } else {
        deleteMutation.mutate(locationId);
      }
    } catch (e) {
      showAlert({
        title: 'Error',
        message: 'An error occurred white checking for boxes.',
      });
    }
  };

  if (isFetching) {
    return (
      <View className={'flex-1 justify-center'}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (status === 'error' && error) {
    return (
      <View className={'flex-1 justify-center items-center p-4'}>
        <Text className={'text-error-500'}>
          Error fetching locations: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <WithFab onFabPress={() => router.push('/location/create')}>
      <GestureHandlerRootView>
        <Box className={'flex-1 bg-white dark:bg-black'}>
          <ItemsList
            data={data || []}
            renderItem={({ item }) => (
              <LocationCard
                item={item as Location}
                onDelete={handleDeleteAttempt}
                setRef={(ref) => (swipeableRefs.current[item.id] = ref)}
                close={() => swipeableRefs.current[item.id]?.close()}
              />
            )}
            ListHeaderComponent={
              <ListHeader
                title="Locations"
                refetch={refetch}
                isRefetching={isRefetching}
              />
            }
            ListEmptyComponent={
              <EmptyList
                content={
                  <HStack space={'sm'}>
                    <Icon as={InfoIcon} />
                    <Text>
                      No location yet!{' '}
                      <Link
                        href={'/location/create'}
                        className={'text-red-300 underline decoration-dashed'}
                      >
                        Add
                      </Link>{' '}
                      a new box{' '}
                    </Text>
                  </HStack>
                }
              />
            }
            isRefetching={isRefetching}
            refetch={refetch}
          />
        </Box>
      </GestureHandlerRootView>
    </WithFab>
  );
}
