import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { UserService } from "@/service/api"; // Import Service API

// CONSTANTS
const COLORS = {
  primary: "#014b69",
  background: "#ffffffff",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  danger: "#E53935",
};

// REUSABLE MENU ITEM
const ProfileMenuItem = ({
  icon,
  label,
  onPress,
  color = COLORS.primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
  </TouchableOpacity>
);

// Footer
const AppFooter = () => (
  <View style={styles.footerContainer}>
    <Text style={styles.footerText}>Mancingku App v1.0.0</Text>
    <Text style={styles.footerText}>© 2025 Mancingku.</Text>
  </View>
);

// MAIN SCREEN

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoggedIn, user, signOut } = useAuth();

  // State lokal untuk menampung data user terbaru dari database
  const [profileData, setProfileData] = useState<any>(user);
  const [loadingData, setLoadingData] = useState(false);


  // LOAD DATA TERBARU SAAT HALAMAN DIBUKA 
  useFocusEffect(
    useCallback(() => {
      // Jika user belum login, tidak perlu fetch
      if (!isLoggedIn || !user?.id) return;

      const fetchData = async () => {
        // setLoadingData(true); // Optional: Jika ingin loading indicator setiap balik
        try {
          const response = await UserService.getById(user.id);
          if (response.data) {
            // Update state lokal dengan data terbaru dari database
            // Sesuaikan response.data.data atau response.data tergantung backend kamu
            const newData = response.data.data || response.data;
            setProfileData(newData);
          }
        } catch (error) {
          console.error("Gagal refresh profil:", error);
        } finally {
          setLoadingData(false);
        }
      };

      fetchData();
    }, [isLoggedIn, user?.id])
  );

  // Logic Tampilan Nama
  // 1. Coba ambil dari profileData.name (Database)
  // 2. Jika kosong, ambil dari user.email (Context)
  // 3. Fallback "Pengguna"
  const displayName = profileData?.name || user?.email?.split("@")[0] || "Pengguna";
  const displayPhone = profileData?.phone || "-";

  // ============================================================================
  // GUEST (BELUM LOGIN)
  // ============================================================================
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={30} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.guestContainer}>
          <Ionicons
            name="person-circle-outline"
            size={120}
            color={COLORS.textMuted}
          />
          <Text style={styles.guestTitle}>Kamu belum login</Text>
          <Text style={styles.guestSubtitle}>
            Login atau daftar untuk melanjutkan
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.actionText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.primary,
              },
            ]}
            onPress={() => router.push("/auth/register")}
          >
            <Text style={[styles.actionText, { color: COLORS.primary }]}>
              Daftar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // LOGIN (SUDAH LOGIN)
  // ============================================================================
  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* PROFILE HEADER */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color={COLORS.white} />
          </View>

          {/* Menampilkan Nama dari Database */}
          <Text style={styles.userName}>{displayName}</Text>
          
          {/* Menampilkan Email */}
          <Text style={styles.userEmail}>{user?.email}</Text>

           {/* Menampilkan No HP (Optional) */}
           {profileData?.phone ? (
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
               <Ionicons name="call" size={12} color={COLORS.textMuted} style={{marginRight: 4}}/>
               <Text style={styles.userPhone}>{profileData.phone}</Text>
            </View>
          ) : null}
          
        </View>

        {/* AKUN */}
        <Text style={styles.sectionTitle}>Akun</Text>
        <View style={styles.card}>
          <ProfileMenuItem
            icon="person"
            label="Edit Profil"
            onPress={() => router.push("/profil/edit-profile")}
          />
        </View>

        {/* AKTIVITAS */}
        <Text style={styles.sectionTitle}>Aktivitas</Text>
        <View style={styles.card}>
          <ProfileMenuItem
            icon="ticket"
            label="Tiket Saya"
            onPress={() => router.push("/(tabs)/aktivitas")}
          />
        </View>

        {/* CS */}
        <View style={styles.card}>
          <ProfileMenuItem
            icon="chatbubble-ellipses-outline"
            label="Pusat Bantuan"
            onPress={() => router.push("/profil/cs")}
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#014b69",
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMain,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: COLORS.danger,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: "bold",
    marginLeft: 8,
  },
  guestContainer: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 30,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    color: COLORS.textMain,
  },
  guestSubtitle: {
    textAlign: "center",
    marginTop: 8,
    color: COLORS.textMuted,
  },
  actionButton: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  actionText: {
    fontWeight: "bold",
    color: COLORS.white,
  },

  // === STYLE FOOTER ===
  footerContainer: {
    paddingVertical: 30, // Jarak atas bawah biar ga mepet
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#999", // Warna abu-abu pudar biar ga nyolok
    textAlign: "center",
  },
});