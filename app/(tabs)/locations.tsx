import {
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/ui/text';
import Fab from '@/components/Fab';
import { router, useFocusEffect } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteLocation,
  getLocationsForCurrentUser,
  Location,
} from '@/services/location';
import { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { EditIcon, Icon, TrashIcon } from '@/components/ui/icon';
import { useCallback, useRef } from 'react';
// noinspection JSDeprecatedSymbols,XmlDeprecatedElement
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default function Locations() {
  const queryClient = useQueryClient();
  const swipeableRefs = useRef<{ [key: string]: SwipeableMethods | null }>({});
  const { data, status, error, isFetching, refetch } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocationsForCurrentUser,
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (e: Error) => {
      Alert.alert('Error', `Failed to delete location: ${e.message}`);
    },
  });

  if (isFetching) {
    return (
      <View className={'flex-1 justify-center'}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (status === 'error' && error) {
    return (
      <View className={'flex-1 justify-center items-center p-4'}>
        <Text className={'text-error-500'}>
          Error fetching locations: {error.message}
        </Text>
      </View>
    );
  }

  const RightAction = ({ onPress }: { onPress: () => void }) => {
    return (
      <TouchableOpacity
        className={'bg-red-500 justify-center items-center w-20 h-20'}
        onPress={onPress}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Icon as={TrashIcon} />
        </View>
      </TouchableOpacity>
    );
  };

  const LeftAction = ({ onPress }: { onPress: () => void }) => {
    return (
      <TouchableOpacity
        className={'bg-blue-500 justify-center items-center w-20 h-20'}
        onPress={onPress}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Icon as={EditIcon} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderDeprecatedSwipeable = ({ item }: { item: Location }) => {
    return (
      <Swipeable
        ref={(ref) => {
          swipeableRefs.current[item.id] = ref;
        }}
        renderLeftActions={() => (
          <LeftAction
            onPress={() => {
              // console.log('LEFT ACTION FIRED!');
              // swipeableRefs.current[item.id]?.close();
              router.push(`/modal/editLocation?id=${item.id}`);
              swipeableRefs.current[item.id]?.close();
            }}
          />
        )}
        renderRightActions={() => (
          <RightAction
            onPress={() => {
              // console.log('RIGHT ACTION FIRED!');
              // swipeableRefs.current[item.id]?.close();
              Alert.alert(
                'Delete Location',
                `Are you sure you want to delete ${item.name}?`,
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => swipeableRefs.current[item.id]?.close(),
                  },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      deleteMutation.mutate(item.id);
                      swipeableRefs.current[item.id]?.close();
                    },
                  },
                ]
              );
            }}
          />
        )}
      >
        <View className={'p-4 border-b border-outline-200 bg-background-0'}>
          <Text className={'text-lg font-medium'}>{item.name}</Text>
          {item.description && (
            <Text className={'text-sm text-typography-500 text-right'}>
              '{item.description}'
            </Text>
          )}
        </View>
      </Swipeable>
    );
  };

  return (
    <View className={'flex-1'}>
      <FlatList
        contentContainerStyle={{ paddingBottom: 60 }}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDeprecatedSwipeable}
        ListHeaderComponent={
          <Text className={'text-3xl p-4 justify-center'}>Locations</Text>
        }
        indicatorStyle={'black'}
      />
      <Fab onPress={() => router.push('/modal/editLocation')} />
    </View>
  );
}
