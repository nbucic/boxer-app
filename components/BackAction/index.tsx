import { LucideIcon } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

export const BackAction = ({
  onPress,
  icon,
  label,
  className,
}: {
  onPress: () => void;
  icon: LucideIcon;
  label: string;
  className?: string;
}) => (
  <TouchableOpacity className={'items-center gap-2'} onPress={onPress}>
    <View
      className={`h-10 aspect-square items-center justify-center rounded-full ${className}`}
    >
      <Icon as={icon} color={'white'} size={'custom'} />
    </View>
    <Text className={'font-semibold text-white'}>{label}</Text>
  </TouchableOpacity>
);
