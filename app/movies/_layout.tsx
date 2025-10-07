import * as NavigationBar from 'expo-navigation-bar';
import {Stack} from "expo-router";
import React, {useEffect} from 'react';
import {Platform, StatusBar} from "react-native";
import {AuthProvider} from '@/lib/auth';
import '../global.css';

const Layout = () => {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="(tabs)"/>
      <Stack.Screen name="movies/[id]"/>
      <Stack.Screen
        name="box/add"
        options={{
          title: 'Create a box',
          headerShown: true,
          headerBackVisible: false,
          headerLeft: () => null,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          }
        }}
      />
      <Stack.Screen name="(auth)"/>
    </Stack>
  )
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden').then();
    }
  }, []);

  return (
    <AuthProvider>
      <StatusBar hidden={true}/>
      <Layout/>
    </AuthProvider>
  );
}
