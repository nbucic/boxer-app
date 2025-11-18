import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { ActivityIndicator, Alert, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { HStack } from '@/components/ui/hstack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNewBox, getBox, updateBox } from '@/services/box';
import { BoxFormData } from '@/types/box';
import { useEffect, useRef, useState } from 'react';
import Avatar from '@/components/Avatar';
import { ImagePickerAsset } from 'expo-image-picker';
import { Text } from '@/components/ui/text';
import { DefaultError } from '@tanstack/query-core';
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
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { getSignedUrlForImage } from '@/lib/helpers/supabase/storage';

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
  const [hasErrors, setHasErrors] = useState<DefaultError | null>(null);
  const locationInputRef = useRef<LocationSearchSelectRef>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  const {
    data: existingBox,
    isFetching: isFetchingBox,
    status,
    error: fetchingBoxError,
  } = useQuery({
    queryKey: ['boxes', boxId],
    queryFn: () => getBox(boxId!),
    enabled: isEditMode,
  });

  const {
    control,
    formState: { isDirty, errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<BoxFormData>({
    defaultValues: {
      name: '',
      description: '',
      location_id: null,
    },
  });

  useEffect(() => {
    // Only attempt to focus if we are NOT fetching and have a focus element.
    if (!isFetchingBox && focusElement) {
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
  }, [focusElement, isFetchingBox]);

  // Effect to reset the form when existingBox data is available
  useEffect(() => {
    if (existingBox) {
      reset(existingBox);
    } else {
      setValue('location_id', locationId, { shouldDirty: false });
    }
  }, [existingBox, reset]);

  // Effect to set the public image URL when existingBox data is available
  useEffect(() => {
    getSignedUrlForImage({ url: existingBox?.image_url }).then(
      (publicImageUrl) => {
        setPublicImageUrl(publicImageUrl);
      }
    );
  }, [existingBox?.image_url]);

  const handleImageChange = (image: ImagePickerAsset) => {
    setValue('new_box_asset', image, { shouldDirty: true });
    setPublicImageUrl(image.uri);
  };

  const {
    mutate,
    isPending,
    error: mutationError,
  } = useMutation({
    mutationFn: async (data: BoxFormData) =>
      isEditMode ? updateBox(boxId!, data) : createNewBox(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['boxes'] });
      router.navigate('/(tabs)/boxes');
    },
    onError: (e: Error) => {
      Alert.alert(
        'Error',
        `Failed to ${isEditMode ? 'update' : 'create'} box: ${e.message}`
      );
    },
  });

  useEffect(() => {
    setHasErrors(fetchingBoxError || mutationError || null);
  }, [fetchingBoxError, mutationError]);

  const saveTheBox = (formData: BoxFormData) => {
    mutate(formData);
  };

  if (isFetchingBox) {
    return (
      <View className={'flex-1 justify-center'}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  if (status === 'error' && hasErrors) {
    return (
      <View className={'flex-1 justify-center items-center p-4'}>
        <Text>Error fetching box: {hasErrors.message}</Text>
      </View>
    );
  }

  return (
    <View className={'p-4 w-full flex-1'}>
      <VStack className={'gap-4 flex-1'}>
        <Heading size={'lg'}>{isEditMode ? 'Edit' : 'New'} Box</Heading>

        <Controller
          control={control}
          name={'new_box_asset'}
          render={() => (
            <Avatar
              avatarUrl={publicImageUrl}
              onImageChange={handleImageChange}
              type={'box'}
            />
          )}
        />

        <Controller
          control={control}
          name={'name'}
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.name} size={'md'}>
              <VStack space={'xs'}>
                <FormControlLabel className={'text-typography-500'}>
                  <FormControlLabelText>Name the box</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type={'text'}
                    placeholder={'My precious Pokemon collection box'}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize={'none'}
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
          render={({ field: { onChange, value } }) => (
            <FormControl size={'md'}>
              <FormControlLabel>
                <FormControlLabelText>Location</FormControlLabelText>
              </FormControlLabel>
              <LocationSearchSelect
                ref={locationInputRef}
                value={value}
                onSelect={onChange}
                disabled={!!locationId}
              />
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name={'description'}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl size={'md'}>
              <Text>Brief description</Text>
              <Textarea>
                <TextareaInput
                  ref={descriptionInputRef as any}
                  placeholder={'Brief description'}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                />
              </Textarea>
            </FormControl>
          )}
        />
      </VStack>
      <HStack space={'md'} className={'justify-between p-4'}>
        <Button
          variant={'outline'}
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.navigate('/(tabs)/boxes')
          }
          disabled={isPending}
        >
          <ButtonText>Cancel</ButtonText>
        </Button>
        <Button
          className={'accent-indicator-primary'}
          action={`${!isDirty ? 'secondary' : 'primary'}`}
          onPress={handleSubmit(saveTheBox)}
          disabled={!isDirty || isPending}
        >
          {isPending ? (
            <ButtonText>
              {isEditMode ? 'Updating ...' : 'Creating ...'}
            </ButtonText>
          ) : (
            <ButtonText>{isEditMode ? 'Update' : 'Create'}</ButtonText>
          )}
        </Button>
      </HStack>
    </View>
  );
}
