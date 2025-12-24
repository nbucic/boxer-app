import { Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import React from 'react';
import clsx from 'clsx';

type Props = {
  name: string;
  clickable?: string | null;
  className?: string;
};

export const NameItem = ({ name, clickable = null, className }: Props) => {
  const IconAndTextElements = () => (
    <Text
      className={
        'text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap overflow-ellipsis overflow-hidden'
      }
      numberOfLines={1}
      ellipsizeMode={'tail'}
    >
      {name}
    </Text>
  );

  return clickable ? (
    <TouchableOpacity
      onPress={() => router.navigate(clickable as any)}
      className={clsx(className)}
    >
      <IconAndTextElements />
    </TouchableOpacity>
  ) : (
    <IconAndTextElements />
  );
};
