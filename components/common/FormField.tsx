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
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import clsx from 'clsx';
import { useState } from 'react';

interface RenderFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  rules?: object;
  isTextArea?: boolean;
  isDisabled?: boolean;
  isPassword?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
}

export const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rules,
  isTextArea = false,
  isDisabled = false,
  isPassword = false,
  keyboardType = 'default',
}: RenderFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <FormControl isInvalid={!!error} isDisabled={isDisabled}>
          <VStack space={'xs'}>
            <FormControlLabel>
              <FormControlLabelText
                className={'text-typography-600 font-medium ml-1 font-sans'}
              >
                {label}
              </FormControlLabelText>
            </FormControlLabel>

            {isTextArea ? (
              <Textarea
                size="lg"
                className="bg-background-0 border-outline-100"
              >
                <TextareaInput
                  placeholder={placeholder}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="text-typography-900"
                />
              </Textarea>
            ) : (
              <Input
                variant={'outline'}
                size={'lg'}
                className={clsx(
                  'border-outline-100',
                  isDisabled ? 'bg-background-50' : 'bg-background-0'
                )}
              >
                <InputField
                  placeholder={placeholder}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={'text-typography-900'}
                  type={isPassword && !showPassword ? 'password' : 'text'}
                  autoCapitalize={'none'}
                  keyboardType={keyboardType}
                  readOnly={isDisabled}
                />
                {isPassword && (
                  <InputSlot
                    className={'pr-3'}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
                )}
              </Input>
            )}
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
