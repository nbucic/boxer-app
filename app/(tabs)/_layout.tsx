import tw from 'twrnc';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

const TabIcon = ({
  focused,
  icon,
  iconFocused,
  color,
}: {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  color: string;
}) => {
  const iconName = focused ? iconFocused : icon;

  return <Ionicons name={iconName} style={{ color }} size={24} />;
};
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: tw.style(
          'bg-white dark:bg-gray-900',
          'h-10 absolute left-0 right-0 bottom-0 overflow-hidden border-t border-gray-100 dark:border-gray-800',
          'shadow-lg',
          'pb-safe'
        ),
        tabBarActiveTintColor: tw.color('blue-600'),
        tabBarInactiveTintColor: tw.color('gray-500'),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={'home-outline'}
              iconFocused={'home'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={'boxes'}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={'cube-outline'}
              iconFocused={'cube'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="locations"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={'location-outline'}
              iconFocused={'location'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={'person-outline'}
              iconFocused={'person'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
