import { RelativePathString, router } from 'expo-router';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Action, ActionItem } from '@/components/swipeable/Action';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import React, { memo, ReactElement, ReactNode, useRef } from 'react';
import clsx from 'clsx';
import { HStack } from '@/components/ui/hstack';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '@/constants/theme';

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
  onSwipeStart: (ref: SwipeableMethods | null) => void;
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

  const InternalToolListView = () => {
    const urlPrefix = itemType.toLowerCase();
    return (
      <HStack className={'bg-background-0 min-h-20 items-center'}>
        {/* 1. Image section */}
        {options.showPicture && (
          <View className={'w-20 h-20 shrink-0 bg-background-100'}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                className={'w-full h-full'}
                resizeMode={'contain'}
              />
            ) : (
              <View
                className={
                  'w-full h-full opacity-20 items-center justify-center'
                }
              >
                <View className={'w-8 h-8 rounded-full bg-typography-300'} />
              </View>
            )}
          </View>
        )}
        {/* 2. Content section */}
        <View className={'flex-1 mx-2 my-1 justify-between'}>
          {infotainment}
        </View>

        {/* 3. The details view button */}
        <View
          className={
            'rounded-lg border border-outline-100 overflow-hidden bg-background-50 mr-2'
          }
        >
          <TouchableOpacity
            onPress={() =>
              router.navigate(`/${urlPrefix}/${item.id}` as RelativePathString)
            }
            activeOpacity={0.7}
            className={clsx(
              'p-2 bg-background-0 hover:bg-background-100 active:bg-background-100'
            )}
          >
            <ChevronRight className={'w-5 h5 text-primary-500'} />
          </TouchableOpacity>
        </View>
      </HStack>
    );
  };

  if (props.listType === 'swipeable') {
    const swipeProperties = props.swipeProperties;
    const rowRef = useRef<SwipeableMethods | null>(null);
    return (
      <Swipeable
        useNativeAnimations={Platform.OS !== 'web'}
        containerStyle={stylesheet.swipeable}
        ref={(ref) => {
          rowRef.current = ref;
          swipeProperties.setRef(ref);
        }}
        onSwipeableWillOpen={() => swipeProperties.onSwipeStart(rowRef.current)}
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
      <View
        className={
          'my-1.5 mx-4 border border-blue-300 rounded-md shadow-list-view-card-dark overflow-hidden bg-background-0'
        }
      >
        <InternalToolListView />
      </View>
    );
  }
});

const stylesheet = StyleSheet.create({
  swipeable: {
    marginTop: '0.375rem' as any,
    marginBottom: '0.375rem' as any,
    marginLeft: '1rem' as any,
    marginRight: '1rem' as any,
    borderWidth: '0.0625rem' as any,
    borderRadius: '0.375rem',
    borderColor: theme.colors.primary[300],
    boxShadow: theme.shadows['list-view-card-dark'],
    overflow: 'hidden',
    backgroundColor: theme.colors.background.dark,
    elevation: 5,
  },
});
