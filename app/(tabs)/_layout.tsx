import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

interface TabIconProps {
  focused: boolean;
  icon: any;
  iconFocused: any;
  title: string;
}

const TabIcon = ({ focused, icon, iconFocused, title }: TabIconProps) => {
  if (focused) {
    return (
      <View className="flex flex-row justify-center min-w-[90px] items-center overflow-hidden">
        <Ionicons name={iconFocused} className="text-2xl/6" size={20} />
        {title !== '' && (
          <Text className="text-secondary text-base font-semibold ml-2">
            {title}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="h-full items-center justify-center">
      <Ionicons name={icon} className="text-2xl/6" size={20} />
    </View>
  );
};

export default function TabLayout() {
  const tabItems = [
    {
      name: 'index',
      icon: 'home-outline',
      iconFocused: 'home',
      title: 'Home',
    },
    {
      name: 'boxes',
      icon: 'cube-outline',
      iconFocused: 'cube',
      title: 'Boxes',
    },
    {
      name: 'locations',
      icon: 'location-outline',
      iconFocused: 'location',
      title: 'Locations',
    },
    {
      name: 'profile',
      icon: 'person-outline',
      iconFocused: 'person',
      title: 'Profile',
    },
  ];
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#d3d3d3',
          marginHorizontal: 10,
          marginBottom: 10,
          height: 40,
          position: 'absolute',
          paddingBottom: 0,
          overflow: 'hidden',
          borderRadius: 5,
          borderWidth: 1,
        },
      }}
    >
      {tabItems.map((tabItem, index) => (
        <Tabs.Screen
          name={tabItem.name}
          key={index}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <TabIcon
                icon={tabItem.icon}
                iconFocused={tabItem.iconFocused}
                focused={focused}
                title={tabItem.title}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
