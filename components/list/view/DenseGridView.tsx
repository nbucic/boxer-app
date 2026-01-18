import React, { memo } from 'react';
import { Image, Pressable, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { NameItem } from '@/components/common/NameItem';
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
import { GlassCard } from '@/components/layout/GlassCard';
import { BoxIcon } from 'lucide-react-native';

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
  itemType: 'Box' | 'Tool' | 'Location';
} & CardBackProps;

type CardBackProps = {
  actionableItems: ActionItem[];
  isFlipped: SharedValue<number>;
};

export const DenseGridView = memo(
  ({ item, itemType, isFlipped, actionableItems }: DenseGridViewProps) => {
    const urlPrefix = itemType.toLowerCase();
    useAnimatedStyle(() => ({
      transform: [{ rotateY: `${isFlipped.value * 180}deg` }],
    }));
    const frontAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotateY: `${isFlipped.value * 180}deg` }],
      backfaceVisibility: 'hidden',
    }));

    const flipCard = () => {
      isFlipped.value = withTiming(isFlipped.value ? 0 : 1, { duration: 500 });
    };

    return (
      <Pressable onPress={flipCard} className={'basis-1/2 p-2 pb-1'}>
        <Animated.View style={frontAnimatedStyle}>
          <GlassCard className={'p-0 overflow-hidden'} noPadding={true}>
            <VStack space={'xs'}>
              <View
                className={
                  'w-full aspect-square items-center justify-center bg-background-100/50'
                }
              >
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    className={'aspect-square w-full'}
                    alt={item.name}
                  />
                ) : (
                  <BoxIcon
                    size={40}
                    className="text-typography-300 opacity-50"
                  />
                )}
              </View>

              {/* Text Area */}
              <NameItem
                name={item.name}
                clickable={`/${urlPrefix}/${item.id}`}
                // Remove default padding/styling from NameItem if possible
                // to control it here for grid density
                className="font-bold text-sm px-2 py-2"
              />
            </VStack>
          </GlassCard>
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
      opacity: interpolate(isFlipped.value, [0.4, 0.5, 0.6], [0, 0.5, 1]),
      pointerEvents: pointerEvents,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 8,
          right: 8,
          bottom: 4,
          left: 8,
          backfaceVisibility: 'hidden',
        },
        backAnimatedStyle,
      ]}
    >
      <View
        className={
          'flex-1 items-center justify-center rounded-xl bg-background-50/50 border border-outline-900 shadow-xl'
        }
      >
        <HStack space={'lg'} className={'flex-wrap justify-center p-2'}>
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
