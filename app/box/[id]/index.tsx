import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { boxService } from '@/services/box';
import { Image, Text, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { toolService } from '@/services/tool';
import { ToolCard } from '@/components/list/ToolCard';
import { ListHeader } from '@/components/list/ListHeader';
import { BoxIcon, ScrollTextIcon } from 'lucide-react-native';
import { ItemsList } from '@/components/box/ItemsList';
import { ToolWithBox } from '@/types/tools';
import { DataLoader } from '@/components/layout/DataLoader';
import { DataError } from '@/components/layout/DataError';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { EmptyList } from '@/components/list/EmptyList';
import { FAB } from '@/components/common/FAB';

export default function BoxDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    router.back();
  }

  const {
    data: box,
    isLoading: boxLoading,
    error: boxError,
  } = useQuery({
    queryKey: ['box', id],
    queryFn: () => boxService.get(id),
    enabled: !!id,
  });

  const {
    data: tools,
    isLoading: toolsLoading,
    error: toolsError,
  } = useQuery({
    queryKey: ['tools', 'box', id],
    queryFn: () =>
      toolService.getList({ box: id }, { include: 'box:boxes (id, name)' }),
    enabled: !!id,
  });

  const isLoading = boxLoading || toolsLoading;
  const error = boxError || toolsError;

  if (isLoading) {
    return <DataLoader text={'Unloading the box ...'} />;
  }

  if (error || !box) {
    return (
      <DataError
        text={`Error loading box: ${error ? error.message : 'No such box'}`}
      />
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      header={
        <ListHeader
          title={box.name}
          subtitle={box.description ?? undefined}
          subtitleIcon={ScrollTextIcon}
          backButton={'/boxes'}
        />
      }
    >
      <VStack className="flex-1 gap-4">
        {box?.image_url ? (
          <Image
            source={{ uri: box.image_url }}
            className={'w-full aspect-square rounded-lg'}
            resizeMode={'contain'}
          />
        ) : (
          <View className={'w-full aspect-square rounded-lg bg-neutral-200'} />
        )}
        {(tools || []).length > 0 && (
          <Text className={'text-xl font-bold text-typography-900 px-4'}>
            Tools at this box
          </Text>
        )}
        <ItemsList
          data={tools || []}
          renderItem={({ item }) => (
            <ToolCard
              item={item as ToolWithBox}
              layout={'list'}
              listType={'static'}
            />
          )}
          listEmptyComponent={
            <EmptyList
              topMargin={false}
              title={'No tools inside the box'}
              subtitle={
                "Looks like your box is completely empty. That's unbelievable."
              }
              titleIcon={BoxIcon}
              linkLocation={`/tool/create?boxId=${id}`}
              linkCallToAction={'+ Add new tool'}
            />
          }
        />
      </VStack>
      <FAB onPress={() => router.push(`/tool/create?boxId=${id}`)} />
    </ScreenContainer>
  );
}
