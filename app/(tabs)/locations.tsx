import { router } from 'expo-router';
import {
  deleteLocation,
  getLocations,
  isLocationEmpty,
} from '@/services/location';
import { ListHeader } from '@/components/list/ListHeader';
import { ItemsList } from '@/components/box/ItemsList';
import { Location } from '@/types/location';
import { LocationCard } from '@/components/list/LocationCard';
import { EmptyList } from '@/components/list/EmptyList';
import { showAlert } from '@/lib/helpers/alert';
import { EditIcon, LocationEditIcon, TrashIcon } from 'lucide-react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { FAB } from '@/components/common/FAB';
import { useListScreen } from '@/hooks/useListScreen';

export default function Locations() {
  const {
    data,
    refetch,
    isRefetching,
    handleDelete,
    activeSwipeableRef,
    closeTheSwipedRef,
    onSwipeStart,
    statusContent,
  } = useListScreen<Location>({
    queryKey: ['locations'],
    fetchDataFn: () => getLocations({}),
    deleteItemFn: deleteLocation,
    layoutStorageKey: '@locations_layout',
    itemName: 'Location',
    loadingDataMessage: 'Finding all your locations ...',
  });

  const handleDeleteAttempt = async (id: string, name: string) => {
    try {
      const locationEmpty = await isLocationEmpty(id);

      if (!locationEmpty) {
        showAlert({
          title: 'Cannot Delete Location',
          message:
            'This location is still associated with one or more boxes. Please move or delete the boxes before deleting the location.',
        });
        closeTheSwipedRef();
      } else {
        handleDelete(id, name);
      }
    } catch (e) {
      showAlert({
        title: 'Error',
        message: 'An error occurred white checking for boxes.',
      });
    }
  };

  return (
    statusContent() ?? (
      <ScreenContainer scrollable={false}>
        <ItemsList
          data={data || []}
          renderItem={({ item }) => {
            return (
              <LocationCard
                item={item as Location}
                swipeProperties={{
                  setRef: (ref) => (activeSwipeableRef.current = ref),
                  onSwipeStart,
                  renderLeftActions: [
                    {
                      onPress: () => {
                        closeTheSwipedRef();
                        setTimeout(() => {
                          router.push(`/location/${item.id}/edit`);
                        }, 100);
                      },
                      text: 'Edit',
                      icon: EditIcon,
                      className: 'bg-primary-500',
                    },
                  ],
                  renderRightActions: [
                    {
                      onPress: () => handleDeleteAttempt(item.id, item.name),
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
    )
  );
}
