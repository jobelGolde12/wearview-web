import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Tabs } from 'expo-router';
import { Camera, History, House, Settings2 } from 'lucide-react-native';
import React from 'react';

import { AppTheme } from '@/constants/theme';

export default function RootLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: AppTheme.colors.text,
          tabBarInactiveTintColor: AppTheme.colors.textSecondary,
          tabBarStyle: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 18,
            height: 74,
            borderRadius: 28,
            backgroundColor: 'rgba(10, 16, 32, 0.9)',
            borderTopWidth: 0,
            paddingTop: 8,
            paddingBottom: 8,
            paddingHorizontal: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          sceneStyle: {
            backgroundColor: AppTheme.colors.background,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <House color={color} size={size} strokeWidth={2.1} />,
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: 'Fitting',
            tabBarIcon: ({ color, size }) => <Camera color={color} size={size} strokeWidth={2.1} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Looks',
            tabBarIcon: ({ color, size }) => <History color={color} size={size} strokeWidth={2.1} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size} strokeWidth={2.1} />,
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: AppTheme.colors.background,
    card: AppTheme.colors.surface,
    primary: AppTheme.colors.primary,
    text: AppTheme.colors.text,
    border: 'transparent',
    notification: AppTheme.colors.accent,
  },
};
