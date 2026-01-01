import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  ImageSourcePropType 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================
const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#014b69',    // Biru Header
  accent: '#da9723',     // Oranye (Highlight)
  background: '#f8f9fa',
  white: '#ffffff',
  textMain: '#333333',
  textMuted: '#666666',
  cardShadow: '#e0e0e0',
};

// ============================================================================
// 2. SUB-COMPONENTS
// Memecah UI menjadi bagian-bagian kecil
// ============================================================================

/**
 * Komponen Header: Menyapa user
 */
const HeaderSection = () => (
  <View style={styles.headerContainer}>
    <View>
      <Text style={styles.greetingText}>Halo, Angler! 👋</Text>
      <Text style={styles.subtitleText}>Siap memancing hari ini?</Text>
    </View>
    <TouchableOpacity style={styles.profileButton}>
      <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  </View>
);

/**
 * Komponen Banner: Promo atau Info Cuaca
 */
const PromoBanner = () => (
  <View style={styles.bannerContainer}>
    <View style={styles.bannerContent}>
      <Text style={styles.bannerTitle}>Cuaca Cerah! ☀️</Text>
      <Text style={styles.bannerDesc}>Waktu yang tepat untuk berburu ikan mas di Danau Toba.</Text>
      <TouchableOpacity style={styles.bannerButton}>
        <Text style={styles.bannerButtonText}>Cek Spot</Text>
      </TouchableOpacity>
    </View>
    {/* Ilustrasi Dekoratif (Opsional) */}
    <Ionicons name="sunny" size={80} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
  </View>
);

/**
 * Komponen Menu Grid: Navigasi Cepat
 */
interface MenuItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
}

const QuickMenuItem = ({ label, icon, onPress, color = COLORS.primary }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}> 
      {/* '20' menambahkan transparansi hex */}
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.menuText}>{label}</Text>
  </TouchableOpacity>
);

// ============================================================================
// 3. MAIN SCREEN
// ============================================================================
export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Header */}
        <HeaderSection />

        {/* 2. Banner Utama */}
        <PromoBanner />

        {/* 3. Menu Cepat (Quick Actions) */}
        <Text style={styles.sectionTitle}>Menu Cepat</Text>
        <View style={styles.menuGrid}>
          <QuickMenuItem 
            label="Cari Spot" 
            icon="map" 
            onPress={() => router.push('/explore')} 
          />
          <QuickMenuItem 
            label="Tiket Saya" 
            icon="ticket" 
            color="#E91E63"
            onPress={() => router.push('/activity')} 
          />
          <QuickMenuItem 
            label="Sewa Alat" 
            icon="fish" 
            color={COLORS.accent}
            onPress={() => router.push('/menu')} 
          />
          <QuickMenuItem 
            label="Cuaca" 
            icon="partly-sunny" 
            color="#FF9800"
            onPress={() => alert("Fitur Cuaca Coming Soon!")} 
          />
        </View>

        {/* 4. Rekomendasi (Dummy Content) */}
        <Text style={styles.sectionTitle}>Spot Populer 🔥</Text>
        <View style={styles.dummyCard}>
          <Ionicons name="image-outline" size={40} color={COLORS.textMuted} />
          <Text style={{ marginTop: 10, color: COLORS.textMuted }}>Pemancingan Galatama (Iklan)</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// 4. STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  profileButton: {
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  // Banner Styles
  bannerContainer: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    overflow: 'hidden',
    position: 'relative',
    height: 160,
    justifyContent: 'center',
  },
  bannerContent: {
    zIndex: 2,
    maxWidth: '80%',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  bannerDesc: {
    color: '#e0e0e0',
    marginBottom: 15,
    fontSize: 13,
  },
  bannerButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  bannerIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    zIndex: 1,
  },

  // Menu Grid Styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    width: (width - 60) / 2, // 2 kolom dengan spasi
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    // Shadow
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },

  // Dummy Card
  dummyCard: {
    marginHorizontal: 20,
    height: 150,
    backgroundColor: '#eee',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
});