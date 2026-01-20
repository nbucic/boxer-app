import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { Button, ButtonText } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { AuthWeakPasswordError } from '@supabase/auth-js';
import { router } from 'expo-router';
import { getDeepLink } from '@/components/DeepLink';
import { showAlert } from '@/lib/helpers/alert';
import { Heading } from '@/components/ui/heading';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { GlassCard } from '@/components/layout/GlassCard';
import { FormField } from '@/components/common/FormField';
import { FormActions } from '@/components/form/FormActions';

interface Props {
  email: string;
  password: string;
}

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isDirty },
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });
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
    <ScreenContainer extraClasses={{ scrollableView: 'justify-center py-10' }}>
      <VStack space={'xs'} className={'mb-10'}>
        <Heading size={'3xl'} className={'text-typography-900'}>
          Un-Box your tools
        </Heading>
        <Text className={'text-typography-500'}>
          Sign in to your account or create a now one
        </Text>
      </VStack>

      <GlassCard>
        <VStack space={'xl'}>
          <FormField
            control={control}
            name={'email'}
            label={'Email'}
            placeholder={'name@example.com'}
            options={{ keyboardType: 'email-address' }}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
              },
            }}
          />

          <FormField
            control={control}
            name={'password'}
            label={'Password'}
            placeholder={'Enter your password'}
            options={{ isSecuredField: true }}
            rules={{ required: 'Password is required' }}
          />

          <FormActions
            onSave={handleSubmit(signInWithEmail)}
            isPending={loading}
            isValid={true}
            isDirty={isDirty}
            saveLabel={'Sign in'}
            submitFlex={1}
          />
        </VStack>
      </GlassCard>

      <VStack space={'md'} className={'mt-8'}>
        <HStack space={'xs'} className={'justify-center items-center'}>
          <Text className={'text-typography-500'}>Don't have an account?</Text>
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
    </ScreenContainer>
  );
};

export default Auth;
