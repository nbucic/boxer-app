import { router } from 'expo-router';
import { ItemsList } from '@/components/box/ItemsList';
import { ListHeader } from '@/components/list/ListHeader';
import { deleteTool, getTools } from '@/services/tool';
import { ToolCard } from '@/components/list/ToolCard';
import { Tool, ToolWithBox } from '@/types/tools';
import { EmptyList } from '@/components/list/EmptyList';
import { EditIcon, TrashIcon, WrenchIcon } from 'lucide-react-native';
import { useListScreen } from '@/hooks/useListScreen';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { FAB } from '@/components/common/FAB';

const LAYOUT_STORAGE_KEY = '@items_layout';

export default function Index() {
  const {
    data,
    refetch,
    isRefetching,
    layout,
    toggleLayout,
    handleDelete,
    activeSwipeableRef,
    closeTheSwipedRef,
    onSwipeStart,
    statusContent,
  } = useListScreen<Tool>({
    queryKey: ['tools'],
    fetchDataFn: () => getTools({}),
    deleteItemFn: deleteTool,
    layoutStorageKey: LAYOUT_STORAGE_KEY,
    itemName: 'Tool',
    loadingDataMessage: 'Finding all your tools across the boxes...',
  });

  return (
    statusContent() ?? (
      <ScreenContainer scrollable={false}>
        <ItemsList
          data={data || []}
          renderItem={({ item }) => {
            return (
              <ToolCard
                item={item as ToolWithBox}
                listType={'swipeable'}
                layout={layout}
                swipeProperties={{
                  setRef: (ref) => (activeSwipeableRef.current = ref),
                  onSwipeStart,
                  renderLeftActions: [
                    {
                      onPress: () => {
                        closeTheSwipedRef();
                        setTimeout(() => {
                          router.push(`/tool/${item.id}/edit`);
                        }, 100);
                      },
                      text: 'Edit',
                      icon: EditIcon,
                      className: 'bg-primary-500',
                    },
                  ],
                  renderRightActions: [
                    {
                      onPress: () => {
                        handleDelete(item.id, item.name);
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
          listHeaderComponent={
            <ListHeader
              title={'Items'}
              layout={layout}
              setLayout={toggleLayout}
              refetch={refetch}
              isRefetching={isRefetching}
            />
          }
          listEmptyComponent={
            <EmptyList
              titleIcon={WrenchIcon}
              title={'Tools'}
              subtitle={
                "The tool makes the workman. Let's add a few of them, shall we?"
              }
              linkLocation={'/tools/create'}
              linkCallToAction={'+ Add new tool'}
            />
          }
          isRefetching={isRefetching}
          refetch={refetch}
          numColumns={layout === 'list' ? 1 : 2}
        />

        <FAB onPress={() => router.push('/tool/create')} />
      </ScreenContainer>
    )
  );
}
