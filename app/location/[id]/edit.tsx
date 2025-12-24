import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
} from 'react-native';
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
import { showAlert } from '@/lib/helpers/alert';
import { ListHeader } from '@/components/list/ListHeader';
import clsx from 'clsx';

export default function EditLocationScreen() {
  const { id: locationId } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditMode = !!locationId;

  const {
    data: existingLocation,
    isFetching: fetchingExistingLocation,
    status,
    error: errorExistingLocation,
  } = useQuery({
    queryKey: ['locations', locationId],
    queryFn: () => getLocation(locationId!),
    enabled: isEditMode,
  });

  const {
    control,
    formState: { isDirty, isValid, errors },
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
      router.dismissAll();
      router.navigate('/(tabs)/locations');
    },
    onError: (e: Error) => {
      showAlert({
        title: 'Error',
        message: `Failed to ${isEditMode ? 'update' : 'create'} location: ${e.message}`,
      });
    },
  });

  const saveTheLocation = (formData: LocationFormData) => {
    mutate(formData);
  };

  if (fetchingExistingLocation) {
    return (
      <View className={'flex-1 justify-center bg-white dark:bg-black'}>
        <ActivityIndicator size={'large'} color={'#2563eb'} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View className={'flex-1 justify-center items-center p-4'}>
        <Text>Error fetching location: {errorExistingLocation.message}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={'height'}
      className={'flex-1 bg-white dark:bg-black'}
    >
      <ListHeader
        title={`${isEditMode ? 'Edit' : 'New'} Location`}
        subtitle={
          isEditMode
            ? 'Update details for this place.'
            : 'Add a new spot to organize your tools.'
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
                name={'name'}
                rules={{
                  required: 'Name is required',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormControl isInvalid={!!errors.name}>
                    <VStack space={'xs'}>
                      <FormControlLabel>
                        <FormControlLabelText
                          className={
                            'text-sm font-medium text-gray-700 dark:text-gray-300'
                          }
                        >
                          Location name
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input
                        className={clsx(
                          'h-12 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
                          // Target the focus state specifically via the data attribute
                          'data-[focus=true]:border-blue-500 data-[focus=true]:ring-1 data-[focus=true]:ring-blue-500'
                        )}
                      >
                        <InputField
                          type={'text'}
                          placeholder={'e.g. Garage, Basement'}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          autoCapitalize={'none'}
                          className={'text-gray-900 dark:text-white'}
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
                  <FormControl>
                    <VStack space={'xs'}>
                      <FormControlLabel>
                        <FormControlLabelText
                          className={
                            'text-sm font-medium text-gray-700 dark:text-gray-300'
                          }
                        >
                          Description (optional)
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Textarea
                        className={
                          'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }
                      >
                        <TextareaInput
                          placeholder={
                            'Briefly describe what is stored here...'
                          }
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value || ''}
                          className={'text-gray-900 dark:text-white'}
                        />
                      </Textarea>
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
                  ? router.back()
                  : router.navigate('/(tabs)/locations')
              }
              disabled={isPending}
            >
              <ButtonText className={'text-gray-600 dark:text-gray-300'}>
                Cancel
              </ButtonText>
            </Button>
            <Button
              size={'lg'}
              className={`rounded-xl px-8 ${!isDirty || !isValid ? 'bg-gray-300' : 'bg-blue-600 data-[hover=true]:bg-blue-700'}`}
              onPress={handleSubmit(saveTheLocation)}
              disabled={!isDirty || !isValid || isPending}
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
