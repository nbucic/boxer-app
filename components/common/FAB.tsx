import { Button, ButtonIcon } from '@/components/ui/button';
import { AddIcon } from '@/components/ui/icon';
import { clsx } from 'clsx';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface FABProps {
  onPress?: () => void;
  scrollOffset?: SharedValue<number>;
}
export const FAB = ({ onPress, scrollOffset }: FABProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!scrollOffset) {
      return { transform: [{ translateY: 0 }], opacity: 1 };
    }

    const shouldHide = scrollOffset.value > 80;

    return {
      transform: [
        {
          translateY: withSpring(shouldHide ? 120 : 0, { damping: 15 }),
        },
      ],
      opacity: withSpring(shouldHide ? 0 : 1),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 40,
          right: 20,
        },
        animatedStyle,
      ]}
    >
      <Button
        className={clsx(
          'h-16 w-16 rounded-full',
          'bg-primary-500 shadow-lg active:bg-primary-600 data-[active=true]:bg-primary-600 hover:bg-primary-600 data-[hover=true]:bg-primary-600',
          'items-center justify-center'
        )}
        onPress={onPress}
      >
        <ButtonIcon as={AddIcon} className={'text-white h-8 w-8'} />
      </Button>
    </Animated.View>
  );
};
