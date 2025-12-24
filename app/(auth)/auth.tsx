import { supabase } from '@/lib/supabase';
import { View } from 'react-native';
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
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Controller, useForm } from 'react-hook-form';
import { AuthWeakPasswordError } from '@supabase/auth-js';
import { router } from 'expo-router';
import { getDeepLink } from '@/components/DeepLink';
import { showAlert } from '@/lib/helpers/alert';
import { Heading } from '@/components/ui/heading';

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

  const signInWithEmail = async (data: Props) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(data as Props);

    if (error) {
      console.log({ error });
      showAlert({
        title: 'Authentication Error',
        message: error.message,
      });
    } else {
      router.replace('/(tabs)');
    }

    setLoading(false);
  };

  const signUpWithEmail = async (data: Props) => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      ...data,
      options: {
        emailRedirectTo: getDeepLink(''),
      },
    });

    if (error) {
      if (error instanceof AuthWeakPasswordError) {
        let types: { [key: string]: string } = {};
        error.reasons.forEach((reason) => {
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
      showAlert({
        title: 'Successful signup',
        message: 'Please check your inbox for email verification',
      });
    }

    setLoading(false);
  };

  return (
    <View className={'flex-1 bg-background-0'}>
      <View className={'flex-1 justify-center p-8'}>
        <VStack space={'xs'} className={'mb-10'}>
          <Heading size={'3xl'} className={'text-typography-900'}>
            Un-Box your tools
          </Heading>
          <Text className={'text-typography-500'}>
            Sign in to your account or create a now one
          </Text>
        </VStack>

        <VStack space={'xl'}>
          {/*Email field */}
          <Controller
            control={control}
            name={'email'}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.email}>
                <VStack space={'xs'}>
                  <Text className={'text-typography-600 font-medium ml-1'}>
                    Email
                  </Text>
                  <Input
                    variant={'outline'}
                    size={'lg'}
                    className={'bg-background-50'}
                  >
                    <InputField
                      type={'text'}
                      placeholder={'name@example.com'}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize={'none'}
                      keyboardType={'email-address'}
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

          {/*Password field */}
          <Controller
            control={control}
            name={'password'}
            rules={{
              required: 'Password is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.password}>
                <VStack space={'xs'}>
                  <Text className={'text-typography-600 font-medium ml-1'}>
                    Password
                  </Text>
                  <Input
                    variant={'outline'}
                    size={'lg'}
                    className={'bg-background-50'}
                  >
                    <InputField
                      type={showPassword ? 'text' : 'password'}
                      placeholder={'Enter your password'}
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
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>
                      {errors.password?.message}
                    </FormControlErrorText>
                  </FormControlError>
                </VStack>
              </FormControl>
            )}
          />

          {/* Actions */}
          <VStack space={'lg'} className={'mt-4'}>
            <Button
              size={'lg'}
              className={'bg-primary-500'}
              onPress={handleSubmit(signInWithEmail)}
              disabled={loading}
            >
              {loading && <ButtonSpinner className={'mr-2'} />}
              <ButtonText className={'font-semibold'}>Sign in</ButtonText>
            </Button>

            <HStack space={'xs'} className={'justify-center items-center'}>
              <Text className={'text-typography-500'}>
                Don't have an account?
              </Text>
              <Button
                variant={'link'}
                onPress={handleSubmit(signUpWithEmail)}
                disabled={loading}
              >
                <ButtonText className={'text-primary-500 font-bold'}>
                  Sign Up
                </ButtonText>
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </View>
    </View>
  );
}
