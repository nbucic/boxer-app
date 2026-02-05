import { Platform, Text, TouchableOpacity } from 'react-native';
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
        'text-lg font-bold text-typography-900 leading-tight overflow-ellipsis overflow-hidden whitespace-nowrap'
      }
      {...(Platform.OS === 'android' ? { numberOfLines: 1 } : undefined)}
      {...(Platform.OS === 'android' ? { ellipsizeMode: 'tail' } : undefined)}
    >
      {name}
    </Text>
  );

  return clickable ? (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => router.navigate(clickable as any)}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      className={clsx(className)}
    >
      <IconAndTextElements />
    </TouchableOpacity>
  ) : (
    <IconAndTextElements />
  );
};
