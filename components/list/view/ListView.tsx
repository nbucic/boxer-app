import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Action, ActionItem } from '@/components/swipeable/Action';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import React, { memo, ReactElement, ReactNode } from 'react';
import tw from 'twrnc';
import clsx from 'clsx';

type ListViewOptions = {
  showPicture?: boolean;
};

export type LayoutListProps =
  | ({
      layout: 'list';
      listType: 'swipeable';
    } & SwipeableProps)
  | {
      layout: 'list';
      listType: 'static';
    };

type ListProps =
  | ({
      listType: 'swipeable';
    } & SwipeableProps)
  | {
      listType: 'static';
    };

export type SwipeablePropsItems = {
  setRef: (ref: SwipeableMethods | null) => void;
  renderLeftActions?: ActionItem[];
  renderRightActions?: ActionItem[];
};
export type SwipeableProps = {
  swipeProperties: SwipeablePropsItems;
};

type ListViewProps = {
  item: {
    id: string;
    image_url?: string | null;
    name: string;
    description?: string | null;
  };
  itemType: 'Box' | 'Tool' | 'Location';
  infotainment: ReactElement | ReactNode;
  options?: ListViewOptions;
} & ListProps;

const listViewOptions: ListViewOptions = {
  showPicture: true,
};

export const ListView = memo((props: ListViewProps) => {
  const { item, itemType, infotainment } = props;
  const options: ListViewOptions = { ...listViewOptions, ...props?.options };
  const borderAndMargins = clsx(
    'my-1.5 mx-4 border border-blue-300 rounded-md shadow-sm overflow-hidden bg-background-0'
  );

  const InternalToolListView = () => {
    const urlPrefix = itemType.toLowerCase();
    return (
      <View
        className={clsx(
          `bg-background-0 active:bg-background-50 hover:bg-background-50 min-h-20 `
        )}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          className={'flex flex-row'}
          onPress={() => {
            //@ts-ignore
            router.navigate(`/${urlPrefix}/${item.id}`);
          }}
        >
          {options.showPicture === true && (
            <View className={'w-20 h-20 shrink-0 bg-background-0'}>
              {/*{item.image_url ? (*/}
              {/*  <Image*/}
              {/*    source={{ uri: item.image_url }}*/}
              {/*    className={'w-full h-full'}*/}
              {/*    resizeMode={'cover'}*/}
              {/*  />*/}
              {/*) : (*/}
              <View
                className={
                  'w-full h-full items-center justify-center opacity-20'
                }
              >
                <View className={'w-8 h-8 rounded-full bg-typography-300'} />
              </View>
              {/*)}*/}
            </View>
          )}
          <View className={'flex-grow flex-shrink my-1 mx-2 justify-between'}>
            {infotainment}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (props.listType === 'swipeable') {
    const swipeProperties = props.swipeProperties;
    return (
      <Swipeable
        containerStyle={tw.style(borderAndMargins)}
        ref={swipeProperties.setRef}
        overshootFriction={8}
        leftThreshold={80}
        rightThreshold={80}
        renderLeftActions={() => (
          <Action
            items={swipeProperties.renderLeftActions || []}
            place={'left'}
          />
        )}
        renderRightActions={() => (
          <Action
            items={swipeProperties.renderRightActions || []}
            place={'right'}
          />
        )}
      >
        <InternalToolListView />
      </Swipeable>
    );
  } else {
    return (
      <View className={borderAndMargins}>
        <InternalToolListView />
      </View>
    );
  }
});
