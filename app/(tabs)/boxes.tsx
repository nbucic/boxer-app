import { boxService } from '@/services/box';
import { useCallback, useState } from 'react';
import { BoxCard } from '@/components/list/BoxCard';
import { Box } from '@/types/box';
import ShareBox from '@/components/box/ShareBox';
import { BoxIcon, EditIcon, QrCodeIcon } from 'lucide-react-native';
import { EntityListScreen } from '@/components/screens/EntityListScreen';

export default function Boxes() {
  const [shareModalBox, setShareModalBox] = useState<Box | null>(null);

  const handleOpenShareModal = useCallback((box: Box) => {
    setShareModalBox(box);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShareModalBox(null);
  }, []);

  return (
    <>
      <EntityListScreen<Box>
        queryKey={['boxes']}
        fetchDataFn={() =>
          boxService.getList({}, { include: 'location:locations (id, name)' })
        }
        deleteItemFn={(id: string) => boxService.delete(id)}
        prefetchItemFn={(id: string) => boxService.getEditData(id)}
        itemName="Box"
        screenTitle="Boxes"
        loadingDataMessage="Getting your boxes ready ..."
        layoutStorageKey="@boxes_layout"
        editRoute={(id) => `/box/${id}/edit`}
        createRoute="/box/create"
        emptyStateIcon={BoxIcon}
        emptyStateTitle="No boxes found"
        emptyStateSubtitle="It looks like your box inventory is currently empty."
        emptyStateAction="+ Add new box"
        renderCard={({ item, layout, swipeProperties }) => (
          <BoxCard
            item={item}
            listType="swipeable"
            layout={layout}
            swipeProperties={swipeProperties}
          />
        )}
        customLeftActions={(item, closeSwipe, handleEdit) => [
          {
            onPress: () => handleEdit(item.id),
            text: 'Edit',
            icon: EditIcon,
            className: 'bg-primary-500',
          },
          {
            onPress: () => {
              closeSwipe();
              handleOpenShareModal(item);
            },
            text: 'Share',
            icon: QrCodeIcon,
            className: 'bg-green-500',
          },
        ]}
      />
      {shareModalBox && (
        <ShareBox
          box={shareModalBox}
          isOpen={!!shareModalBox}
          onClose={handleCloseShareModal}
        />
      )}
    </>
  );
}
