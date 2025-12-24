import { router } from 'expo-router';
import { Image, TouchableOpacity, View } from 'react-native';
import { Action, ActionItem } from '@/components/swipeable/Action';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import React, { memo, ReactElement, ReactNode } from 'react';
import tw from 'twrnc';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';

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
  const { colorScheme } = useColorScheme();
  const options: ListViewOptions = { ...listViewOptions, ...props?.options };
  const borderAndMargins = clsx(
    'my-1 mx-2 border border-gray-100 dark:border-gray-800 rounded-xl shadow-md',
    colorScheme === 'dark' ? 'shadow-yellow-200' : 'shadow-blue-200'
  );

  const InternalToolListView = () => {
    const urlPrefix = itemType.toLowerCase();
    return (
      <View
        className={clsx(
          `bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 min-h-20 `
        )}
      >
        <TouchableOpacity
          className={'flex flex-row'}
          onPress={() => {
            //@ts-ignore
            router.navigate(`/${urlPrefix}/${item.id}`);
          }}
        >
          {options.showPicture === true && (
            <View className={'w-20 aspect-square mr-2 shrink-0'}>
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  className={'w-full h-full'}
                  resizeMode={'cover'}
                />
              ) : (
                <View
                  className={'w-full h-full bg-neutral-100 dark:bg-neutral-700'}
                />
              )}
            </View>
          )}
          <View className={'flex-grow flex-shrink py-1.5 pr-3'}>
            {infotainment}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (props.listType === 'swipeable') {
    const style = tw.style(
      clsx(
        borderAndMargins,
        colorScheme === 'dark' ? 'border-gray-800' : undefined
      )
    );
    const swipeProperties = props.swipeProperties;
    return (
      <Swipeable
        containerStyle={[
          style,
          {
            shadowColor: colorScheme === 'dark' ? '#fef08a' : '#bfdbfe',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 1,
            shadowRadius: 10,
          },
        ]}
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
    const style = clsx(borderAndMargins, 'overflow-hidden');
    return (
      <View className={style}>
        <InternalToolListView />
      </View>
    );
  }
});
