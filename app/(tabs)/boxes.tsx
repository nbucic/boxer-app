import { Box } from '@/components/ui/box';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import WithFab from '@/components/layout/withFab';
import { router } from 'expo-router';
import { deleteBox, fetchAllBoxes } from '@/services/box';
import { Text } from '@/components/ui/text';
import { useCallback, useState } from 'react';
import { ItemsList } from '@/components/box/ItemsList';
import { BoxCard } from '@/components/list/BoxCard';
import { ListHeader } from '@/components/list/ListHeader';
import { Box as BoxType } from '@/types/box';
import ShareBox from '@/components/box/ShareBox';
import { EmptyList } from '@/components/list/EmptyList';
import { BoxIcon, EditIcon, QrCodeIcon, TrashIcon } from 'lucide-react-native';
import { showAlert } from '@/lib/helpers/alert';
import { useListScreen } from '@/hooks/useListScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const LAYOUT_STORAGE_KEY = '@boxes_layout';

export default function Boxes() {
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
  } = useListScreen<BoxType>({
    queryKey: ['boxes'],
    fetchDataFn: () => fetchAllBoxes({}),
    deleteItemFn: deleteBox,
    layoutStorageKey: LAYOUT_STORAGE_KEY,
    itemName: 'Box',
  });

  const [shareModalBox, setShareModalBox] = useState<BoxType | null>(null);

  const handleOpenShareModal = useCallback((box: BoxType) => {
    setShareModalBox(box);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShareModalBox(null);
  }, []);

  if (isFetching || isLoadingLayout) {
    return (
      <View className={'flex-1 justify-center bg-white dark:bg-black'}>
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
    <WithFab onFabPress={() => router.push('/box/create')}>
      <GestureHandlerRootView>
        <Box className={'flex-1 bg-white dark:bg-black'}>
          <ItemsList
            data={data || []}
            renderItem={({ item }) => {
              const closeSwipedItem = swipeableRefs.current[item.id]?.close;
              return (
                <BoxCard
                  item={item as BoxType}
                  listType={'swipeable'}
                  layout={layout}
                  swipeProperties={{
                    setRef: (ref) => (swipeableRefs.current[item.id] = ref),
                    renderLeftActions: [
                      {
                        onPress: () => {
                          closeSwipedItem?.();
                          setTimeout(() => {
                            router.push(`/box/${item.id}/edit`);
                          }, 100);
                        },
                        text: 'Edit',
                        icon: EditIcon,
                        className: 'bg-blue-500',
                      },
                      {
                        onPress: () => {
                          closeSwipedItem?.();
                          handleOpenShareModal(item as BoxType);
                        },
                        text: 'Share',
                        icon: QrCodeIcon,
                        className: 'bg-green-500',
                      },
                    ],
                    renderRightActions: [
                      {
                        onPress: () => {
                          showAlert({
                            title: 'Delete Box',
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
                title="Boxes"
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
                    <BoxIcon className={'w-12 h-12 text-blue-500 mb-4'} />
                    <Text
                      className={
                        'text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2'
                      }
                    >
                      No boxes found
                    </Text>
                    <Text
                      className={
                        'text-base text-gray-500 dark:text-gray-400 mb-6 text-center'
                      }
                    >
                      It looks like your box inventory is currently empty.
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push('/box/create')}
                      className={
                        'px-6 py-3 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors'
                      }
                    >
                      <Text className={'text-lg font-medium text-white'}>
                        + Add new box
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
          {shareModalBox && (
            <ShareBox
              box={shareModalBox}
              isOpen={!!shareModalBox}
              onClose={handleCloseShareModal}
            />
          )}
        </Box>
      </GestureHandlerRootView>
    </WithFab>
  );
}
