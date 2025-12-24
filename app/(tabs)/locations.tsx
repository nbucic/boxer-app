import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
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
import { showAlert } from '@/lib/helpers/alert';
import { Box } from '@/components/ui/box';
import { EditIcon, LocationEditIcon, TrashIcon } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
            renderItem={({ item }) => {
              const closeSwipedItem = swipeableRefs.current[item.id]?.close;
              return (
                <LocationCard
                  item={item as Location}
                  swipeProperties={{
                    setRef: (ref) => (swipeableRefs.current[item.id] = ref),
                    renderLeftActions: [
                      {
                        onPress: () => {
                          closeSwipedItem?.();
                          setTimeout(() => {
                            router.push(`/location/${item.id}/edit`);
                          }, 100);
                        },
                        text: 'Edit',
                        icon: EditIcon,
                        className: 'bg-blue-500',
                      },
                    ],
                    renderRightActions: [
                      {
                        onPress: () => {
                          showAlert({
                            title: 'Delete location',
                            message: `Are you sure you want to delete ${item.name}?`,
                            onCancel: closeSwipedItem,
                            onConfirm: async () => {
                              await handleDeleteAttempt(item.id);
                              closeSwipedItem?.();
                            },
                          });
                        },
                        text: 'Delete',
                        icon: TrashIcon,
                        className: 'bg-red-500',
                      },
                    ],
                  }}
                />
              );
            }}
            ListHeaderComponent={
              <ListHeader
                title={'Locations'}
                refetch={refetch}
                isRefetching={isRefetching}
              />
            }
            ListEmptyComponent={
              <EmptyList
                content={
                  <>
                    <LocationEditIcon
                      className={'w-12 h-12 text-blue-500 mb-4'}
                    />
                    <Text
                      className={
                        'text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2'
                      }
                    >
                      No locations found
                    </Text>
                    <Text
                      className={
                        'text-base text-gray-500 dark:text-gray-400 mb-6 text-center'
                      }
                    >
                      It looks like your location list is currently empty.
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push('/location/create')}
                      className={
                        'px-6 py-3 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors'
                      }
                    >
                      <Text className={'text-lg font-medium text-white'}>
                        + Add new location
                      </Text>
                    </TouchableOpacity>
                  </>
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
