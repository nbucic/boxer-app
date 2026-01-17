import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getLocation } from '@/services/location';
import { Text } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { fetchAllBoxes } from '@/services/box';
import { BoxCard } from '@/components/list/BoxCard';
import { Box } from '@/components/ui/box';
import WithFab from '@/components/layout/withFab';
import { ScrollTextIcon } from 'lucide-react-native';
import { ListHeader } from '@/components/list/ListHeader';
import { ItemsList } from '@/components/box/ItemsList';
import { Box as BoxType } from '@/types/box';
import { DataLoader } from '@/components/layout/elements/DataLoader';
import { DataError } from '@/components/layout/elements/DataError';

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
    return <DataLoader text={'Loading location ...'} />;
  }

  if (error || !location) {
    return (
      <DataError
        text={`Error loading location: ${error ? error.message : 'No such location'}`}
      />
    );
  }

  return (
    <WithFab onFabPress={() => router.push(`/box/create?locationId=${id}`)}>
      <Box className={'flex-1 bg-background-0'}>
        <ListHeader
          title={location.name}
          subtitle={location.description ?? undefined}
          subtitleIcon={ScrollTextIcon}
          showBackButton={true}
        />
        <Text
          className={'text-xl font-bold text-gray-900 dark:text-white px-4'}
        >
          Boxes at this location
        </Text>
        <VStack className="flex-1 gap-4">
          <ItemsList
            data={boxes || []}
            renderItem={({ item }) => (
              <BoxCard
                item={item as BoxType}
                layout={'list'}
                listType={'static'}
              />
            )}
          />
        </VStack>
      </Box>
    </WithFab>
  );
};

export default LocationDetailsScreen;
