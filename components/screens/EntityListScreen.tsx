import React, { ReactElement, useCallback } from 'react';
import { Href, router } from 'expo-router';
import { ItemsList } from '@/components/box/ItemsList';
import { ListHeader } from '@/components/list/ListHeader';
import { EmptyList } from '@/components/list/EmptyList';
import { EditIcon, LucideIcon, TrashIcon } from 'lucide-react-native';
import { useListScreen } from '@/hooks/useListScreen';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { FAB } from '@/components/common/FAB';
import { Layout } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { SwipeAction, SwipeProperties } from '@/types/swipe';

interface EntityListScreenConfig<T extends { id: string; name: string }> {
  // Query configuration
  queryKey: string[];
  fetchDataFn: () => Promise<T[]>;
  deleteItemFn: (id: string) => Promise<void>;

  // Prefetch configuration (optional)
  prefetchItemFn?: (id: string) => Promise<T>;

  // Screen metadata
  itemName: string;
  screenTitle: string;
  loadingDataMessage: string;

  // Layout configuration
  layoutStorageKey: string;
  supportsLayoutToggle?: boolean;

  // Routing
  editRoute: (id: string) => Href;
  createRoute: Href;

  // Empty state
  emptyStateIcon: LucideIcon;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
  emptyStateAction: string;

  // Card rendering
  renderCard: (props: {
    item: T;
    layout: Layout;
    swipeProperties: SwipeProperties;
  }) => ReactElement;

  // Custom swipe actions (optional)
  customLeftActions?: (
    item: T,
    closeSwipe: () => void,
    handleEdit: (id: string) => void
  ) => SwipeAction[];
  customRightActions?: (
    item: T,
    closeSwipe: () => void,
    handleDelete: (id: string, name: string) => void
  ) => SwipeAction[];

  // Custom delete handler (optional)
  customDeleteHandler?: (
    id: string,
    name: string,
    defaultHandler: () => void
  ) => void;
}

export function EntityListScreen<T extends { id: string; name: string }>(
  config: EntityListScreenConfig<T>
) {
  const {
    queryKey,
    fetchDataFn,
    deleteItemFn,
    prefetchItemFn,
    itemName,
    screenTitle,
    loadingDataMessage,
    layoutStorageKey,
    supportsLayoutToggle = true,
    editRoute,
    createRoute,
    emptyStateIcon,
    emptyStateTitle,
    emptyStateSubtitle,
    emptyStateAction,
    renderCard,
    customLeftActions,
    customRightActions,
    customDeleteHandler,
  } = config;

  const queryClient = useQueryClient();

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
  } = useListScreen<T>({
    queryKey,
    fetchDataFn,
    deleteItemFn,
    layoutStorageKey,
    itemName,
    loadingDataMessage,
    hideFabWhenScrolling: true,
  });

  // Prefetch item data for faster edit screen loading
  const handlePrefetch = useCallback(
    (id: string) => {
      if (!prefetchItemFn) return;

      void queryClient.prefetchQuery({
        queryKey: [...queryKey, id],
        queryFn: () => prefetchItemFn(id),
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      });
    },
    [queryClient, queryKey, prefetchItemFn]
  );

  const handleEdit = (id: string) => {
    closeTheSwipedRef();
    // Use requestAnimationFrame instead of setTimeout for better performance
    requestAnimationFrame(() => {
      router.push(editRoute(id));
    });
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (customDeleteHandler) {
      customDeleteHandler(id, name, () => handleDelete(id, name));
    } else {
      handleDelete(id, name);
    }
  };

  const getLeftActions = (item: T): SwipeAction[] => {
    if (customLeftActions) {
      return customLeftActions(item, closeTheSwipedRef, handleEdit);
    }

    return [
      {
        onPress: () => handleEdit(item.id),
        text: 'Edit',
        icon: EditIcon,
        className: 'bg-primary-500',
      },
    ];
  };

  const getRightActions = (item: T): SwipeAction[] => {
    if (customRightActions) {
      return customRightActions(item, closeTheSwipedRef, handleDeleteClick);
    }

    return [
      {
        onPress: () => handleDeleteClick(item.id, item.name),
        text: 'Delete',
        icon: TrashIcon,
        className: 'bg-error-500',
      },
    ];
  };

  return (
    statusContent() ?? (
      <ScreenContainer scrollable={false}>
        <ItemsList<T>
          data={data}
          onScroll={scrollHandler}
          renderItem={({ item }) => {
            // Prefetch data when item is rendered (visible in viewport)
            handlePrefetch(item.id);

            return renderCard({
              item,
              layout,
              swipeProperties: {
                setRef: (ref: SwipeableMethods | null) =>
                  (activeSwipeableRef.current = ref),
                onSwipeStart,
                renderLeftActions: getLeftActions(item),
                renderRightActions: getRightActions(item),
              },
            });
          }}
          listHeaderComponent={
            <ListHeader
              title={screenTitle}
              layout={supportsLayoutToggle ? layout : undefined}
              setLayout={supportsLayoutToggle ? toggleLayout : undefined}
              refetch={refetch}
              isRefetching={isRefetching}
            />
          }
          listEmptyComponent={
            <EmptyList
              titleIcon={emptyStateIcon}
              title={emptyStateTitle}
              subtitle={emptyStateSubtitle}
              linkLocation={createRoute}
              linkCallToAction={emptyStateAction}
            />
          }
          isRefetching={isRefetching}
          refetch={refetch}
          numColumns={layout === 'list' ? 1 : 2}
        />

        <FAB
          onPress={() => router.push(createRoute)}
          scrollOffset={scrollOffset}
        />
      </ScreenContainer>
    )
  );
}
