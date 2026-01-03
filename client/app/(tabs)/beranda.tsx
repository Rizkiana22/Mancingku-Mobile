import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Mengambil lebar layar HP untuk perhitungan layout responsif (misal: grid menu)
const { width } = Dimensions.get("window");

// ============================================================================
// 1. KONFIGURASI WARNA (THEME)
// ============================================================================
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
};

// ============================================================================
// 2. REUSABLE COMPONENTS (KOMPONEN KECIL)
// Memecah UI menjadi bagian kecil agar Main Screen tidak "kotor" dan panjang.
// ============================================================================

/**
 * Komponen Header: Menampilkan Salam & Ikon Profil
 */
const HeaderSection = ({ onProfilePress }: { onProfilePress: () => void }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.greetingText}>Mancingku</Text>

    <TouchableOpacity onPress={onProfilePress}>
      <Ionicons name="person-circle-outline" size={45} color={COLORS.white} />
    </TouchableOpacity>
  </View>
);

/**
 * Komponen Banner: Info Cuaca / Promo
 */
const PromoBanner = ({ onPress }: { onPress: () => void }) => (
  <View style={styles.bannerContainer}>
    <View style={styles.bannerContent}>
      <Text style={styles.bannerTitle}>Cuaca Cerah ☀️</Text>
      <Text style={styles.bannerDesc}>
        Waktu terbaik untuk booking tempat pemancingan kesayangan anda
      </Text>

      <TouchableOpacity style={styles.bannerButton} onPress={onPress}>
        <Text style={styles.bannerButtonText}>Lihat</Text>
      </TouchableOpacity>
    </View>

    {/* Ikon matahari sebagai dekorasi background (dibuat transparan) */}
    <Ionicons
      name="sunny"
      size={90}
      color="rgba(255,255,255,0.2)"
      style={styles.bannerIcon}
    />
  </View>
);

/**
 * Komponen Menu Item: Kotak menu navigasi cepat
 * Mendukung icon dari 'Ionicons' maupun 'MaterialCommunityIcons'
 */
const QuickMenuItem = ({
  label,
  icon,
  iconType = "ion", // Default pakai Ionicons
  onPress,
  color = COLORS.primary,
}: {
  label: string;
  icon: string;
  iconType?: "ion" | "material";
  onPress: () => void;
  color?: string;
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    {/* Lingkaran Background Icon */}
    <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
      {/* Logic pemilihan library icon */}
      {iconType === "material" ? (
        <MaterialCommunityIcons
          name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={28}
          color={color}
        />
      ) : (
        <Ionicons name={icon as any} size={28} color={color} />
      )}
    </View>
    <Text style={styles.menuText}>{label}</Text>
  </TouchableOpacity>
);

// ============================================================================
// 3. MAIN SCREEN (HALAMAN UTAMA)
// ============================================================================
export default function HomeScreen() {
  const router = useRouter();

  return (
    // ImageBackground: Gambar latar belakang memenuhi layar
    <ImageBackground
      source={require("@/assets/images/WhatsApp_Image_2026-01-02_at_19.36.28.webp")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* OVERLAY: Lapisan hitam transparan di atas gambar.
        Fungsinya: Agar teks putih di atasnya tetap terbaca jelas meskipun gambar background terang/ramai.
      */}
      <View style={styles.overlay} />

      {/* SafeAreaView: Mencegah konten tertutup Poni HP (Notch) & Status Bar */}
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* BAGIAN 1: HEADER */}
          <HeaderSection
            onProfilePress={() => router.push("/(tabs)/profile")}
          />

          {/* BAGIAN 2: BANNER */}
          <PromoBanner onPress={() => router.push("/(tabs)/spot")} />

          {/* BAGIAN 3: MENU CEPAT (GRID) */}
          <View style={styles.menuCard}>
            <View style={styles.menuRow}>
              {/* Menu 1: Cari Spot */}
              <QuickMenuItem
                label="Cari Spot"
                icon="map"
                onPress={() => router.push("/(tabs)/spot")}
              />

              {/* Menu 2: Aktivitas */}
              <QuickMenuItem
                label="Aktivitas"
                icon="ticket"
                color="#E91E63" // Warna Pink
                onPress={() => router.push("/(tabs)/aktivitas")}
              />

              {/* Menu 3: Perlengkapan (Pakai Material Icon 'hook') */}
              <QuickMenuItem
                label="Perlengkapan"
                icon="hook"
                iconType="material"
                color={COLORS.accent} // Warna Oranye
                onPress={() => router.push("/(tabs)/perlengkapan")}
              />
            </View>
          </View>

          {/* BAGIAN 4: KONTEN TAMBAHAN (DUMMY) */}
          <Text style={styles.sectionTitle}>Spot Paling Populer</Text>
          <View style={styles.dummyCard}>
            <Ionicons name="image-outline" size={40} color={COLORS.textMuted} />
            <Text style={{ marginTop: 10, color: COLORS.textMuted }}>
              Rekomendasi Spot Minggu Ini
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ============================================================================
// 4. STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Overlay agar teks background image terbaca
  overlay: {
    ...StyleSheet.absoluteFillObject, // Shortcut untuk posisi absolute full screen
    backgroundColor: "rgba(0,0,0,0.35)", // Hitam transparansi 35%
  },

  // --- Header Style ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 50, // Jarak ke elemen bawah
    marginTop: 15,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
  },

  // --- Banner Style ---
  bannerContainer: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 5, // Sedikit overlap dengan menu card nanti bisa diatur
    overflow: "hidden", // Agar hiasan icon tidak keluar dari kotak
    height: 160,
    justifyContent: "center",
  },
  bannerContent: {
    zIndex: 2, // Pastikan teks ada di atas ikon hiasan
    maxWidth: "80%",
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  bannerDesc: {
    color: "#eee",
    marginVertical: 8,
    fontSize: 13,
  },
  bannerButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 12,
  },
  bannerIcon: {
    position: "absolute",
    right: -10,
    bottom: -10,
    // Icon ini hanya sebagai hiasan background
  },

  // --- Menu Style ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  menuCard: {
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.95)", // Putih sedikit transparan
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 50,
    elevation: 3, // Shadow Android
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItem: {
    // Membagi lebar layar menjadi 3 kolom (dikurangi padding margin)
    width: (width - 80) / 3,
    alignItems: "center",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25, // Membuat lingkaran sempurna
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // --- Dummy Card Style ---
  dummyCard: {
    marginHorizontal: 20,
    height: 140,
    backgroundColor: "#eee",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed", // Garis putus-putus
  },
});
