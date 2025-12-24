import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import WithFab from '@/components/layout/withFab';
import { router } from 'expo-router';
import { ItemsList } from '@/components/box/ItemsList';
import { ListHeader } from '@/components/list/ListHeader';
import { deleteTool, fetchAllTools } from '@/services/tool';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { ToolCard } from '@/components/list/ToolCard';
import { Tool } from '@/types/tools';
import { EmptyList } from '@/components/list/EmptyList';
import { EditIcon, TrashIcon, WrenchIcon } from 'lucide-react-native';
import { showAlert } from '@/lib/helpers/alert';
import { useListScreen } from '@/hooks/useListScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const LAYOUT_STORAGE_KEY = '@items_layout';

export default function Index() {
  const {
    data,
    status,
    error,
    isFetching,
    refetch,
    isRefetching,
    layout,
    setLayout,
    deleteMutation,
    isLoadingLayout,
    swipeableRefs,
  } = useListScreen<Tool>({
    queryKey: ['tools'],
    fetchDataFn: () => fetchAllTools({}),
    deleteItemFn: deleteTool,
    layoutStorageKey: LAYOUT_STORAGE_KEY,
    itemName: 'Tool',
  });

  if (isFetching || isLoadingLayout) {
    return (
      <View className={'flex-1 justify-center'}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (status === 'error' && error) {
    return (
      <View className={'flex-1 justify-center items-center p-4'}>
        <Text className={'text-error-500'}>
          Error fetching boxes: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <WithFab onFabPress={() => router.push('/tool/create')}>
      <GestureHandlerRootView>
        <Box className={'flex-1 bg-white dark:bg-black'}>
          <ItemsList
            data={data || []}
            renderItem={({ item }) => {
              const closeSwipedItem = swipeableRefs.current[item.id]?.close;

              return (
                <ToolCard
                  item={item as Tool}
                  listType={'swipeable'}
                  layout={layout}
                  swipeProperties={{
                    setRef: (ref) => (swipeableRefs.current[item.id] = ref),
                    renderLeftActions: [
                      {
                        onPress: () => {
                          closeSwipedItem?.();
                          setTimeout(() => {
                            router.push(`/tool/${item.id}/edit`);
                          }, 100);
                        },
                        text: 'Edit',
                        icon: EditIcon,
                        className: 'bg-blue-500',
                      },
                    ],
                    renderRightActions: [
                      {
                        onPress: () => {
                          showAlert({
                            title: 'Delete Tool',
                            message: `Are you sure you want to delete ${item.name}?`,
                            onConfirm: () => {
                              deleteMutation.mutate(item.id);
                              closeSwipedItem?.();
                            },
                            onCancel: closeSwipedItem,
                          });
                        },
                        text: 'Delete',
                        icon: TrashIcon,
                        className: 'bg-red-500',
                      },
                    ],
                  }}
                />
              );
            }}
            ListHeaderComponent={
              <ListHeader
                title={'Items'}
                layout={layout}
                setLayout={setLayout}
                refetch={refetch}
                isRefetching={isRefetching}
              />
            }
            ListEmptyComponent={
              <EmptyList
                content={
                  <>
                    <WrenchIcon className={'w-12 h-12 text-blue-500 mb-4'} />
                    <Text
                      className={
                        'text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2'
                      }
                    >
                      No tools found
                    </Text>
                    <Text
                      className={
                        'text-base text-gray-500 dark:text-gray-400 mb-6 text-center'
                      }
                    >
                      It looks like your tool inventory is currently empty.
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push('/tool/create')}
                      className={
                        'px-6 py-3 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors'
                      }
                    >
                      <Text className={'text-lg font-medium text-white'}>
                        + Add new tool
                      </Text>
                    </TouchableOpacity>
                  </>
                }
              />
            }
            isRefetching={isRefetching}
            refetch={refetch}
            numColumns={layout === 'list' ? 1 : 2}
          />
        </Box>
      </GestureHandlerRootView>
    </WithFab>
  );
}
