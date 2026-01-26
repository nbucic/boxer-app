import tw from 'twrnc';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type iconsType = {
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const TabIcon = React.memo(
  ({
    focused,
    icon,
    iconFocused,
    color,
  }: {
    focused: boolean;
    color: string;
  } & iconsType) => {
    const iconName = focused ? iconFocused : icon;

    return <Ionicons name={iconName} style={{ color }} size={24} />;
  }
);

const screens: Array<{ name: string } & iconsType> = [
  {
    name: 'index',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  {
    name: 'boxes',
    icon: 'cube-outline',
    iconFocused: 'cube',
  },
  {
    name: 'locations',
    icon: 'location-outline',
    iconFocused: 'location',
  },
  {
    name: 'profile',
    icon: 'person-outline',
    iconFocused: 'person',
  },
];

const hapticTabListener = {
  tabPress: () => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  },
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: tw.style(
          'bg-background-0',
          'h-11 border-t border-outline-100 shadow-sm'
        ),
        tabBarActiveTintColor: tw.color('primary-500'),
        tabBarInactiveTintColor: tw.color('typography-400'),
      }}
    >
      {screens.map(({ name, icon, iconFocused }) => (
        <Tabs.Screen
          name={name}
          listeners={hapticTabListener}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icon}
                iconFocused={iconFocused}
                focused={focused}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

TabIcon.displayName = 'TabIcon';
