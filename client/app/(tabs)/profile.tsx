import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ============================================================================
// CONSTANTS
// ============================================================================
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  background: "#f8f9fa",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  danger: "#E53935",
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================
const ProfileHeader = () => (
  <View style={styles.profileHeader}>
    <Image
      source={{ uri: "https://i.pravatar.cc/150?img=12" }}
      style={styles.avatar}
    />
    <Text style={styles.userName}>Angler Pro</Text>
    <Text style={styles.userEmail}>angler@mail.com</Text>
  </View>
);

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

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔝 TOP BAR */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Profile</Text>

        {/* Spacer supaya title tetap center */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader />

        {/* Akun */}
        <Text style={styles.sectionTitle}>Akun</Text>
        <View style={styles.card}>
          <ProfileMenuItem
            icon="person"
            label="Edit Profil"
            onPress={() => alert("Edit Profil")}
          />
          <ProfileMenuItem
            icon="lock-closed"
            label="Ubah Password"
            onPress={() => alert("Ubah Password")}
          />
        </View>

        {/* Aktivitas */}
        <Text style={styles.sectionTitle}>Aktivitas</Text>
        <View style={styles.card}>
          <ProfileMenuItem
            icon="ticket"
            label="Tiket Saya"
            onPress={() => router.push("/(tabs)/aktivitas")}
          />
        </View>

        {/* Aplikasi */}
        <Text style={styles.sectionTitle}>Aplikasi</Text>
        <View style={styles.card}>
          <ProfileMenuItem
            icon="help-circle"
            label="Bantuan"
            onPress={() => alert("Bantuan")}
          />
          <ProfileMenuItem
            icon="information-circle"
            label="Tentang Aplikasi"
            onPress={() => alert("Tentang")}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
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
    backgroundColor: COLORS.background,
  },

  // 🔝 Top Bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  topTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
  },

  // Profile Header
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.white,
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMain,
  },
  userEmail: {
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
});
