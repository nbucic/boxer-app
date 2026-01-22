import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { DataLoader } from '@/components/layout/DataLoader';

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
            'border-outline-100 bg-background-0',
            'border-background-300 flex-row overflow-hidden content-center items-center',
            'h-11 rounded border px-3',
            modalVisible && 'border-primary-500 shadow-soft-1',
            disabled && 'opacity-50 bg-background-50'
          )}
          onPress={() => {
            setModalVisible(true);
          }}
          disabled={disabled}
        >
          <Text
            className={clsx(
              'flex-1 text-lg web:outline-0',
              value ? 'text-typography-900' : 'text-typography-400',
              'web:data-[disabled=true]:cursor-not-allowed overflow-hidden overflow-ellipsis whitespace-nowrap'
            )}
            {...(Platform.OS === 'android' && {
              numberOfLines: 1,
              ellipsizeMode: 'tail',
            })}
          >
            {value || placeholder}
          </Text>
          {!disabled && (
            <ChevronDownIcon size={20} className={'text-typography-400'} />
          )}
        </TouchableOpacity>

        <Modal
          animationType={'slide'}
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={
              'flex-1 bg-background-900/40 backdrop-blur-xl justify-end'
            }
          >
            <VStack
              className={
                'bg-background-0 rounded-t-3xl border-t border-outline-50 pb-safe shadow-2xl px-6'
              }
            >
              {/* Handle bar for visual cue */}
              <View className={'items-center pt-3 pb-1'}>
                <View className={'w-12 h-1.5 bg-outline-200 rounded-full'} />
              </View>

              {/* Header */}
              <HStack className={'justify-between items-center py-4'}>
                <VStack>
                  <Heading size={'xl'} className={'text-typography-900'}>
                    {title}
                  </Heading>
                </VStack>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className={'bg-background-100 p-2 rounded-full'}
                >
                  <XIcon size={20} className={'text-typography-600'} />
                </TouchableOpacity>
              </HStack>

              {/* Search bar - glossy card style */}
              <View className={'py-2'}>
                <Input
                  variant={'outline'}
                  size={'lg'}
                  className={'border-outline-100'}
                >
                  <InputSlot className={'p-3'}>
                    <InputIcon as={SearchIcon} />
                  </InputSlot>
                  <InputField
                    placeholder={placeholder}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus={true}
                  />
                  {search.length > 0 && (
                    <InputSlot className={'p-3'} onPress={() => setSearch('')}>
                      <InputIcon as={XIcon} />
                    </InputSlot>
                  )}
                </Input>
              </View>

              {/* Results list */}
              <View className={'flex-1'}>
                {isFetching && search.length > 0 ? (
                  <DataLoader />
                ) : (
                  <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }: { item: SelectSearchable }) => (
                      <TouchableOpacity
                        onPress={() => handleSelection(item.id)}
                        className={
                          'p-4 border-b border-outline-50 active:bg-background-50 hover:bg-background-50'
                        }
                      >
                        <Text className={'text-lg text-typography-700'}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      !isFetching ? (
                        <VStack className={'items-center mt-10 space-y-2'}>
                          <Text className={'text-typography-400'}>
                            No results found
                          </Text>
                        </VStack>
                      ) : null
                    }
                  />
                )}
              </View>

              {/* Footer */}
              <HStack space={'md'} className={'justify-between py-4'}>
                <Button
                  variant={'outline'}
                  size={'lg'}
                  className={'border-outline-200 rounded'}
                  onPress={() => handleSelection(null)}
                >
                  <ButtonText className={'text-error-500 font-bold'}>
                    Clear selection
                  </ButtonText>
                </Button>
                <Button
                  className={'bg-primary-500 rounded shadow-soft-1'}
                  onPress={() => setModalVisible(false)}
                >
                  <ButtonText className={'text-white font-bold'}>
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
