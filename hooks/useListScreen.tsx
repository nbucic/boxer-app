import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Layout } from '@/types';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { showAlert } from '@/lib/helpers/alert';
import { DataLoader } from '@/components/layout/DataLoader';
import { DataError } from '@/components/layout/DataError';
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

interface UseListScreenProps<T> {
  queryKey: string[];
  fetchDataFn: () => Promise<T[]>;
  deleteItemFn: (id: string) => Promise<void>;
  layoutStorageKey: string;
  itemName: string;
  loadingDataMessage: string;
  hideFabWhenScrolling?: boolean;
}

export const useListScreen = <T extends { id: string; name: string }>(
  props: UseListScreenProps<T>
) => {
  const {
    queryKey,
    fetchDataFn,
    deleteItemFn,
    layoutStorageKey,
    itemName,
    loadingDataMessage = '',
    hideFabWhenScrolling = false,
  } = props;

  const queryClient = useQueryClient();
  const activeSwipeableRef = useRef<SwipeableMethods | null>(null);
  const [layout, setLayout] = useState<Layout>('list');
  const [isLoadingLayout, setIsLoadingLayout] = useState<boolean>(true);
  const scrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });

  const { data, status, error, isFetching, refetch, isRefetching } = useQuery({
    queryKey: queryKey,
    queryFn: fetchDataFn,
    placeholderData: (previousData) => previousData,
  });

  const { mutate } = useMutation({
    mutationFn: (id: string) => deleteItemFn(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKey });
    },
    onError: (e: Error) => {
      showAlert({
        title: 'Error',
        message: `Failed to delete ${itemName}: ${e.message}`,
      });
    },
  });

  const statusContent = () => {
    if (isFetching || isLoadingLayout) {
      return <DataLoader text={loadingDataMessage} />;
    }

    if (status === 'error' && error) {
      return <DataError text={`Error fetching boxes: ${error.message}`} />;
    }

    return null;
  };

  const closeTheSwipedRef = useCallback(() => {
    activeSwipeableRef.current?.close();
  }, []);

  const onSwipeStart = useCallback((ref: SwipeableMethods | null) => {
    if (activeSwipeableRef.current && activeSwipeableRef.current !== ref) {
      activeSwipeableRef.current.close();
    }
    activeSwipeableRef.current = ref;
  }, []);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      showAlert({
        title: `Delete ${itemName}`,
        message: `Are you sure you want to delete ${name}?`,
        onCancel: () => activeSwipeableRef.current?.close(),
        onConfirm: () => mutate(id),
      });
    },
    [mutate, itemName]
  );

  // Toggle helper for the UI
  const toggleLayout = useCallback(() => {
    setLayout((prev) => (prev === 'list' ? 'grid' : 'list'));
  }, []);

  useEffect(() => {
    const initialLayout = async () => {
      const savedLayout = await AsyncStorage.getItem(layoutStorageKey);
      if (savedLayout) {
        setLayout(savedLayout as Layout);
      }
      setIsLoadingLayout(false);
    };
    void initialLayout();
  }, [layoutStorageKey]);

  useEffect(() => {
    if (!isLoadingLayout) {
      void AsyncStorage.setItem(layoutStorageKey, layout);
    }
  }, [layout, isLoadingLayout, layoutStorageKey]);

  return {
    data: data || [],
    refetch,
    isRefetching,
    layout,
    toggleLayout,
    handleDelete,
    activeSwipeableRef,
    closeTheSwipedRef,
    onSwipeStart,
    statusContent,
    ...(hideFabWhenScrolling ? { scrollOffset, scrollHandler } : {}),
  };
};
