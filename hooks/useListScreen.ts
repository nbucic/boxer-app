import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Layout } from '@/types';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { showAlert } from '@/lib/helpers/alert';

interface UseListScreenProps<T> {
  queryKey: string[];
  fetchDataFn: () => Promise<T[]>;
  deleteItemFn: (id: string) => Promise<void>;
  layoutStorageKey: string;
  itemName: string;
}

export const useListScreen = <T extends { id: string; name: string }>(
  props: UseListScreenProps<T>
) => {
  const { queryKey, fetchDataFn, deleteItemFn, layoutStorageKey, itemName } =
    props;

  const queryClient = useQueryClient();
  const swipeableRefs = useRef<{ [key: string]: SwipeableMethods | null }>({});
  const [layout, setLayout] = useState<Layout>('list');
  const [isLoadingLayout, setIsLoadingLayout] = useState<boolean>(true);

  const { data, status, error, isFetching, refetch, isRefetching } = useQuery({
    queryKey: queryKey,
    queryFn: fetchDataFn,
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItemFn,
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

  useEffect(() => {
    const loadLayout = async () => {
      try {
        const savedLayout = await AsyncStorage.getItem(layoutStorageKey);
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
  }, [layoutStorageKey]);

  useEffect(() => {
    if (!isLoadingLayout) {
      const saveLayout = async () => {
        try {
          await AsyncStorage.setItem(layoutStorageKey, layout);
        } catch (e) {
          console.error('Failed to save layout to storage', e);
        }
      };
      void saveLayout();
    }
  }, [layout, isLoadingLayout, layoutStorageKey]);

  return {
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
  };
};
