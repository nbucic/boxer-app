import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getBox } from '@/services/box';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import WithFab from '@/components/layout/withFab';
import { fetchAllTools } from '@/services/tool';
import { ToolCard } from '@/components/list/ToolCard';
import { Box } from '@/components/ui/box';

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
        <VStack className="flex-1 p-4 gap-4">
          <Text className="text-3xl font-bold">{box?.name}</Text>
          {box?.publicImageUrl ? (
            <Image
              source={{ uri: box.publicImageUrl }}
              className={'w-full aspect-square rounded-lg'}
              resizeMode={'cover'}
            />
          ) : (
            <View className={'w-full h-full rounded-lg bg-neutral-200'} />
          )}
          <Text className="text-lg">{box?.description}</Text>
          <Text className={'text-xl font-bold mt-5'}>
            Tools at this location:
          </Text>
          <FlatList
            data={tools}
            renderItem={({ item }) => <ToolCard tool={item} />}
            keyExtractor={(item) => item.id}
          />
        </VStack>
      </Box>
    </WithFab>
  );
}
