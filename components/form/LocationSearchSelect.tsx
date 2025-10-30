import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLocation, getLocations } from '@/services/location';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { ChevronDownIcon, XIcon } from 'lucide-react-native';
import { Location } from '@/types/location';

const INITIAL_LOCATIONS_SHOWN = 5;

interface Props {
  value?: string | null; // location_id
  onSelect: (locationId: string | null) => void;
}

export interface LocationSearchSelectRef {
  focus: () => void;
  close: () => void;
}

export const LocationSearchSelect = forwardRef<LocationSearchSelectRef, Props>(
  ({ value, onSelect }, ref) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const { data: selectedLocation } = useQuery({
      queryKey: ['location', value],
      queryFn: () => getLocation(value!),
      enabled: !!value,
    });

    useImperativeHandle(ref, () => ({
      focus: () => {
        setModalVisible(true);
      },
      close: () => {
        setModalVisible(false);
      },
    }));

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearch(search);
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }, [search]);

    const { data: locations, isFetching: fetchingLocations } = useQuery({
      queryKey: ['locations', debouncedSearch],
      queryFn: () =>
        getLocations({
          search: debouncedSearch,
          limit: INITIAL_LOCATIONS_SHOWN,
        }),
      initialData: [],
    });

    const handleSelect = (location: Location) => {
      onSelect(location.id);
      setModalVisible(false);
    };

    const handleReset = () => {
      onSelect(null);
      setModalVisible(false);
    };

    return (
      <>
        <TouchableOpacity
          className={
            'border-background-300 flex-row overflow-hidden content-center items-center h-10 rounded border pr-3'
          }
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Text
            className={
              'ml-3 text-gray-700 flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap'
            }
            numberOfLines={1}
            ellipsizeMode={'tail'}
          >
            {selectedLocation?.name || 'Select a location'}
          </Text>
          <ChevronDownIcon size={20} />
        </TouchableOpacity>

        <Modal
          animationType={'slide'}
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className={'flex-1 bg-black/50'}>
            <VStack className={'flex-1 mt-32 bg-white rounded-t-3xl'}>
              {/* Header */}
              <HStack className={'justify-between items-center'}>
                <Heading
                  className={
                    'flex-row justify-between items-center text-center p-4'
                  }
                >
                  Search for a location...
                </Heading>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className={'p-4'}
                >
                  <XIcon size={24} />
                </TouchableOpacity>
              </HStack>
              {/* Main content */}
              <VStack className={'flex-1'}>
                <View
                  className={
                    'flex-row items-center border border-background-300 rounded-xl px-3 py-2 mx-2'
                  }
                >
                  <TextInput
                    className={'flex-1 ml-2 text-base text-gray-900'}
                    placeholder={'Search for a location..'}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus={true}
                  />
                </View>
                {fetchingLocations ? (
                  <ActivityIndicator className={'my-4'} />
                ) : (
                  <FlatList
                    data={locations}
                    className={'flex-1'}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleSelect(item)}
                        className={'py-2 border-b border-neutral-200 mx-4'}
                      >
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </VStack>
              {/* Footer */}
              <HStack
                className={'justify-between items-center gap-3 w-full p-4'}
              >
                <Button
                  variant={'outline'}
                  action={'negative'}
                  className={'mr-3'}
                  onPress={handleReset}
                >
                  <ButtonText>Reset</ButtonText>
                </Button>
                <Button
                  variant={'outline'}
                  action={'secondary'}
                  onPress={() => setModalVisible(false)}
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </View>
        </Modal>
      </>
    );
  }
);
