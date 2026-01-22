import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { VStack } from '@/components/ui/vstack';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import Avatar from '@/components/Avatar';
import { ImagePickerAsset } from 'expo-image-picker';
import { Text } from 'react-native';
import { LocationSearchSelect } from '@/components/form/LocationSearchSelect';

interface BaseFieldOptions {
  isDisabled?: boolean;
}

interface TextFieldOptions extends BaseFieldOptions {
  isSecuredField?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
}

interface ImageFieldOptions extends BaseFieldOptions {
  // Now explicitly required for the image type
  handleImageChange: (image: ImagePickerAsset) => void;
  type?: 'avatar' | 'box';
}

type RenderFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  rules?: object;
  fieldRef?: React.Ref<any>;
} & (
  | { type?: 'text'; options?: TextFieldOptions }
  | { type: 'text-area'; options?: BaseFieldOptions }
  | { type: 'image'; options: ImageFieldOptions }
  | { type: 'location-dropdown'; options: BaseFieldOptions }
  | { type: 'box-dropdown'; options: BaseFieldOptions }
);

export const FormField = <T extends FieldValues>({
  control,
  name,
  type = 'text',
  label,
  placeholder,
  rules,
  fieldRef,
  options: PassedOptions = {},
}: RenderFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const RenderFieldContent = ({ onBlur, onChange, value, options }: any) => {
    switch (type) {
      case 'text': {
        return (
          <Input
            variant={'outline'}
            size={'lg'}
            className={clsx('border-outline-100')}
          >
            <InputField
              placeholder={placeholder}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className={'text-typography-900'}
              type={
                options.isSecuredField && !showPassword ? 'password' : 'text'
              }
              autoCapitalize={'none'}
              keyboardType={options.keyboardType as any}
              ref={fieldRef}
            />
            {options.isSecuredField && (
              <InputSlot
                className={'pr-3'}
                onPress={() => setShowPassword(!showPassword)}
              >
                <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            )}
          </Input>
        );
      }
      case 'text-area': {
        return (
          <Textarea size="lg" className="bg-background-0 border-outline-100">
            <TextareaInput
              placeholder={placeholder}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="text-typography-900"
              ref={fieldRef}
            />
          </Textarea>
        );
      }
      case 'image': {
        return (
          <>
            <Avatar
              avatarUrl={value}
              onImageChange={options.handleImageChange}
              type={options.type}
            />
            {label && (
              <VStack className={'items-center'}>
                <Text className={'text-sm font-semibold text-typography-700'}>
                  {label}
                </Text>
                <Text className={'text-xs text-typography-500'}>
                  Tap to change the image
                </Text>
              </VStack>
            )}
          </>
        );
      }
      case 'location-dropdown': {
        return (
          <LocationSearchSelect
            onSelect={onChange}
            disabled={options.isDisabled}
            value={value}
            ref={fieldRef}
          />
        );
      }
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <FormControl isInvalid={!!error}>
          <VStack space={'xs'}>
            <FormControlLabel>
              <FormControlLabelText
                className={'text-typography-600 font-medium ml-1 font-sans'}
              >
                {label}
              </FormControlLabelText>
            </FormControlLabel>
            <RenderFieldContent
              options={{ PassedOptions }}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
            />
            {error && (
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{error.message}</FormControlErrorText>
              </FormControlError>
            )}
          </VStack>
        </FormControl>
      )}
    />
  );
};
