import { Alert } from 'react-native';
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
import { DataLoader } from '@/components/layout/elements/DataLoader';
import { DataError } from '@/components/layout/elements/DataError';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from '@/components/ui/button';

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
    <WithFab onFabPress={() => router.push('/location/create')}>
      <GestureHandlerRootView>
        <Box className={'flex-1 bg-background-0'}>
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
                      className={'w-16 h-16 text-primary-500 mb-4 opacity-80'}
                    />

                    <VStack space={'xs'} className={'items-center'}>
                      <Text className={'text-xl font-bold text-typography-900'}>
                        No locations found
                      </Text>
                      <Text
                        className={
                          'text-base text-typography-500 text-center px-4'
                        }
                      >
                        It looks like your location list is currently empty.
                      </Text>
                    </VStack>

                    <Button
                      size={'lg'}
                      className={
                        'mt-8 bg-primary-500 rounded-xl px-8 shadow-soft-1'
                      }
                      onPress={() => router.push('/location/create')}
                    >
                      <ButtonText className={'font-semibold text-white'}>
                        + Add new location
                      </ButtonText>
                    </Button>
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
