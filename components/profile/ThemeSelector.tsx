import React, { memo } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  Computer,
  LucideIcon,
  Moon,
  Smartphone,
  Sun,
} from 'lucide-react-native';
import { Theme } from '@/hooks/useInitialTheme';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const THEME_OPTIONS: Array<{ theme: Theme; icon: LucideIcon }> = [
  { theme: 'light', icon: Sun },
  { theme: 'dark', icon: Moon },
  { theme: 'system', icon: Platform.OS === 'web' ? Computer : Smartphone },
];

export const ThemeSelector = memo(
  ({ currentTheme, onThemeChange }: ThemeSelectorProps) => {
    return (
      <View
        className={
          'bg-background-50 p-1.5 rounded-xl flex-row border border-outline-100'
        }
      >
        {THEME_OPTIONS.map(({ theme, icon }) => {
          const isActive = currentTheme === theme;
          return (
            <Pressable
              key={theme}
              onPress={() => onThemeChange(theme)}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
                isActive ? 'bg-background-0 shadow-sm ' : 'bg-transparent'
              }`}
            >
              <Icon
                as={icon}
                size={'xs'}
                className={`${isActive ? 'text-primary-500' : 'text-typography-400'}`}
              />
              <Text
                className={`ml-2 text-xs font-bold ${isActive ? 'text-typography-900' : 'text-typography-400'}`}
              >
                {theme.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }
);

ThemeSelector.displayName = 'ThemeSelector';
