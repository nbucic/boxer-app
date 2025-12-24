import React, { memo } from 'react';
import { Image, Pressable, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { NameItem } from '@/components/box/NameItem';
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { HStack } from '@/components/ui/hstack';
import { BackAction } from '@/components/BackAction';
import { ActionItem } from '@/components/swipeable/Action';
import clsx from 'clsx';
import { SwipeableProps } from '@/components/list/view/ListView';

export type LayoutGridProps = {
  layout: 'grid';
  listType: 'swipeable';
} & SwipeableProps;

type DenseGridViewProps = {
  item: {
    id: string;
    image_url?: string | null;
    name: string;
  };
} & CardBackProps;

type CardBackProps = {
  actionableItems: ActionItem[];
  isFlipped: SharedValue<number>;
};

export const DenseGridView = memo(
  ({ item, isFlipped, actionableItems }: DenseGridViewProps) => {
    const frontAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotateY: `${isFlipped.value * 180}deg` }],
    }));

    const flipCard = () => {
      isFlipped.value = withTiming(isFlipped.value ? 0 : 1, { duration: 500 });
    };

    return (
      <Pressable onPress={flipCard} className={'basis-1/2 p-2 pb-1'}>
        <Animated.View style={frontAnimatedStyle}>
          <VStack
            className={
              'bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden'
            }
          >
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                className={'aspect-square w-full'}
                alt={item.name}
                resizeMode={'cover'}
              />
            ) : (
              <View
                className={
                  'aspect-square bg-neutral-200 dark:bg-neutral-700 w-full'
                }
              />
            )}
            <NameItem
              key={'name'}
              name={item.name}
              clickable={`/tool/${item.id}`}
              className={'p-3'}
            />
          </VStack>
        </Animated.View>
        <CardBack actionableItems={actionableItems} isFlipped={isFlipped} />
      </Pressable>
    );
  }
);

const CardBack = ({ actionableItems, isFlipped }: CardBackProps) => {
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(isFlipped.value, [0, 1], [180, 360]);
    // When the card is not flipped (isFlipped.value === 0), the back should not receive pointer events.
    const pointerEvents = isFlipped.value === 0 ? 'none' : 'auto';

    return {
      transform: [{ rotateY: `${rotate}deg` }],
      pointerEvents: pointerEvents,
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backfaceVisibility: 'hidden',
        },
        backAnimatedStyle,
      ]}
    >
      <View
        className={
          'flex-1 items-center justify-center rounded-xl bg-gray-900/90'
        }
      >
        <HStack space={'2xl'}>
          {actionableItems.map((action, index) => (
            <BackAction
              key={index}
              onPress={action.onPress}
              icon={action.icon}
              label={action.text}
              className={clsx(action.className, 'text-white')}
            />
          ))}
        </HStack>
      </View>
    </Animated.View>
  );
};
