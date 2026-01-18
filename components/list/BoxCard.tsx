// noinspection JSDeprecatedSymbols,XmlDeprecatedElement
import { VStack } from '@/components/ui/vstack';
import React, { memo, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { MapPinnedIcon, ScrollTextIcon } from 'lucide-react-native';
import { Box } from '@/types/box';
import { useSharedValue } from 'react-native-reanimated';
import { InfoItem } from '@/components/common/InfoItem';
import { LayoutListProps, ListView } from '@/components/list/view/ListView';
import {
  DenseGridView,
  LayoutGridProps,
} from '@/components/list/view/DenseGridView';
import { NameItem } from '@/components/common/NameItem';

type BoxCardProps = { item: Box } & (LayoutListProps | LayoutGridProps);

export const BoxCard = memo((props: BoxCardProps) => {
  const isFlipped = useSharedValue(0);
  const { item: box } = props;

  useFocusEffect(
    useCallback(() => {
      isFlipped.value = 0;
      return () => {};
    }, [isFlipped])
  );

  if (props.layout === 'list') {
    const properties: any = {};
    properties.item = box;
    properties.itemType = 'Box';
    properties.listType = props.listType;
    if (props.listType === 'swipeable') {
      properties.swipeProperties = props.swipeProperties;
    }

    return (
      <ListView
        {...properties}
        infotainment={
          <VStack className={'gap-1 justify-between'}>
            <NameItem name={box.name} key={'name'} className={'p-3'} />
            <InfoItem
              icon={MapPinnedIcon}
              text={box.location?.name}
              link={{
                pathname: '/box/[id]/edit',
                params: { id: box.id, focus: 'location' },
              }}
              linkText={'Add location?'}
            />
            {box.description ? (
              <InfoItem icon={ScrollTextIcon} text={box.description} />
            ) : (
              <InfoItem
                icon={ScrollTextIcon}
                link={{
                  pathname: '/box/[id]/edit',
                  params: { id: box.id, focus: 'description' },
                }}
                linkText={'Add description?'}
              />
            )}
          </VStack>
        }
      />
    );
  }

  if (props.layout === 'grid') {
    const actionableItems = [
      ...(props.swipeProperties.renderLeftActions ?? []),
      ...(props.swipeProperties.renderRightActions ?? []),
    ];
    return (
      <DenseGridView
        item={box}
        isFlipped={isFlipped}
        actionableItems={actionableItems}
      />
    );
  }
});
