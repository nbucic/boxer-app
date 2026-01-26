import { ListRenderItem, Platform, RefreshControl } from 'react-native';
import { ComponentType, ReactElement } from 'react';
import { SelectSearchable } from '@/types';
import Animated from 'react-native-reanimated';

interface ItemsListProps<T extends SelectSearchable> {
  data: T[];
  isRefetching?: boolean;
  refetch?: () => void;
  listHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  renderItem: ListRenderItem<T>;
  listEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  numColumns?: number;
  onScroll?: (event: any) => void;
}

export const ItemsList = <T extends SelectSearchable>({
  data,
  isRefetching,
  refetch,
  listHeaderComponent,
  renderItem,
  listEmptyComponent,
  numColumns = 1,
  onScroll,
}: ItemsListProps<T>) => {
  return (
    <Animated.FlatList
      data={data}
      key={`items-${numColumns}`}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={listHeaderComponent}
      ListEmptyComponent={listEmptyComponent}
      indicatorStyle={'black'}
      numColumns={numColumns}
      refreshControl={
        Platform.OS !== 'web' && refetch && isRefetching ? (
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        ) : undefined
      }
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
};
