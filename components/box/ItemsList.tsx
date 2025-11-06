import {
  FlatList,
  Platform,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { Box } from '@/types/box';
import { Location } from '@/types/location';
import { ComponentType, ReactElement } from 'react';

interface ItemsListProps {
  data: Box[] | Location[];
  isRefetching: boolean;
  refetch: () => void;
  ListHeaderComponent: ComponentType<any> | ReactElement | null | undefined;
  renderItem: ListRenderItem<Box | Location>;
  ListEmptyComponent?: ComponentType<any> | ReactElement | null | undefined;
}

export const ItemsList = ({
  data,
  isRefetching,
  refetch,
  ListHeaderComponent,
  renderItem,
  ListEmptyComponent,
}: ItemsListProps) => {
  return (
    <FlatList
      data={data}
      contentContainerClassName={'pb-[60] flex-grow'}
      className={'m-2'}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      indicatorStyle={'black'}
      refreshControl={
        Platform.OS !== 'web' ? (
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        ) : undefined
      }
    />
  );
};
