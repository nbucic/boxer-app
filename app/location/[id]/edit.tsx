import { VStack } from '@/components/ui/vstack';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locationService } from '@/services/location';
import { useEffect } from 'react';
import { LocationFormData } from '@/types/location';
import { showAlert } from '@/lib/helpers/alert';
import { ListHeader } from '@/components/list/ListHeader';
import { DataLoader } from '@/components/layout/DataLoader';
import { DataError } from '@/components/layout/DataError';
import { FormField } from '@/components/common/FormField';
import { FormActions } from '@/components/form/FormActions';
import { GlassCard } from '@/components/layout/GlassCard';
import { ScreenContainer } from '@/components/layout/ScreenContainer';

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
    queryFn: () => locationService.get(locationId!),
    enabled: isEditMode,
  });

  const {
    control,
    formState: { isDirty, isValid },
    handleSubmit,
    reset,
  } = useForm<LocationFormData>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (existingLocation) {
      reset(existingLocation);
    }
  }, [existingLocation, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LocationFormData) =>
      isEditMode
        ? locationService.update(locationId!, data)
        : locationService.create(data),
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

  if (fetchingExistingLocation) {
    return <DataLoader text={'Loading location ...'} />;
  }

  if (status === 'error') {
    return (
      <DataError
        text={`Error fetching location: ${errorExistingLocation.message}`}
      />
    );
  }

  return (
    <ScreenContainer
      noPadding={false}
      header={
        <ListHeader
          backButton={true}
          title={isEditMode ? `Edit ${existingLocation?.name}` : 'New location'}
          subtitle={
            isEditMode
              ? 'Update details for this place'
              : 'Add a new spot to organize your boxes'
          }
        />
      }
    >
      <VStack space={'2xl'}>
        <GlassCard>
          <VStack space={'xl'}>
            <FormField
              control={control}
              name={'name'}
              label={'Location name'}
              placeholder={'e.g. Garage, Basement'}
              rules={{
                required: 'Name is required',
              }}
            />

            <FormField
              control={control}
              name={'description'}
              label={'Description (optional)'}
              placeholder={'Briefly describe what is stored here'}
              type={'text-area'}
            />
          </VStack>
        </GlassCard>

        <FormActions
          onSave={handleSubmit((data) => mutate(data))}
          onCancel={() =>
            router.canGoBack()
              ? router.back()
              : router.navigate('/(tabs)/locations')
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
