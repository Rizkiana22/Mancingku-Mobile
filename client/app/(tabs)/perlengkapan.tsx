import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// ============================================================================
// 1. DATA & CONSTANTS
// ============================================================================
// Palet warna yang konsisten dengan halaman lain
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  background: "#f8f9fa",
  white: "#ffffff",
  textMain: "#333",
  textMuted: "#666",
  cardBorder: "#eee",
};

/**
 * Data Menu Kategori.
 * 'isActive': Flag untuk menentukan apakah tombol bisa diklik atau muncul alert "Coming Soon".
 * 'route': Alamat navigasi file (sesuai struktur folder app/).
 */
const MENU_CATEGORIES = [
  {
    id: "1",
    title: "Umpan",
    subtitle: "Pelet, Cacing",
    icon: "nutrition" as const, // 'as const' agar TypeScript tahu ini nama icon valid
    route: "/equipment/umpan",
    isActive: true,
  },
  {
    id: "2",
    title: "Alat Pancing",
    subtitle: "Joran, Reel",
    icon: "fish" as const,
    route: "/equipment/alat",
    isActive: true,
  },
];

// ============================================================================
// 2. COMPONENTS (Reusable UI)
// ============================================================================

/**
 * Komponen Kartu Kategori (Kotak-kotak Grid)
 */
const CategoryCard = ({ item }: { item: (typeof MENU_CATEGORIES)[0] }) => {
  const router = useRouter();

  // Handler Klik: Cek status aktif dulu
  const handlePress = () => {
    if (item.isActive) {
      // Navigasi ke halaman tujuan
      router.push(item.route as any);
    } else {
      // Tampilkan pesan jika fitur belum siap (UX Improvement)
      Alert.alert("Info", "Fitur ini segera hadir! 🎣");
    }
  };

  return (
    <TouchableOpacity
      // Jika tidak aktif, beri style 'disabledCard' (sedikit transparan)
      style={[styles.card, !item.isActive && styles.disabledCard]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Icon Circle: Warna background menyesuaikan status aktif */}
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: item.isActive ? COLORS.primary + "15" : "#f0f0f0" },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={28}
          color={item.isActive ? COLORS.primary : "#999"}
        />
      </View>

      {/* Teks Judul & Subjudul */}
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>

      {/* Indikator Panah: Hanya muncul jika menu aktif */}
      {item.isActive && (
        <Ionicons
          name="chevron-forward-circle"
          size={20}
          color={COLORS.accent}
          style={{ alignSelf: "flex-end" }}
        />
      )}
    </TouchableOpacity>
  );
};

// ============================================================================
// 3. MAIN SCREEN
// ============================================================================
export default function MenuScreen() {
  return (
    <View style={styles.container}>
      {/* Header Halaman */}
      <View style={styles.header}>
        <Text style={styles.title}>Perlengkapan</Text>
        <Text style={styles.subtitle}>Cari kebutuhan mancingmu</Text>
      </View>

      {/* Grid List */}
      <FlatList
        data={MENU_CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CategoryCard item={item} />}
        
        // --- KONFIGURASI GRID 2 KOLOM ---
        numColumns={2} 
        
        // columnWrapperStyle: Memberi jarak horizontal (kiri-kanan) antar kolom
        // 'space-between' akan mendorong item ke ujung kiri dan kanan
        columnWrapperStyle={{ justifyContent: "space-between" }}
        
        // contentContainerStyle: Memberi padding di sekeliling list agar tidak mepet layar
        contentContainerStyle={styles.listContainer}
        
        // ItemSeparatorComponent: Memberi jarak vertikal (atas-bawah) antar baris
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ============================================================================
// 4. STYLES (Responsive Mobile Layout)
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    marginTop: 50, // Memberi jarak dari status bar (jika tidak pakai SafeAreaView)
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  listContainer: {
    padding: 20,
    paddingTop: 10,
  },

  // --- CARD STYLE (KUNCI LAYOUT GRID) ---
  card: {
    // LOGIKA GRID:
    // Lebar 48% x 2 kartu = 96%.
    // Sisa 4% digunakan sebagai spasi tengah (berkat justifyContent: 'space-between')
    // Ini memastikan layout rapi di semua ukuran layar HP.
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    height: 150, // Tinggi fix agar semua kartu seragam
    justifyContent: "space-between",

    // Efek Bayangan (Shadow)
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    elevation: 2, // Shadow untuk Android
    shadowColor: "#000", // Shadow untuk iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  
  // Style tambahan untuk menu yang belum aktif (abu-abu/transparan)
  disabledCard: {
    backgroundColor: "#f9f9f9",
    opacity: 0.7,
  },

  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});