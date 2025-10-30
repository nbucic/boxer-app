import { TouchableOpacity } from 'react-native';
import { GridIcon, ListIcon } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';

export const IconizedSwitch = (props: {
  onSwitchLeft: () => void;
  layout: string;
  onSwitchRight: () => void;
}) => (
  <HStack className="ml-2 p-1 bg-gray-200 rounded-full">
    <TouchableOpacity
      onPress={props.onSwitchLeft}
      className={`p-1 ${
        props.layout === 'list' ? 'bg-white rounded-full' : ''
      }`}
    >
      <ListIcon
        className={`w-5 h-5 ${
          props.layout === 'list' ? 'text-gray-900' : 'text-gray-700'
        }`}
      />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={props.onSwitchRight}
      className={`p-1 ${
        props.layout === 'grid' ? 'bg-white rounded-full' : ''
      }`}
    >
      <GridIcon
        className={`w-5 h-5 ${
          props.layout === 'grid' ? 'text-gray-900' : 'text-gray-700'
        }`}
      />
    </TouchableOpacity>
  </HStack>
);
