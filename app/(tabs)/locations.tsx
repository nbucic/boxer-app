import { locationService } from '@/services/location';
import { Location } from '@/types/location';
import { LocationCard } from '@/components/list/LocationCard';
import { LocationEditIcon } from 'lucide-react-native';
import { EntityListScreen } from '@/components/screens/EntityListScreen';
import { useConfirm } from '@/hooks/useConfirm';

export default function Locations() {
  const { confirm, ConfirmDialog } = useConfirm();

  const handleDeleteAttempt = async (
    id: string,
    name: string,
    defaultHandler: () => void
  ) => {
    try {
      const locationEmpty = await locationService.isEmpty(id);

      if (!locationEmpty) {
        confirm({
          title: 'Cannot delete location',
          message: `The location "${name}" is still associated with one or more boxes. Please move or delete the boxes first.`,
          hideConfirm: true,
        });
      } else {
        defaultHandler();
      }
    } catch (e) {
      confirm({
        title: 'Error',
        message: `An error occurred while checking for location: ${(e as Error).message}`,
      });
    }
  };

  return (
    <>
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
      <ConfirmDialog />
    </>
  );
}
