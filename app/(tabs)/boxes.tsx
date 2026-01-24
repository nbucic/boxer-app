import { router } from 'expo-router';
import { boxService } from '@/services/box';
import { useCallback, useState } from 'react';
import { ItemsList } from '@/components/box/ItemsList';
import { BoxCard } from '@/components/list/BoxCard';
import { ListHeader } from '@/components/list/ListHeader';
import { Box as BoxType } from '@/types/box';
import ShareBox from '@/components/box/ShareBox';
import { EmptyList } from '@/components/list/EmptyList';
import { BoxIcon, EditIcon, QrCodeIcon, TrashIcon } from 'lucide-react-native';
import { useListScreen } from '@/hooks/useListScreen';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { FAB } from '@/components/common/FAB';

const LAYOUT_STORAGE_KEY = '@boxes_layout';

export default function Boxes() {
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
    scrollOffset,
    scrollHandler,
  } = useListScreen<BoxType>({
    queryKey: ['boxes'],
    fetchDataFn: () =>
      boxService.getList({}, { include: 'location:locations (id, name)' }),
    deleteItemFn: (id: any) => boxService.delete(id),
    layoutStorageKey: LAYOUT_STORAGE_KEY,
    itemName: 'Box',
    loadingDataMessage: 'Getting your boxes ready ...',
    hideFabWhenScrolling: true,
  });

  const [shareModalBox, setShareModalBox] = useState<BoxType | null>(null);

  const handleOpenShareModal = useCallback((box: BoxType) => {
    setShareModalBox(box);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShareModalBox(null);
  }, []);

  return (
    statusContent() ?? (
      <ScreenContainer scrollable={false}>
        <ItemsList
          data={data}
          onScroll={scrollHandler}
          renderItem={({ item }) => {
            return (
              <BoxCard
                item={item as BoxType}
                listType={'swipeable'}
                layout={layout}
                swipeProperties={{
                  setRef: (ref) => (activeSwipeableRef.current = ref),
                  onSwipeStart: onSwipeStart,
                  renderLeftActions: [
                    {
                      onPress: () => {
                        closeTheSwipedRef();
                        setTimeout(() => {
                          router.push(`/box/${item.id}/edit`);
                        }, 100);
                      },
                      text: 'Edit',
                      icon: EditIcon,
                      className: 'bg-primary-500',
                    },
                    {
                      onPress: () => {
                        closeTheSwipedRef();
                        handleOpenShareModal(item as BoxType);
                      },
                      text: 'Share',
                      icon: QrCodeIcon,
                      className: 'bg-green-500',
                    },
                  ],
                  renderRightActions: [
                    {
                      onPress: () => handleDelete(item.id, item.name),
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
              title="Boxes"
              layout={layout}
              setLayout={toggleLayout}
              refetch={refetch}
              isRefetching={isRefetching}
            />
          }
          listEmptyComponent={
            <EmptyList
              titleIcon={BoxIcon}
              title={'No boxes found'}
              subtitle={'It looks like your box inventory is currently empty.'}
              linkLocation={'/box/create'}
              linkCallToAction={'+ Add new box'}
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

        <FAB
          onPress={() => router.push('/box/create')}
          scrollOffset={scrollOffset}
        />
      </ScreenContainer>
    )
  );
}
