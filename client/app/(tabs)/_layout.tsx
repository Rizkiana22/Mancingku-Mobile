import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// ============================================================================
// 1. KONFIGURASI WARNA (THEME CONFIG)
// Didefinisikan di luar komponen agar tidak dirender ulang setiap siklus.
// Memudahkan penggantian tema aplikasi di masa depan (Global Styling).
// ============================================================================
const COLORS = {
  primary: "#014b69", // Biru Utama
  accent: "#da9723", // Oranye (Warna Aktif/Highlight)
  inactive: "#c0c0c0ff", // Perak (Warna Tidak Aktif)
  headerText: "#ffff", // Putih (Teks Header)
  tabBarBg: "#000c2cff", // Biru Gelap (Background Tab Bar)
};

// ============================================================================
// 2. HELPER COMPONENT (DRY PRINCIPLE)
// Komponen kecil untuk merender ikon Ionicons.
// Tujuannya agar kita tidak menulis <Ionicons ... /> berulang-ulang di bawah.
// ============================================================================
type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TabBarIcon = ({ name, color }: { name: IconName; color: string }) => (
  <Ionicons name={name} size={24} color={color} style={{ marginBottom: -3 }} />
);

// ============================================================================
// 3. MAIN LAYOUT
// ============================================================================
export default function TabLayout() {
  return (
    <Tabs
      // screenOptions: Pengaturan default yang berlaku untuk SEMUA tab di bawah ini.
      screenOptions={{
        // --- Pewarnaan ---
        tabBarActiveTintColor: COLORS.accent, // Warna icon/text saat tab DIPILIH
        tabBarInactiveTintColor: COLORS.inactive, // Warna icon/text saat tab TIDAK dipilih

        // --- Styling Kotak Tab Bar (Bawah) ---
        tabBarStyle: {
          paddingBottom: 5, // Memberi jarak sedikit dari bawah layar
          height: 60, // Tinggi tab bar (sedikit lebih besar agar mudah disentuh)
          backgroundColor: COLORS.tabBarBg, // Background tab bar
          borderTopWidth: 0, // Menghilangkan garis batas atas (opsional, untuk tampilan lebih clean)
        },

        // --- Styling Teks Label Tab ---
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },

        // --- Styling Header (Atas) ---
        // Catatan: Ini hanya muncul jika headerShown: true pada tiap screen
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.headerText,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {/* PENTING: Properti 'name' harus sesuai dengan nama file di folder app/(tabs)/
         Contoh: name="beranda" -> akan me-load file app/(tabs)/beranda.tsx
      */}

      {/* 1. BERANDA (Home) */}
      <Tabs.Screen
        name="beranda"
        options={{
          title: "Beranda",
          headerShown: false, // Header disembunyikan karena biasanya Halaman Depan punya desain custom sendiri
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      {/* 2. SPOT (Peta/Lokasi) */}
      <Tabs.Screen
        name="spot"
        options={{
          title: "Spot",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />

      {/* 3. PERLENGKAPAN (Equipment) */}
      <Tabs.Screen
        name="perlengkapan"
        options={{
          title: "Alat",
          headerShown: false,
          // Menggunakan 'MaterialCommunityIcons' khusus di sini karena icon 'hook' (kail) lebih bagus di set ini
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="hook" size={30} color={color} />
          ),
        }}
      />

      {/* 4. AKTIVITAS (Tiket/History) */}
      <Tabs.Screen
        name="aktivitas"
        options={{
          title: "Aktivitas",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="ticket" color={color} />,
        }}
      />

      {/* 5. PROFILE (Akun Saya) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Akun",
          headerShown: false, // Header default disembunyikan, pakai custom header di profile.tsx
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,

          // ⚠️ PERHATIAN: 'href: null'
          // Baris ini akan MENYEMBUNYIKAN tombol Profile dari Tab Bar bawah.
          // Jika Anda ingin tombol Profile MUNCUL, hapus baris 'href: null' ini.
          // Jika Anda memang sengaja menyembunyikannya (misal: diakses dari tombol lain), biarkan saja.
          href: null,
        }}
      />
    </Tabs>
  );
}
