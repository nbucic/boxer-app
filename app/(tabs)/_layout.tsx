import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Icon } from '@/components/ui/icon';
import {
  BoxesIcon,
  HouseIcon,
  LucideIcon,
  MapPlusIcon,
  UserPenIcon,
} from 'lucide-react-native';
import clsx from 'clsx';

interface iconProps {
  name: string;
  icon: LucideIcon;
}

const screens: Array<iconProps> = [
  {
    name: 'index',
    icon: HouseIcon,
  },
  {
    name: 'boxes',
    icon: BoxesIcon,
  },
  {
    name: 'locations',
    icon: MapPlusIcon,
  },
  {
    name: 'profile',
    icon: UserPenIcon,
  },
];

const CustomTabBarIcon = React.memo(
  ({ icon, color }: { icon: LucideIcon; color: string }) => {
    return <Icon as={icon} className={clsx(color, 'h-8 w-full')} size={'xl'} />;
  }
);

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={
        'absolute bottom-5 left-2 right-2 overflow-hidden rounded-full'
      }
      style={{
        paddingBottom: insets.bottom,
      }}
    >
      <BlurView
        intensity={95}
        tint={'default'}
        className={'absolute inset-0 bg-background-0/80 rounded'}
        experimentalBlurMethod={'dimezisBlurView'}
      />

      <View
        className={'absolute top-0 left-5 right-5 h-[1px] bg-outline-100/50'}
      />

      <View className={'flex-row items-center justify-around w-full h-16'}>
        {state.routes.map((route, index) => {
          const screenConfig = screens.find((s) => s.name === route.name);
          if (!screenConfig) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            if (Platform.OS !== 'web') {
              void Haptics.selectionAsync();
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className={
                'flex-1 items-center justify-center h-full active:opacity-70'
              }
            >
              <CustomTabBarIcon
                color={isFocused ? 'text-primary-500' : 'text-typography-950'}
                icon={screenConfig.icon}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => <View className={'bg-transparent'} />,
      }}
    >
      {screens.map(({ name }) => (
        <Tabs.Screen key={name} name={name} options={{ title: name }} />
      ))}
    </Tabs>
  );
}
