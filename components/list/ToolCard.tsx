import { Tool, ToolWithBox } from '@/types/tools';
import React, { memo } from 'react';
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

type ToolCardProps = { item: Tool | ToolWithBox } & (
  | LayoutListProps
  | LayoutGridProps
);

export const ToolCard = memo((props: ToolCardProps) => {
  const isFlipped = useSharedValue(0);
  const { item: tool } = props;

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
          <VStack className={'gap-1'}>
            <NameItem name={tool.name} key={'name'} />
            <InfoItem icon={MapPinnedIcon} text={tool.box.name} />
            {tool.description ? (
              <InfoItem icon={ScrollTextIcon} text={tool.description} />
            ) : (
              <InfoItem
                icon={ScrollTextIcon}
                link={{
                  pathname: '/tool/create',
                  params: { id: tool.id, focus: 'description' },
                }}
                linkText={'Add description?'}
                className={'text-sm'}
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
        isFlipped={isFlipped}
        actionableItems={actionableItems}
      />
    );
  }
});
