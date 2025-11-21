import { useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'system';
export const THEME_STORAGE_KEY = '@appTheme';

export function useInitialTheme() {
  const { setColorScheme } = useColorScheme();
  const [theme, setTheme] = useState<Theme>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the theme from storage on the initial mount
  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = (await AsyncStorage.getItem(
        THEME_STORAGE_KEY
      )) as Theme | null;

      if (storedTheme) {
        setTheme(storedTheme);
        setColorScheme(storedTheme);
        setIsLoaded(true);
      }
    };

    void loadTheme();
  }, [setColorScheme]);

  return { theme, setTheme, isLoaded };
}
