import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getTool } from '@/services/tool';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';

export default function ToolDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    router.back();
  }

  const {
    data: toolData,
    isLoading: toolLoading,
    error: toolError,
  } = useQuery({
    queryKey: ['tool', id],
    queryFn: () => getTool(id),
    enabled: !!id,
  });

  if (toolLoading) {
    return <ActivityIndicator size={'large'} className={'flex-1'} />;
  }

  if (toolError || !toolData) {
    return (
      <View className={'flex-1 justify-center items-center'}>
        <Text>
          Error loading tool: {toolError ? toolError.message : 'No such tool'}
        </Text>
      </View>
    );
  }

  return (
    <Box className={'flex-1 bg-white dark:bg-black'}>
      <VStack className="flex-1 p-4 gap-4">
        <Text className="text-3xl font-bold">{toolData.name}</Text>
        {toolData.publicImageUrl ? (
          <Image
            source={{ uri: toolData.publicImageUrl }}
            className={'w-full aspect-square rounded-lg'}
            resizeMode={'cover'}
          />
        ) : (
          <View className={'w-full h-full rounded-lg bg-neutral-200'} />
        )}
        <Text className="text-lg">{toolData.description}</Text>
      </VStack>
    </Box>
  );
}
