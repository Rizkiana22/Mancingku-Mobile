import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons'; // Library Icon bawaan Expo

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Warna Aktif (Oranye Mancingku)
        tabBarActiveTintColor: '#da9723', 
        // Warna Tidak Aktif (Abu-abu)
        tabBarInactiveTintColor: '#888',
        // Style Header
        headerStyle: { backgroundColor: '#014b69' },
        headerTintColor: '#fff',
      }}>

      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />

      {/* 2. EXPLORE (Cari Spot) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Cari Spot',
          tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
        }}
      />

      {/* 3. MENU PERLENGKAPAN (Pengganti Gears) */}
      {/* Pastikan file 'app/(tabs)/menu.tsx' SUDAH ADA */}
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Perlengkapan',
          tabBarIcon: ({ color }) => <Ionicons name="fish" size={24} color={color} />,
        }}
      />

      {/* 4. PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Akun Saya',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}