// noinspection JSDeprecatedSymbols
import { Alert, Image, Pressable, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBox } from '@/services/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { memo, useCallback, useRef } from 'react';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { router, useFocusEffect } from 'expo-router';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
  EditIcon,
  MapPinnedIcon,
  QrCodeIcon,
  ScrollTextIcon,
  TrashIcon,
} from 'lucide-react-native';
import { showAlert } from '@/lib/helpers/alert';
import { Layout } from '@/types/layout';
import { Box as BoxType } from '@/types/box';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import InfoItem from '@/components/box/InfoItem';
import { NameItem } from '@/components/box/NameItem';
import { Action } from '@/components/swipeable/Action';
import { BackAction } from '@/components/BackAction';

type BoxCardProps = {
  box: BoxType;
  layout?: Layout;
  onShare: (box: BoxType) => void;
};

export const BoxCard = memo(
  ({ box, layout = 'list', onShare }: BoxCardProps) => {
    const queryClient = useQueryClient();
    const swipeableRefs = useRef<{ [key: string]: SwipeableMethods | null }>(
      {}
    );
    const isFlipped = useSharedValue(0);

    const deleteMutation = useMutation({
      mutationFn: deleteBox,
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['boxes'] });
      },
      onError: (e: Error) => {
        Alert.alert('Error', `Failed to delete box: ${e.message}`);
      },
    });

    useFocusEffect(
      useCallback(() => {
        isFlipped.value = 0;
        return () => {};
      }, [isFlipped])
    );

    const handleDelete = () => {
      showAlert(
        'Delete Box',
        `Are you sure you want to delete ${box.name}?`,
        () => {
          deleteMutation.mutate(box.id);
          swipeableRefs.current[box.id]?.close();
        },
        () => {
          swipeableRefs.current[box.id]?.close();
        }
      );
    };

    const CardBack = () => (
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
            'm-1 flex-1 items-center justify-center rounded-lg bg-black/70'
          }
        >
          <HStack space={'xl'}>
            <BackAction
              label={'Edit'}
              icon={EditIcon}
              onPress={() => router.push(`/modal/editBox?id=${box.id}`)}
              className={'bg-blue-500'}
            />
            <BackAction
              label={'Share'}
              icon={QrCodeIcon}
              onPress={() => onShare(box)}
              className={'bg-green-500'}
            />
            <BackAction
              label={'Delete'}
              icon={TrashIcon}
              onPress={handleDelete}
              className={'bg-red-500'}
            />
          </HStack>
        </View>
      </Animated.View>
    );

    const frontAnimatedStyle = useAnimatedStyle(() => {
      const rotate = interpolate(isFlipped.value, [0, 1], [0, 180]);
      // When the card is flipped (isFlipped.value === 1), the front should not receive pointer events.
      const pointerEvents = isFlipped.value === 1 ? 'none' : 'auto';

      return {
        transform: [{ rotateY: `${rotate}deg` }],
        pointerEvents: pointerEvents,
      };
    });
    const backAnimatedStyle = useAnimatedStyle(() => {
      const rotate = interpolate(isFlipped.value, [0, 1], [180, 360]);
      // When the card is not flipped (isFlipped.value === 0), the back should not receive pointer events.
      const pointerEvents = isFlipped.value === 0 ? 'none' : 'auto';

      return {
        transform: [{ rotateY: `${rotate}deg` }],
        pointerEvents: pointerEvents,
      };
    });

    const flipCard = () => {
      isFlipped.value = withTiming(isFlipped.value ? 0 : 1, { duration: 500 });
    };
    const ListView = () => (
      <Swipeable
        ref={(ref) => {
          swipeableRefs.current[box.id] = ref;
        }}
        overshootFriction={8}
        renderLeftActions={() => (
          <Action
            items={[
              {
                onPress: () => {
                  router.push(`/modal/editBox?id=${box.id}`);
                  swipeableRefs.current[box.id]?.close();
                },
                text: 'Edit',
                icon: EditIcon,
                className: 'bg-blue-500',
              },
              {
                onPress: () => {
                  onShare(box);
                  swipeableRefs.current[box.id]?.close();
                },
                text: 'Share',
                icon: QrCodeIcon,
                className: 'bg-white',
              },
            ]}
          />
        )}
        renderRightActions={() => (
          <Action
            items={[
              {
                onPress: handleDelete,
                text: 'Delete',
                icon: TrashIcon,
                className: 'bg-red-500',
              },
            ]}
          />
        )}
      >
        <View
          className={`p-2 border-b border-outline-200 bg-background-0 my-1 max-h-[100px]`}
        >
          <HStack space={'lg'} className={'items-center gap-2'}>
            <View className={'h-full aspect-square flex-shrink-0'}>
              {box.publicImageUrl ? (
                <Image
                  source={{ uri: box.publicImageUrl }}
                  className={'w-full h-full rounded-lg'}
                  resizeMode={'cover'}
                />
              ) : (
                <View className={'w-full h-full rounded-lg bg-neutral-200'} />
              )}
            </View>
            <VStack className={'flex-1 gap-0.5'}>
              <NameItem
                boxName={box.name}
                containerClassName={'items-center gap-1'}
              />
              <InfoItem
                box={box}
                icon={MapPinnedIcon}
                text={box.location?.name}
                linkText={'Add location?'}
                focus={'location'}
              />
              <InfoItem
                box={box}
                icon={ScrollTextIcon}
                text={box.description}
                linkText={'Add description?'}
                focus={'description'}
              />
            </VStack>
          </HStack>
        </View>
      </Swipeable>
    );

    const GridView = () => (
      <Pressable onPress={flipCard}>
        <View className={'p-1 my-0.5'}>
          <Animated.View style={frontAnimatedStyle}>
            <VStack
              className={
                'border border-outline-200 bg-background-0 rounded-lg gap-2'
              }
            >
              <View>
                {box.publicImageUrl ? (
                  <Image
                    source={{ uri: box.publicImageUrl }}
                    className={'w-full aspect-video rounded-t-lg'}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className={
                      'w-full aspect-video rounded-t-lg bg-neutral-200'
                    }
                  />
                )}
                <NameItem
                  key={'name'}
                  boxName={box.name}
                  containerClassName={
                    'absolute bottom-2 left-2 right-2 flex flex-row items-center gap-x-1 rounded-md px-2 py-1 bg-black/50'
                  }
                  iconColor={'white'}
                  isTextWhite={true}
                />
              </View>
              <VStack className={'gap-0.5 p-2'}>
                <InfoItem
                  box={box}
                  icon={MapPinnedIcon}
                  text={box.location?.name}
                  linkText={'Add location?'}
                  focus={'location'}
                />
                <InfoItem
                  box={box}
                  icon={ScrollTextIcon}
                  text={box.description}
                  linkText={'Add description?'}
                  focus={'description'}
                />
              </VStack>
            </VStack>
          </Animated.View>
          <CardBack />
        </View>
      </Pressable>
    );

    return layout === 'list' ? <ListView /> : <GridView />;
  }
);
