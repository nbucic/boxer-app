// noinspection XmlDeprecatedElement,JSDeprecatedSymbols

import { Alert, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { EditIcon, TrashIcon } from 'lucide-react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Location } from '@/types/location';
import { Action } from '@/components/swipeable/Action';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

type LocationCardProps = {
  item: Location;
  onDelete: (id: string) => void;
  setRef: (ref: SwipeableMethods | null) => void;
  close: () => void;
};

export const LocationCard = ({
  item,
  onDelete,
  setRef,
  close,
}: LocationCardProps) => {
  console.log(item);
  return (
    <Swipeable
      ref={setRef}
      overshootFriction={8}
      renderLeftActions={() => (
        <Action
          items={[
            {
              onPress: () => {
                close();
                setTimeout(() => {
                  router.push(`/location/${item.id}/edit`);
                }, 100);
              },
              text: 'Edit',
              icon: EditIcon,
              className: 'bg-blue-500',
            },
          ]}
        />
      )}
      renderRightActions={() => (
        <Action
          items={[
            {
              onPress: () => {
                Alert.alert(
                  'Delete Location',
                  `Are you sure you want to delete ${item.name}?`,
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                      onPress: close,
                    },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        onDelete(item.id);
                        close();
                      },
                    },
                  ]
                );
              },
              text: 'Delete',
              icon: TrashIcon,
              className: 'bg-red-500',
            },
          ]}
        />
      )}
    >
      <TouchableOpacity onPress={() => router.push(`/location/${item.id}/`)}>
        <View
          className={
            'p-2 border-b border-outline-200 bg-background-0 my-1 max-h-[100px]'
          }
        >
          <Text
            className={
              'text-lg font-medium text-typography-900 whitespace-nowrap overflow-hidden overflow-ellipsis'
            }
            numberOfLines={1}
            ellipsizeMode={'tail'}
          >
            {item.name}
          </Text>
          {item.description && (
            <Text
              className={
                'text-sm text-typography-500 text-right whitespace-nowrap overflow-hidden overflow-ellipsis'
              }
              numberOfLines={1}
              ellipsizeMode={'tail'}
            >
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};
