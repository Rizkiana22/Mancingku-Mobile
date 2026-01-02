import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 

// ============================================================================
// 1. DATA & CONSTANTS
// ============================================================================
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  background: "#f8f9fa",
  white: "#ffffff",
  textMain: "#333",
  textMuted: "#666",
  cardBorder: "#eee",
};

const MENU_CATEGORIES = [
  { 
    id: "1", 
    title: "Umpan Jitu", 
    subtitle: "Pelet, Cacing", 
    icon: "nutrition" as const, 
    route: "/equipment/umpan",
    isActive: true 
  },
  { 
    id: "2", 
    title: "Alat Pancing", 
    subtitle: "Joran, Reel", 
    icon: "fish" as const, 
    route: "/equipment/alat",
    isActive: true 
  },
  { 
    id: "3", 
    title: "Pakaian", 
    subtitle: "Jersey & Topi", 
    icon: "shirt" as const, 
    route: "/equipment/clothing",
    isActive: false 
  },
  { 
    id: "4", 
    title: "Aksesoris", 
    subtitle: "Tas, Box, Jaring", 
    icon: "briefcase" as const, 
    route: "/equipment/accessories",
    isActive: false 
  },
];

// ============================================================================
// 2. COMPONENTS
// ============================================================================

const CategoryCard = ({ item }: { item: typeof MENU_CATEGORIES[0] }) => {
  const router = useRouter();

  const handlePress = () => {
    if (item.isActive) {
      router.push(item.route as any);
    } else {
      Alert.alert("Info", "Fitur ini segera hadir! 🎣");
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, !item.isActive && styles.disabledCard]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconCircle, { backgroundColor: item.isActive ? COLORS.primary + '15' : '#f0f0f0' }]}>
        <Ionicons 
          name={item.icon} 
          size={28} 
          color={item.isActive ? COLORS.primary : '#999'} 
        />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>

      {item.isActive && (
        <Ionicons 
          name="chevron-forward-circle" 
          size={20} 
          color={COLORS.accent} 
          style={{ alignSelf: 'flex-end' }} 
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
      <View style={styles.header}>
        <Text style={styles.title}>Perlengkapan</Text>
        <Text style={styles.subtitle}>Cari kebutuhan mancingmu</Text>
      </View>

      <FlatList
        data={MENU_CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CategoryCard item={item} />}
        numColumns={2}
        
        // --- BAGIAN INI YANG MEMPERBAIKI LAYOUT ---
        // columnWrapperStyle: Mengatur jarak horizontal antar kolom
        columnWrapperStyle={{ justifyContent: 'space-between' }} 
        // contentContainerStyle: Mengatur padding luar list
        contentContainerStyle={styles.listContainer}
        // ItemSeparatorComponent: Mengatur jarak vertikal (atas-bawah) antar baris
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        // ------------------------------------------
        
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ============================================================================
// 4. STYLES (Fixed Mobile Layout)
// ============================================================================
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: { 
    padding: 20, 
    paddingBottom: 10,
    marginTop: 50
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: COLORS.primary 
  },
  subtitle: { 
    fontSize: 14, 
    color: COLORS.textMuted, 
    marginTop: 2 
  },
  
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },

  // CARD STYLE (Mobile Optimized)
  card: {
    // PENTING: Lebar 48% agar pas 2 kolom dengan spasi di tengah
    width: '48%', 
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    height: 150, // Tinggi fix agar rapi
    justifyContent: 'space-between',
    
    // Shadow standar mobile
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  disabledCard: {
    backgroundColor: '#f9f9f9',
    opacity: 0.7,
  },
  
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitle: { 
    fontSize: 15, 
    fontWeight: "bold", 
    color: COLORS.textMain,
    marginBottom: 2
  },
  cardSubtitle: { 
    fontSize: 12, 
    color: COLORS.textMuted 
  }
});