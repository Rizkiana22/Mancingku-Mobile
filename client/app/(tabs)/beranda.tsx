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

const { width } = Dimensions.get("window");

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
};

// ============================================================================
// HEADER
// ============================================================================
const HeaderSection = ({ onProfilePress }: { onProfilePress: () => void }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.greetingText}>Mancingku</Text>

    <TouchableOpacity onPress={onProfilePress}>
      <Ionicons name="person-circle-outline" size={45} color={COLORS.white} />
    </TouchableOpacity>
  </View>
);

// ============================================================================
// BANNER
// ============================================================================
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

    <Ionicons
      name="sunny"
      size={90}
      color="rgba(255,255,255,0.2)"
      style={styles.bannerIcon}
    />
  </View>
);

// ============================================================================
// QUICK MENU
// ============================================================================
const QuickMenuItem = ({
  label,
  icon,
  iconType = "ion",
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
    <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
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
// State & Effect
// ============================================================================

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("@/assets/images/WhatsApp_Image_2026-01-02_at_19.36.28.webp")}
      style={styles.container}
      resizeMode="cover"
    >
      {/* overlay biar teks kebaca */}
      <View style={styles.overlay} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* HEADER */}
          <HeaderSection onProfilePress={() => router.push("/profile")} />

          {/* BANNER */}
          <PromoBanner onPress={() => router.push("/(tabs)/spot")} />

          {/* MENU CEPAT */}

          <View style={styles.menuCard}>
            <View style={styles.menuRow}>
              <QuickMenuItem
                label="Cari Spot"
                icon="map"
                onPress={() => router.push("/(tabs)/spot")}
              />
              <QuickMenuItem
                label="Aktivitas"
                icon="ticket"
                color="#E91E63"
                onPress={() => router.push("/(tabs)/aktivitas")}
              />
              <QuickMenuItem
                label="Perlengkapan"
                icon="hook"
                iconType="material"
                color={COLORS.accent}
                onPress={() => router.push("/(tabs)/perlengkapan")}
              />
            </View>
          </View>

          {/* DUMMY */}
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
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 50,
    marginTop: 15,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
  },

  // Banner
  bannerContainer: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 5,
    overflow: "hidden",
    height: 160,
    justifyContent: "center",
  },
  bannerContent: {
    zIndex: 2,
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
  },

  // Menu
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
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 50,
    elevation: 3,
  },

  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuItem: {
    width: (width - 80) / 3,
    alignItems: "center",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Dummy
  dummyCard: {
    marginHorizontal: 20,
    height: 140,
    backgroundColor: "#eee",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
});
