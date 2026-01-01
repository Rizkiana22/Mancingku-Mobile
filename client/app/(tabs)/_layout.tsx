import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// Mengatur warna di satu tempat agar konsisten dengan halaman lain
// ============================================================================
const COLORS = {
  primary: "#014b69",    // Biru Header
  accent: "#da9723",     // Oranye Mancingku (Aktif)
  inactive: "#888888",   // Abu-abu (Tidak Aktif)
  headerText: "#ffffff", // Putih
};

// ============================================================================
// 2. HELPER COMPONENTS
// Komponen kecil untuk merender Icon agar kode utama tidak berulang (DRY)
// ============================================================================
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TabBarIcon = ({ name, color }: { name: IconName; color: string }) => (
  <Ionicons name={name} size={24} color={color} style={{ marginBottom: -3 }} />
);

// ============================================================================
// 3. MAIN LAYOUT COMPONENT
// ============================================================================
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Global Tab Styles
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60, // Sedikit lebih tinggi agar nyaman disentuh
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        // Global Header Styles
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.headerText,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      {/* 2. EXPLORE */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Cari Spot",
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />

      {/* 3. PERLENGKAPAN (MENU) */}
      <Tabs.Screen
        name="menu"
        options={{
          title: "Perlengkapan",
          tabBarIcon: ({ color }) => <TabBarIcon name="fish" color={color} />,
        }}
      />

      {/* 4. ACTIVITY */}
      <Tabs.Screen
        name="activity"
        options={{
          title: "Aktivitas",
          tabBarIcon: ({ color }) => <TabBarIcon name="ticket" color={color} />,
        }}
      />

      {/* 5. PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Akun Saya",
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}