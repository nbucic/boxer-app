import {
  FlatList,
  Platform,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { Box } from '@/types/box';
import { Location } from '@/types/location';
import { ComponentType, ReactElement } from 'react';
import { Tool } from '@/types/tools';
import { SelectSearchable } from '@/types';

interface ItemsListProps {
  data: SelectSearchable[];
  isRefetching?: boolean;
  refetch?: () => void;
  ListHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  renderItem: ListRenderItem<Box | Location | Tool>;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  numColumns?: number;
}

export const ItemsList = ({
  data,
  isRefetching,
  refetch,
  ListHeaderComponent,
  renderItem,
  ListEmptyComponent,
  numColumns = 1,
}: ItemsListProps) => {
  return (
    <FlatList
      data={data}
      contentContainerClassName={'pb-[60]'}
      key={`items-${numColumns}`}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      indicatorStyle={'black'}
      numColumns={numColumns}
      refreshControl={
        Platform.OS !== 'web' && refetch && isRefetching ? (
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        ) : undefined
      }
    />
  );
};
