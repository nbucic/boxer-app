import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getTool } from '@/services/tool';
import { Image, Text, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { ListHeader } from '@/components/list/ListHeader';
import { ScrollTextIcon } from 'lucide-react-native';
import { DataLoader } from '@/components/layout/DataLoader';
import { DataError } from '@/components/layout/DataError';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

export default function ToolDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    router.back();
  }

  const {
    data: tool,
    isLoading: toolLoading,
    error: toolError,
  } = useQuery({
    queryKey: ['tool', id],
    queryFn: () => getTool(id),
    enabled: !!id,
  });

  if (toolLoading) {
    return <DataLoader text={'Examining tool info ...'} />;
  }

  if (toolError || !tool) {
    return (
      <DataError
        text={`Error loading tool: ${toolError ? toolError.message : 'No such tool'}`}
      />
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      header={
        <ListHeader
          title={tool.name + '-'}
          subtitle={tool.description || undefined}
          subtitleIcon={ScrollTextIcon}
          backButton={'/'}
        />
      }
    >
      <VStack className={'flex-1 gap-4'}>
        {tool.image_url ? (
          <Image
            source={{ uri: tool.image_url }}
            className={'w-full aspect-square rounded-lg'}
            resizeMode={'contain'}
          />
        ) : (
          <View className={'w-full aspect-square rounded-lg bg-neutral-200'} />
        )}
        <Text className={'text-xl font-bold text-typography-900 px-4'}>
          Located at {tool.box.name}
        </Text>
      </VStack>
    </ScreenContainer>
  );
}
