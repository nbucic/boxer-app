import { Alert, Platform, Pressable, RefreshControl, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { useForm } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import {
  getCurrentUser,
  updateCurrentUser,
  UpdateUserPayload,
  User,
} from '@/services/user';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { ImagePickerAsset } from 'expo-image-picker';
import { Computer, Moon, Smartphone, Sun } from 'lucide-react-native';
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

type ProfileFormData = User & {
  new_avatar_asset: ImagePickerAsset | null;
};

export default function Profile() {
  const [publicImageUrl, setPublicImageUrl] = useState<string | null>(null);
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
  } = useForm<ProfileFormData>({
    defaultValues: { email: '', full_name: '', new_avatar_asset: null },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateUserPayload) => updateCurrentUser(data),
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
      reset({ ...data, new_avatar_asset: null });
      setPublicImageUrl(data.avatar_url);
    }
  }, [data, reset]);

  const handleImageChange = (image: ImagePickerAsset) => {
    setValue('new_avatar_asset', image, { shouldDirty: true });
    setPublicImageUrl(image.uri);
  };

  const onUpdateProfile = (formData: ProfileFormData) => {
    if (!data?.id) return;

    mutate(formData);
  };

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const setTheme = (theme: Theme) => {
    setColorScheme(theme);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    // window.location.reload();
  };

  if (isFetching && !data) {
    // if (true) {
    return <DataLoader text={'Crafting your profile data...'} />;
  }

  if (status === 'error' && error) {
    return <DataError text={`Error fetching profile: ${error.message}`} />;
  }

  return (
    <ScreenContainer
      refreshControl={
        Platform.OS !== 'web' ? (
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
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
              name={'new_avatar_asset'}
              rules={{ required: 'Photo is required' }}
              options={{ handleImageChange, preview: publicImageUrl }}
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
          onSave={handleSubmit(onUpdateProfile)}
          isPending={isPending}
          isValid={isValid}
          isDirty={isDirty}
          saveLabel={'Update profile'}
        />

        <Divider className={'my-2 bg-outline-100'} />

        {/* 2. PERSONALIZATION (Segmented Control Look) */}
        <GlassCard title={'Personalization'}>
          <View
            className={
              'bg-background-50 p-1.5 rounded-xl flex-row border border-outline-100'
            }
          >
            {(['light', 'dark', 'system'] as Theme[]).map((t) => {
              const isActive = colorScheme === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setTheme(t)}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                    isActive ? 'bg-background-0 shadow-sm ' : 'bg-transparent'
                  }`}
                >
                  <Icon
                    as={
                      t === 'light'
                        ? Sun
                        : t === 'dark'
                          ? Moon
                          : Platform.OS === 'web'
                            ? Computer
                            : Smartphone
                    }
                    size={'xs'}
                    className={`${isActive ? 'text-primary-500' : 'text-typography-400'}`}
                  />
                  <Text
                    className={`ml-2 text-xs font-bold ${isActive ? 'text-typography-900' : 'text-typography-400'}`}
                  >
                    {t.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
