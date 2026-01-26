import { locationService } from '@/services/location';
import { Location } from '@/types/location';
import { LocationCard } from '@/components/list/LocationCard';
import { LocationEditIcon } from 'lucide-react-native';
import { EntityListScreen } from '@/components/screens/EntityListScreen';
import { Alert } from '@/lib/helpers/alert/Alert';

export default function Locations() {
  const handleDeleteAttempt = async (
    id: string,
    name: string,
    defaultHandler: () => void
  ) => {
    try {
      const locationEmpty = await locationService.isEmpty(id);

      if (!locationEmpty) {
        Alert({
          title: 'Cannot Delete Location',
          message:
            'This location is still associated with one or more boxes. Please move or delete the boxes before deleting the location.',
        });
      } else {
        defaultHandler();
      }
    } catch (e) {
      Alert({
        title: 'Error',
        message: `An error occurred while checking for boxes: ${(e as Error).message}`,
      });
    }
  };

  return (
    <EntityListScreen<Location>
      queryKey={['locations']}
      fetchDataFn={() => locationService.getList()}
      deleteItemFn={(id: string) => locationService.delete(id)}
      prefetchItemFn={(id: string) => locationService.get(id)}
      itemName="Location"
      screenTitle="Locations"
      loadingDataMessage="Finding all your locations ..."
      layoutStorageKey="@locations_layout"
      supportsLayoutToggle={false}
      editRoute={(id) => `/location/${id}/edit`}
      createRoute="/location/create"
      emptyStateIcon={LocationEditIcon}
      emptyStateTitle="No locations found"
      emptyStateSubtitle="It looks like your location list is currently empty."
      emptyStateAction="+ Add new location"
      renderCard={({ item, swipeProperties }) => (
        <LocationCard item={item} swipeProperties={swipeProperties} />
      )}
      customDeleteHandler={handleDeleteAttempt}
    />
  );
}
