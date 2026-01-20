import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteLocation,
  getLocations,
  isLocationEmpty,
} from '@/services/location';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useRef } from 'react';
import { ListHeader } from '@/components/list/ListHeader';
import { ItemsList } from '@/components/box/ItemsList';
import { Location } from '@/types/location';
import { LocationCard } from '@/components/list/LocationCard';
import { EmptyList } from '@/components/list/EmptyList';
import { showAlert } from '@/lib/helpers/alert';
import { EditIcon, LocationEditIcon, TrashIcon } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DataLoader } from '@/components/layout/DataLoader';
import { DataError } from '@/components/layout/DataError';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { FAB } from '@/components/common/FAB';

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
    return <DataLoader text={'Sorting your locations ...'} />;
  }

  if (status === 'error' && error) {
    return <DataError text={`Error fetching locations: ${error.message}`} />;
  }

  return (
    <GestureHandlerRootView>
      <ScreenContainer scrollable={false}>
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
                      className: 'bg-success-500',
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
                      className: 'bg-error-500',
                    },
                  ],
                }}
              />
            );
          }}
          listHeaderComponent={
            <ListHeader
              title={'Locations'}
              refetch={refetch}
              isRefetching={isRefetching}
            />
          }
          listEmptyComponent={
            <EmptyList
              titleIcon={LocationEditIcon}
              title={'No locations found'}
              subtitle={'It looks like your location list is currently empty.'}
              linkLocation={'/location/create'}
              linkCallToAction={'+ Add new location'}
            />
          }
          isRefetching={isRefetching}
          refetch={refetch}
        />

        <FAB onPress={() => router.push('/location/create')} />
      </ScreenContainer>
    </GestureHandlerRootView>
  );
}
