import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronDownIcon, XIcon } from 'lucide-react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { SelectSearchable } from '@/types';

const INITIAL_BOXES_SHOWN = 5;

interface Props<T> {
  value?: string | null;
  onSelect: (id: string | null) => void;
  searchQuery: {
    queryKey: string;
    queryFn: ({
      search,
      limit,
    }: {
      search?: string;
      limit?: number;
    }) => Promise<T[]>;
  };
  disabled: boolean;
  title: string;
  placeholder: string;
}

interface SearchSelectBaseRef {
  focus: () => void;
  close: () => void;
}

export const SearchSelectBase = forwardRef<
  SearchSelectBaseRef,
  Props<SelectSearchable>
>(
  (
    { value, onSelect, searchQuery, disabled = false, title, placeholder },
    ref
  ) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

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

    const { data, isFetching } = useQuery({
      queryKey: [searchQuery.queryKey, debouncedSearch],
      queryFn: () => {
        return searchQuery.queryFn({
          search: debouncedSearch,
          limit: INITIAL_BOXES_SHOWN,
        });
      },
      initialData: [],
    });

    const handleSelection = (id: string | null) => {
      onSelect(id);
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
          disabled={disabled}
        >
          <Text
            className={
              'ml-3 text-gray-700 flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap'
            }
            numberOfLines={1}
            ellipsizeMode={'tail'}
          >
            {value || placeholder}
          </Text>
          {!disabled && <ChevronDownIcon size={20} />}
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
                  {title}
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
                    placeholder={placeholder}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus={true}
                  />
                </View>
                {isFetching ? (
                  <ActivityIndicator className={'my-4'} />
                ) : (
                  <FlatList
                    data={data}
                    className={'flex-1'}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }: { item: SelectSearchable }) => {
                      return (
                        <TouchableOpacity
                          onPress={() => handleSelection(item.id)}
                          className={'py-2 border-b border-neutral-200 mx-4'}
                        >
                          <Text>{item.name}</Text>
                        </TouchableOpacity>
                      );
                    }}
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
                  onPress={() => handleSelection(null)}
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
