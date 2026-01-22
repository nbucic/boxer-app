import { VStack } from '@/components/ui/vstack';
import { Alert, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { HStack } from '@/components/ui/hstack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNewBox, getBoxEditData, updateBox } from '@/services/box';
import { BoxFormData } from '@/types/box';
import { useEffect, useRef } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import { LocationSearchSelectRef } from '@/components/form/LocationSearchSelect';
import { ListHeader } from '@/components/list/ListHeader';
import { DataLoader } from '@/components/layout/DataLoader';
import { DataError } from '@/components/layout/DataError';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlassCard } from '@/components/layout/GlassCard';
import { FormField } from '@/components/common/FormField';
import { FormActions } from '@/components/form/FormActions';

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
    formState: { isDirty, isValid },
    handleSubmit,
    reset,
    setValue,
  } = useForm<BoxFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      image_url: null,
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
      router.navigate('/boxes');
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
    if (existingBox) {
      reset({ ...existingBox, new_box_asset: null });
    }
  }, [existingBox, reset]);

  const handleImageChange = (image: ImagePickerAsset) => {
    setValue('new_box_asset', image, { shouldDirty: true });
    setValue('image_url', image.uri, { shouldDirty: true });
  };

  if (fetchingExistingBox) {
    return <DataLoader text={'Gathering box information ...'} />;
  }

  if (status === 'error') {
    return (
      <DataError text={`Error fetching box: ${errorExistingBox.message}`} />
    );
  }

  return (
    <ScreenContainer
      noPadding={false}
      header={
        <ListHeader
          title={isEditMode ? `Edit ${existingBox?.name}` : 'New box'}
          subtitle={
            isEditMode
              ? 'Update details for this box'
              : 'Add a new box to organize your tools'
          }
        />
      }
    >
      <VStack space={'2xl'}>
        <GlassCard>
          <HStack className={'justify-center py-2'}>
            <FormField
              control={control}
              name={'image_url'}
              rules={{ required: 'Photo is required' }}
              label={'Box photo'}
              options={{
                handleImageChange,
                type: 'box',
              }}
              type={'image'}
            />
          </HStack>

          <VStack space={'xl'}>
            <FormField
              control={control}
              name={'name'}
              label={'Name the box'}
              placeholder={'Wrenches box'}
              rules={{ required: 'Name is required' }}
            />

            <FormField
              control={control}
              name={'location_id'}
              label={'Location'}
              rules={{ required: 'Store this box somewhere 🤷' }}
              options={{
                // isDisabled: true,
                isDisabled: !!locationId,
              }}
              type={'location-dropdown'}
              fieldRef={locationInputRef}
            />

            <FormField
              control={control}
              name={'description'}
              label={'Brief description (optional)'}
              placeholder={"Briefly describe the box you're creating "}
              type={'text-area'}
              fieldRef={descriptionInputRef}
            />
          </VStack>
        </GlassCard>

        <FormActions
          onSave={handleSubmit((data) => mutate(data))}
          onCancel={() =>
            router.canGoBack() ? router.back() : router.navigate('/boxes')
          }
          isPending={isPending}
          isValid={isValid}
          isDirty={isDirty}
          saveLabel={isEditMode ? 'Update' : 'Create'}
        />
      </VStack>
    </ScreenContainer>
  );
}
