import { Alert, Platform, RefreshControl } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { useForm } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import { getCurrentUser, updateCurrentUser } from '@/services/user';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import { Divider } from '@/components/ui/divider';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, THEME_STORAGE_KEY } from '@/hooks/useInitialTheme';
import { ListHeader } from '@/components/list/ListHeader';
import { DataLoader } from '@/components/layout/DataLoader';
import { DataError } from '@/components/layout/DataError';
import { FormField } from '@/components/common/FormField';
import { FormActions } from '@/components/form/FormActions';
import { GlassCard } from '@/components/layout/GlassCard';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { User, UserFormData } from '@/types/user';
import { ThemeSelector } from '@/components/profile/ThemeSelector';

export default function Profile() {
  const queryClient = useQueryClient();
  const { setColorScheme, colorScheme } = useColorScheme();

  const { data, status, error, isFetching, refetch, isRefetching } = useQuery<
    User,
    Error
  >({
    queryKey: ['user'],
    queryFn: getCurrentUser,
  });

  const {
    control,
    formState: { isDirty, isValid },
    handleSubmit,
    reset,
    setValue,
  } = useForm<UserFormData>({
    defaultValues: { email: '', full_name: '', avatar_url: null },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UserFormData) => updateCurrentUser(data),
    onSuccess: () => {
      Alert.alert('Success', 'Profile updated successfully!');
      void queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (e: Error) => {
      Alert.alert('Error', `Failed to update profile: ${e.message}`);
    },
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const handleImageChange = (image: ImagePickerAsset) => {
    setValue('new_asset', image, { shouldDirty: true });
    setValue('avatar_url', image.uri, { shouldDirty: true });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const setTheme = (theme: Theme) => {
    setColorScheme(theme);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
  };

  if (isFetching && !data) {
    return <DataLoader text={'Crafting your profile data...'} />;
  }

  if (status === 'error' && error) {
    return <DataError text={`Error fetching profile: ${error.message}`} />;
  }

  return (
    <ScreenContainer
      refreshControl={
        Platform.OS !== 'web' ? (
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        ) : undefined
      }
    >
      <ListHeader
        title={'Settings'}
        isRefetching={isRefetching}
        refetch={refetch}
      />
      <VStack space={'xl'} className={'px-6'}>
        <GlassCard title={'Account Information'}>
          <HStack className={'justify-center py-2'}>
            <FormField
              control={control}
              name={'avatar_url'}
              rules={{ required: 'Photo is required' }}
              options={{ handleImageChange }}
              type={'image'}
            />
          </HStack>

          <VStack space={'lg'}>
            <FormField
              control={control}
              name={'email'}
              label={'Email address'}
              placeholder={'email@example.com'}
              options={{ isDisabled: true }}
            />

            <FormField
              control={control}
              name={'full_name'}
              label={'Full name'}
              placeholder={'Your name'}
              rules={{
                required: 'Full name is required',
              }}
            />
          </VStack>
        </GlassCard>

        <FormActions
          onSave={handleSubmit((data) => mutate(data))}
          isPending={isPending}
          isValid={isValid}
          isDirty={isDirty}
          saveLabel={'Update profile'}
        />

        <Divider className={'my-2 bg-outline-100'} />

        {/* 2. PERSONALIZATION (Segmented Control Look) */}
        <GlassCard title={'Personalization'}>
          <ThemeSelector currentTheme={colorScheme!} onThemeChange={setTheme} />
        </GlassCard>

        <Divider className={'my-4 bg-outline-100'} />

        <GlassCard
          title={'Danger zone'}
          className={'border-error-100 bg-error-0'}
        >
          {/* 3. SIGN OUT (Solid Red Button) */}
          <Button action={'negative'} size={'lg'} onPress={handleSignOut}>
            <ButtonText className={'text-typography-0'}>Sign Out</ButtonText>
          </Button>
        </GlassCard>

        <Text className={'text-center text-typography-400 text-xs mt-1'}>
          Version 1.0.1
        </Text>
      </VStack>
    </ScreenContainer>
  );
}
