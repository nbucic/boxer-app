import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { ActivityIndicator, Alert, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { HStack } from '@/components/ui/hstack';
import { AlertCircleIcon } from '@/components/ui/icon';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createNewLocation,
  getLocation,
  updateLocation,
} from '@/services/location';
import { useEffect } from 'react';
import { LocationFormData } from '@/types/location';

export default function EditLocation() {
  const { id: locationId } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditMode = !!locationId;

  const { data: existingLocation, isFetching } = useQuery({
    queryKey: ['locations', locationId],
    queryFn: () => getLocation(locationId),
    enabled: isEditMode,
  });

  const {
    control,
    formState: { isDirty, errors },
    handleSubmit,
    reset,
  } = useForm<LocationFormData>();

  useEffect(() => {
    if (existingLocation) {
      reset(existingLocation);
    }
  }, [existingLocation, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LocationFormData) =>
      isEditMode ? updateLocation(locationId!, data) : createNewLocation(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['locations'] });
      router.navigate('/(tabs)/locations');
    },
    onError: (e: Error) => {
      Alert.alert(
        'Error',
        `Failed to ${isEditMode ? 'update' : 'create'} location: ${e.message}`
      );
    },
  });

  const saveTheLocation = (formData: LocationFormData) => {
    mutate(formData);
  };

  if (isFetching) {
    return (
      <View className={'flex-1 justify-center'}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  return (
    <View className={'p-4 w-full flex-1'}>
      <VStack className={'gap-4 flex-1'}>
        <Heading size={'lg'}>{isEditMode ? 'Edit' : 'New'} Location</Heading>
        <Controller
          control={control}
          name={'name'}
          rules={{
            required: 'Name is required',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.name} size={'md'}>
              <VStack space={'xs'}>
                <FormControlLabel>
                  <FormControlLabelText className={'text-typography-500'}>
                    Name the location
                  </FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type={'text'}
                    placeholder={'Basement'}
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
          name={'description'}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl size={'md'}>
              <Text className={'text-typography-500'}>Brief description</Text>
              <Textarea>
                <TextareaInput
                  placeholder={'Brief description'}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                />
              </Textarea>
            </FormControl>
          )}
        />
        <HStack space={'md'} className={'justify-between mt-auto'}>
          <Button
            variant={'outline'}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.navigate('/(tabs)/locations')
            }
            disabled={isPending}
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
          <Button
            className={'accent-indicator-primary'}
            action={
              !isDirty || Object.keys(errors).length > 0
                ? 'secondary'
                : 'positive'
            }
            onPress={handleSubmit(saveTheLocation)}
            disabled={!isDirty || Object.keys(errors).length > 0 || isPending}
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
      </VStack>
    </View>
  );
}
