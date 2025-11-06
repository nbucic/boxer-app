import { supabase } from '@/lib/supabase';
import { Alert, View } from 'react-native';
import { useState } from 'react';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Text } from '@/components/ui/text';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { AuthWeakPasswordError } from '@supabase/auth-js';
import { router } from 'expo-router';
import { getDeepLink } from '@/components/DeepLink';

interface Props {
  email: string;
  password: string;
}

export default function Auth() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleShowingPassword = () => {
    setShowPassword((state) => !state);
  };

  const signInWithEmail = async (data: FieldValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(data as Props);

    if (error) {
      console.log({ error });
      Alert.alert('Error', error.message);
    }

    setLoading(false);
    router.navigate('/(tabs)');
  };

  const signUpWithEmail = async (data: FieldValues) => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      ...(data as Props),
      options: {
        emailRedirectTo: getDeepLink(''),
      },
    });

    if (error) {
      if (error instanceof AuthWeakPasswordError) {
        let types: { [key: string]: string } = {};
        error.reasons.map((reason) => {
          switch (reason) {
            case 'characters':
              types['pattern'] =
                'Password must contain at least small letter, uppercase letter, number and special sign';
              break;
            case 'length':
              types['minLength'] = 'Password should be at least 8 characters';
              break;
          }
        });

        if (types) {
          setError('password', {
            types,
          });
        }

        setLoading(false);
        return;
      }
    }

    if (!session) {
      Alert.alert('Please check your inbox for email verification');
    }

    setLoading(false);
  };

  return (
    <View className={'flex-1 justify-center'}>
      <View className={'p-4 w-full'}>
        <VStack className={'gap-4'}>
          <Controller
            control={control}
            name={'email'}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email invalid',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.email} size={'md'}>
                <VStack space={'xs'}>
                  <Text className={'text-typography-500'}>Email</Text>
                  <Input>
                    <InputField
                      type={'text'}
                      placeholder={'email@example.com'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize={'none'}
                    />
                  </Input>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>
                      {errors.email?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </VStack>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name={'password'}
            rules={{
              required: 'Password is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.password} size={'md'}>
                <VStack space={'xs'}>
                  <Text className={'text-typography-500'}>Password</Text>
                  <Input className={'text-center'}>
                    <InputField
                      type={showPassword ? 'text' : 'password'}
                      placeholder={'password'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize={'none'}
                    />
                    <InputSlot
                      className={'pr-3'}
                      onPress={handleShowingPassword}
                    >
                      <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                    </InputSlot>
                  </Input>
                  {errors.password?.message && (
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText>
                        {errors.password?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                  {errors.password?.types &&
                    Object.entries(errors.password.types).map(
                      ([key, value]) => (
                        <FormControlError key={key}>
                          <FormControlErrorIcon as={AlertCircleIcon} />
                          <FormControlErrorText>{value}</FormControlErrorText>
                        </FormControlError>
                      )
                    )}
                </VStack>
              </FormControl>
            )}
          />
          <HStack space={'md'} className={'justify-between'}>
            <Button
              className={'accent-indicator-primary'}
              onPress={handleSubmit(signInWithEmail)}
              disabled={loading || !!errors.email || !!errors.password}
            >
              <ButtonText> Sign in</ButtonText>
            </Button>
            <Button
              variant={'outline'}
              onPress={handleSubmit(signUpWithEmail)}
              disabled={loading || !!errors.email || !!errors.password}
            >
              <ButtonText>Sign up</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </View>
    </View>
  );
}
