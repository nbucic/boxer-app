import {
  FlatList,
  Platform,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { Box } from '@/types/box';
import { Location } from '@/types/location';
import { ComponentType, ReactElement } from 'react';
import { ToolWithBox } from '@/types/tools';
import { SelectSearchable } from '@/types';

interface ItemsListProps {
  data: SelectSearchable[];
  isRefetching?: boolean;
  refetch?: () => void;
  listHeaderComponent?: ComponentType<any> | ReactElement | null | undefined;
  renderItem: ListRenderItem<Box | Location | ToolWithBox>;
  listEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
  numColumns?: number;
}

export const ItemsList = ({
  data,
  isRefetching,
  refetch,
  listHeaderComponent,
  renderItem,
  listEmptyComponent,
  numColumns = 1,
}: ItemsListProps) => {
  return (
    <FlatList
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
    />
  );
};
