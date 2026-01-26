import { LucideIcon } from 'lucide-react-native';
import { SwipeableMethods } from 'react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable';

export interface SwipeAction {
  onPress: () => void;
  text: string;
  icon: LucideIcon;
  className: string;
}

export interface SwipeProperties {
  setRef: (ref: SwipeableMethods | null) => void;
  onSwipeStart: (ref: SwipeableMethods | null) => void;
  renderLeftActions: SwipeAction[];
  renderRightActions: SwipeAction[];
}
