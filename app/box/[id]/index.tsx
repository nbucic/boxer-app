import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getBox } from '@/services/box';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import WithFab from '@/components/layout/withFab';
import { fetchAllTools } from '@/services/tool';
import { ToolCard } from '@/components/list/ToolCard';
import { Box } from '@/components/ui/box';
import { ListHeader } from '@/components/list/ListHeader';
import { ScrollTextIcon } from 'lucide-react-native';
import { ItemsList } from '@/components/box/ItemsList';
import { Tool } from '@/types/tools';

export default function BoxDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: box,
    isLoading: boxLoading,
    error: boxError,
  } = useQuery({
    queryKey: ['box', id],
    queryFn: () => getBox(id),
    enabled: !!id,
  });

  const {
    data: tools,
    isLoading: toolsLoading,
    error: toolsError,
  } = useQuery({
    queryKey: ['tools', 'box', id],
    queryFn: () => fetchAllTools({ filter: { box: id } }),
    enabled: !!id,
  });

  const isLoading = boxLoading || toolsLoading;
  const error = boxError || toolsError;

  if (isLoading) {
    return <ActivityIndicator size={'large'} className={'flex-1'} />;
  }

  if (error || !box) {
    return (
      <View className={'flex-1 justify-center items-center'}>
        <Text>Error loading box: {error ? error.message : 'No such box'}</Text>
      </View>
    );
  }

  return (
    <WithFab onFabPress={() => router.push(`/tool/create?boxId=${id}`)}>
      <Box className={'flex-1 bg-white dark:bg-black'}>
        <ListHeader
          title={box.name}
          subtitle={box.description ?? undefined}
          subtitleIcon={ScrollTextIcon}
          showBackButton={true}
        />
        <VStack className="flex-1 p-4 gap-4">
          {box?.image_url ? (
            <Image
              source={{ uri: box.image_url }}
              className={'w-full aspect-square rounded-lg'}
              resizeMode={'cover'}
            />
          ) : (
            <View className={'w-full h-full rounded-lg bg-neutral-200'} />
          )}
          <Text className={'text-xl font-bold text-gray-900 dark:text-white'}>
            Tools at this location:
          </Text>
          <ItemsList
            data={tools || []}
            renderItem={({ item }) => (
              <ToolCard
                item={item as Tool}
                layout={'list'}
                listType={'static'}
              />
            )}
          />
        </VStack>
      </Box>
    </WithFab>
  );
}
