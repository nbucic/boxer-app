import { Tool } from '@/types/tools';
import React, { memo, useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import {
  DenseGridView,
  LayoutGridProps,
} from '@/components/list/view/DenseGridView';
import { LayoutListProps, ListView } from '@/components/list/view/ListView';
import { InfoItem } from '@/components/common/InfoItem';
import { MapPinnedIcon, ScrollTextIcon } from 'lucide-react-native';
import { VStack } from '@/components/ui/vstack';
import { NameItem } from '@/components/common/NameItem';
import { useFocusEffect } from 'expo-router';

type ToolCardProps = { item: Tool } & (LayoutListProps | LayoutGridProps);

export const ToolCard = memo((props: ToolCardProps) => {
  const isFlipped = useSharedValue(0);
  const { item: tool } = props;

  useFocusEffect(
    useCallback(() => {
      isFlipped.value = 0;
      return () => {};
    }, [isFlipped])
  );

  if (props.layout === 'list') {
    const properties: any = {
      item: tool,
      itemType: 'Tool',
      listType: props.listType,
    };
    if (props.listType === 'swipeable') {
      properties.swipeProperties = props.swipeProperties;
    }

    return (
      <ListView
        {...properties}
        infotainment={
          <VStack space={'sm'}>
            <NameItem name={tool.name} key={'name'} />
            <InfoItem icon={MapPinnedIcon} text={tool.box.name} />
            {tool.description ? (
              <InfoItem icon={ScrollTextIcon} text={tool.description} />
            ) : (
              <InfoItem
                icon={ScrollTextIcon}
                link={{
                  pathname: '/tool/[id]/edit',
                  params: { id: tool.id, focus: 'description' },
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
        item={tool}
        itemType={'Tool'}
        isFlipped={isFlipped}
        actionableItems={actionableItems}
      />
    );
  }
});

ToolCard.displayName = 'Tool Card';
