import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { HStack } from '@/components/ui/hstack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNewBox, getBoxEditData, updateBox } from '@/services/box';
import { BoxFormData } from '@/types/box';
import { useEffect, useRef, useState } from 'react';
import Avatar from '@/components/Avatar';
import { ImagePickerAsset } from 'expo-image-picker';
import { Text } from '@/components/ui/text';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { AlertCircleIcon } from '@/components/ui/icon';
import {
  LocationSearchSelect,
  LocationSearchSelectRef,
} from '@/components/form/LocationSearchSelect';
import { ListHeader } from '@/components/list/ListHeader';
import clsx from 'clsx';

export default function EditBoxScreen() {
  const {
    id: boxId,
    focus: focusElement,
    locationId,
  } = useLocalSearchParams<{
    id: string;
    focus?: 'location' | 'description';
    locationId?: string;
  }>();
  const [publicImageUrl, setPublicImageUrl] = useState<string | null>();
  const queryClient = useQueryClient();
  const isEditMode = !!boxId;
  const locationInputRef = useRef<LocationSearchSelectRef>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  const {
    data: existingBox,
    isFetching: fetchingExistingBox,
    status,
    error: errorExistingBox,
  } = useQuery({
    queryKey: ['boxes', boxId],
    queryFn: () => getBoxEditData(boxId!),
    enabled: isEditMode,
  });

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
    setValue,
  } = useForm<BoxFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      location_id: null,
    },
  });

  useEffect(() => {
    // Only attempt to focus if we are NOT fetching and have a focus element.
    if (!fetchingExistingBox && focusElement) {
      const timer = setTimeout(() => {
        switch (focusElement) {
          case 'description':
            descriptionInputRef.current?.focus();
            break;
          case 'location':
            locationInputRef.current?.focus();
            break;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
    return; // Return an empty cleanup function if conditions are not met
  }, [focusElement, fetchingExistingBox]);

  // Effect to reset the form when existingBox data is available
  useEffect(() => {
    if (existingBox) {
      reset(existingBox);
    } else if (locationId) {
      setValue('location_id', locationId, { shouldDirty: false });
    }
  }, [existingBox, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: BoxFormData) =>
      isEditMode ? updateBox(boxId!, data) : createNewBox(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['boxes'] });
      router.dismissAll();
      router.navigate('/(tabs)/boxes');
    },
    onError: (e: Error) => {
      Alert.alert(
        'Error',
        `Failed to ${isEditMode ? 'update' : 'create'} box: ${e.message}`
      );
    },
  });

  // Effect to set the public image URL when existingBox data is available
  useEffect(() => {
    if (existingBox?.image_url) {
      setPublicImageUrl(existingBox?.image_url);
    }
  }, [existingBox?.image_url]);

  const handleImageChange = (image: ImagePickerAsset) => {
    setPublicImageUrl(image.uri);
    setValue('photo_added', true);
    setValue('new_box_asset', image, { shouldDirty: true });
  };

  const saveTheBox = (formData: BoxFormData) => {
    mutate(formData);
  };

  if (fetchingExistingBox) {
    return (
      <View className={'flex-1 justify-center bg-white dark:bg-black'}>
        <ActivityIndicator size={'large'} color={'#2563eb'} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className={'flex-1 justify-center items-center p-4'}>
        <Text>Error fetching box: {errorExistingBox.message}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={'height'}
      className={'flex-1 bg-white dark:bg-black'}
    >
      <ListHeader
        title={`${isEditMode ? 'Edit' : 'New'} box`}
        subtitle={
          isEditMode ? 'Update details for this box.' : 'Add a new box.'
        }
      />
      <ScrollView className={'flex-1 px-4 pb-4'}>
        <VStack space={'2xl'}>
          <View
            className={
              'bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800'
            }
          >
            <VStack space={'xl'}>
              <Controller
                control={control}
                name={'photo_added'}
                rules={{ required: 'Photo is required!' }}
                render={() => (
                  <FormControl isInvalid={!!errors.photo_added}>
                    <VStack className={'items-center py-2'} space={'md'}>
                      <Avatar
                        avatarUrl={publicImageUrl}
                        onImageChange={handleImageChange}
                        type={'box'}
                      />
                      <VStack className={'items-center'}>
                        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Box Photo
                        </Text>
                        <Text className="text-xs text-gray-500">
                          Tap to change image
                        </Text>
                      </VStack>
                    </VStack>
                    {errors.photo_added && (
                      <FormControlError className={'justify-center'}>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors.photo_added?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name={'name'}
                rules={{ required: 'Name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.name}>
                    <VStack space={'xs'}>
                      <FormControlLabel>
                        <FormControlLabelText
                          className={
                            'text-sm font-medium text-gray-700 dark:text-gray-300'
                          }
                        >
                          Name the box
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        className={clsx(
                          'h-12 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-80',
                          // Target the focus state specifically via the data attribute
                          'data-[focus=true]:border-blue-500 data-[focus=true]:ring-1 data-[focus=true]:ring-blue-500'
                        )}
                      >
                        <InputField
                          type={'text'}
                          placeholder={'My precious Pokemon collection box'}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          autoCapitalize={'none'}
                          className={
                            'text-gray-900 dark:text-white bg-white dark:bg-gray-900'
                          }
                        />
                      </Input>
                      {errors.name && (
                        <FormControlError>
                          <FormControlErrorIcon as={AlertCircleIcon} />
                          <FormControlErrorText>
                            {errors.name?.message}
                          </FormControlErrorText>
                        </FormControlError>
                      )}
                    </VStack>
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name={'location_id'}
                rules={{
                  required: 'Store this box somewhere 🤷',
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl isInvalid={!!errors.location_id}>
                    <VStack space={'xs'}>
                      <FormControlLabel>
                        <FormControlLabelText
                          className={
                            'text-sm font-medium text-gray-800 dark:text-gray-300'
                          }
                        >
                          Location
                        </FormControlLabelText>
                      </FormControlLabel>
                      <LocationSearchSelect
                        value={value}
                        onSelect={onChange}
                        disabled={!!locationId}
                      />
                      <FormControlError>
                        <FormControlErrorIcon as={AlertCircleIcon} />
                        <FormControlErrorText>
                          {errors?.location_id?.message}
                        </FormControlErrorText>
                      </FormControlError>
                    </VStack>
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name={'description'}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl>
                    <VStack space={'xs'}>
                      <FormControlLabel>
                        <FormControlLabelText
                          className={
                            'text-sm font-medium text-gray-700 dark:text-gray-300'
                          }
                        >
                          Brief description (optional)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        className={clsx(
                          'h-12 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-80',
                          // Target the focus state specifically via the data attribute
                          'data-[focus=true]:border-blue-500 data-[focus=true]:ring-1 data-[focus=true]:ring-blue-500'
                        )}
                      >
                        <InputField
                          type={'text'}
                          placeholder={
                            "Briefly describe the box you're creating..."
                          }
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value || ''}
                          autoCapitalize={'none'}
                          className={
                            'text-gray-900 dark:text-white bg-white dark:bg-gray-900'
                          }
                        />
                      </Input>
                    </VStack>
                  </FormControl>
                )}
              />
            </VStack>
          </View>
          <HStack space={'md'} className={'justify-end mt-2'}>
            <Button
              variant={'outline'}
              size={'lg'}
              className={
                'border-gray-200 dark:border-gray-700 rounded-xl px-6 py-3'
              }
              onPress={() =>
                router.canGoBack()
                  ? router.back
                  : router.navigate('/(tabs)/boxes')
              }
              disabled={isPending}
            >
              <ButtonText className={'text-gray-600 dark:text-gray-300'}>
                Cancel
              </ButtonText>
            </Button>
            <Button
              size={'lg'}
              className={`rounded-xl px-8 ${!isDirty ? 'bg-gray-300' : 'bg-blue-600 data-[hover=true]:bg-blue-700'}`}
              onPress={handleSubmit(saveTheBox)}
              disabled={!isDirty || isPending}
            >
              {isPending ? (
                <ActivityIndicator
                  size={'small'}
                  color={'white'}
                  className={'mr-2'}
                />
              ) : (
                <ButtonText className={'font-semibold text-white'}>
                  {isEditMode ? 'Update' : 'Create'}
                </ButtonText>
              )}
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
