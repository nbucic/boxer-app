import {
  FlatList,
  Platform,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { Layout } from '@/types/layout';
import { Box } from '@/types/box';
import { Location } from '@/types/location';
import { ComponentType, ReactElement } from 'react';

interface ItemsListProps {
  data: Box[] | Location[];
  isRefetching: boolean;
  refetch: () => void;
  ListHeaderComponent: ComponentType<any> | ReactElement | null | undefined;
  renderItem: ListRenderItem<Box | Location>;
}

export const ItemsList = ({
  data,
  isRefetching,
  refetch,
  ListHeaderComponent,
  renderItem,
}: ItemsListProps) => {
  return (
    <FlatList
      data={data}
      contentContainerClassName={'pb-[60] flex-grow justify-center'}
      className={'m-2'}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      indicatorStyle={'black'}
      refreshControl={
        Platform.OS !== 'web' ? (
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        ) : undefined
      }
    />
  );
};
