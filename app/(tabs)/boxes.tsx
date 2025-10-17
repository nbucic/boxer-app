import { ActivityIndicator, View } from 'react-native';
import WithFab from '@/components/layout/withFab';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchAllBoxes } from '@/services/box';
import { Text } from '@/components/ui/text';
import { useCallback, useEffect, useState } from 'react';
import { Layout } from '@/types/layout';
import { ItemsList } from '@/components/box/ItemsList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BoxCard } from '@/components/list/BoxCard';
import { ListHeader } from '@/components/list/ListHeader';
import { Box } from '@/types/box';
import ShareBox from '@/components/box/ShareBox';

const LAYOUT_STORAGE_KEY = '@boxes_layout';

export default function Boxes() {
  const [layout, setLayout] = useState<Layout>('list'); // 'list' or 'grid'
  const [isLoadingLayout, setIsLoadingLayout] = useState(true);
  const [shareModalBox, setShareModalBox] = useState<Box | null>(null);
  const { data, status, error, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ['boxes'],
    queryFn: fetchAllBoxes,
    placeholderData: (previousData) => previousData,
  });

  const handleOpenShareModal = useCallback((box: Box) => {
    setShareModalBox(box);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setShareModalBox(null);
  }, []);

  // Effect to load the layout from storage on the component mount
  useEffect(() => {
    const loadLayout = async () => {
      try {
        const savedLayout = await AsyncStorage.getItem(LAYOUT_STORAGE_KEY);
        if (savedLayout !== null) {
          setLayout(savedLayout as Layout);
        }
      } catch (e) {
        console.error('Failed to load layout from storage', e);
      } finally {
        setIsLoadingLayout(false);
      }
    };

    void loadLayout();
  }, []);

  // Effect to save the layout to storage whenever it changes
  useEffect(() => {
    // Don't save the initial default value until loading is complete
    if (!isLoadingLayout) {
      const saveLayout = async () => {
        try {
          await AsyncStorage.setItem(LAYOUT_STORAGE_KEY, layout);
        } catch (e) {
          console.error('Failed to save layout to storage', e);
        }
      };
      void saveLayout();
    }
  }, [layout, isLoadingLayout]);

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
    <WithFab onFabPress={() => router.push('/modal/editBox')}>
      <ItemsList
        data={data || []}
        renderItem={({ item }) => (
          <BoxCard
            box={item as Box}
            layout={layout}
            onShare={handleOpenShareModal}
          />
        )}
        ListHeaderComponent={
          <ListHeader
            title="Boxes"
            layout={layout}
            setLayout={setLayout}
            refetch={refetch}
            isRefetching={isRefetching}
          />
        }
        isRefetching={isRefetching}
        refetch={refetch}
      />
      {shareModalBox && (
        <ShareBox
          box={shareModalBox}
          isOpen={!!shareModalBox}
          onClose={handleCloseShareModal}
        />
      )}
    </WithFab>
  );
}
