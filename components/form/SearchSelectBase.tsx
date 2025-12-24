import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { SelectSearchable } from '@/types';
import clsx from 'clsx';

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
          activeOpacity={0.7}
          className={clsx(
            'flex-row items-center h-12 px-4 rounded-xl border',
            'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
            modalVisible && 'border-blue-500 ring-1 ring-blue-500',
            disabled && 'opacity-50 bg-gray-100'
          )}
          onPress={() => {
            setModalVisible(true);
          }}
          disabled={disabled}
        >
          <Text
            className={clsx(
              'flex-1 text-base',
              value ? 'text-gray-900 dark:text-white' : 'text-gray-400',
              'overflow-hidden overflow-ellipsis whitespace-nowrap'
            )}
            {...(Platform.OS === 'android' && {
              numberOfLines: 1,
              ellipsizeMode: 'tail',
            })}
          >
            {value || placeholder}
          </Text>
          {!disabled && (
            <ChevronDownIcon
              size={20}
              className={'text-gray-400 dark:text-gray-500'}
            />
          )}
        </TouchableOpacity>

        <Modal
          animationType={'slide'}
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={'height'}
            className={'flex-1 justify-end bg-black/60'}
          >
            <VStack
              className={
                'bg-white dark:bg-gray-900 rounded-t-[32px] h-[80%] shadow-2xl'
              }
            >
              {/* Header */}
              <View className={'items-center pt-3 pb-1'}>
                <View
                  className={
                    'w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700'
                  }
                />
              </View>

              <HStack className={'justify-between items-center px-6 py-4'}>
                <Heading
                  size={'md'}
                  className={'text-gray-900 dark:text-white'}
                >
                  {title}
                </Heading>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className={'p-2 rounded-full bg-gray-100 dark:bg-gray-800'}
                >
                  <XIcon size={20} className={'text-gray-500'} />
                </TouchableOpacity>
              </HStack>

              {/* Search bar container */}
              <View className={'px-6 py-4'}>
                <HStack
                  className={
                    'items-center px-5 rounded-xl bg-gray-100 dark:bg-gray-900 border border-background-300'
                  }
                >
                  <SearchIcon size={18} className={'text-gray-400'} />
                  <TextInput
                    className={
                      'flex-1 h-11 ml-3 text-base text-gray-900 dark:text-white'
                    }
                    placeholder={placeholder}
                    placeholderTextColor={'#9ca3af'}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus={true}
                  />
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                      <XIcon size={16} className={'text-gray-400'} />
                    </TouchableOpacity>
                  )}
                </HStack>
              </View>

              {/* List content */}
              <View className={'flex-1'}>
                {isFetching && search.length > 0 ? (
                  <ActivityIndicator className={'mt-10'} color={'#3b82f6'} />
                ) : (
                  <FlatList
                    data={data}
                    contentContainerClassName={'px-6 py-4'}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }: { item: SelectSearchable }) => (
                      <TouchableOpacity
                        onPress={() => handleSelection(item.id)}
                        className={
                          'py-2 border-b border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800'
                        }
                      >
                        <Text
                          className={
                            'text-base text-gray-700 dark:text-gray-300'
                          }
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      !isFetching ? (
                        <View className={'items-center mt-10'}>
                          <Text className={'text-gray-400'}>
                            No results found
                          </Text>
                        </View>
                      ) : null
                    }
                  />
                )}
              </View>

              {/* Footer */}
              <HStack
                space={'md'}
                className={clsx(
                  'p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
                  'justify-between'
                )}
              >
                <Button
                  variant={'outline'}
                  className={
                    'flex-1 border-gray-200 dark:border-gray-700 h-12 rounded-xl max-w-40'
                  }
                  onPress={() => handleSelection(null)}
                >
                  <ButtonText className={'text-red-500'}>
                    Clear selection
                  </ButtonText>
                </Button>
                <Button
                  className={
                    'flex-1 bg-gray-900 dark:bg-white h-12 rounded-xl max-w-40'
                  }
                  onPress={() => setModalVisible(false)}
                >
                  <ButtonText className={'text-white dark:text-black'}>
                    Cancel
                  </ButtonText>
                </Button>
              </HStack>
            </VStack>
          </KeyboardAvoidingView>
        </Modal>
      </>
    );
  }
);
