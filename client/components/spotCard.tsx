import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ImageSourcePropType 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================
const COLORS = {
  primary: '#014b69',
  accent: '#da9723',
  textMain: '#333333',
  textMuted: '#666666',
  star: '#FFD700',
  white: '#ffffff',
  border: '#f0f0f0',
};

// ============================================================================
// 2. INTERFACES
// ============================================================================
interface SpotCardProps {
  id: number;
  title: string;
  imageSource: ImageSourcePropType; // Tipe data yang benar untuk Gambar RN
  location: string;
  price: number | null;
  rating: number;
}

// ============================================================================
// 3. HELPER COMPONENT (Micro-Component)
// Memisahkan logic loop bintang agar render utama bersih
// ============================================================================
const StarRating = ({ rating }: { rating: number }) => {
  // Array.from lebih bersih daripada for-loop manual di dalam JSX
  return (
    <View style={styles.ratingContainer}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Ionicons 
          key={index} 
          name={index < Math.round(rating) ? "star" : "star-outline"} 
          size={16} 
          color={COLORS.star} 
        />
      ))}
    </View>
  );
};

// ============================================================================
// 4. MAIN COMPONENT
// ============================================================================
export default function SpotCard({ 
  id, 
  title, 
  imageSource, 
  location, 
  price, 
  rating 
}: SpotCardProps) {
  const router = useRouter();

  // Helper untuk navigasi
  const handlePress = () => {
    router.push(`/spot/${id}`);
  };

  // Helper format harga
  const formattedPrice = price 
    ? `Rp ${price.toLocaleString('id-ID')}` 
    : 'Info Menyusul';

  return (
    <View style={styles.card}>
      {/* Gambar Spot */}
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      {/* Konten Card */}
      <View style={styles.content}>
        
        {/* Judul & Rating */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <StarRating rating={rating} />
        </View>

        {/* Lokasi */}
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color={COLORS.textMuted} />
          <Text style={styles.location} numberOfLines={1}>{location}</Text>
        </View>

        {/* Footer: Harga & Tombol */}
        <View style={styles.footer}>
          <Text style={styles.price}>{formattedPrice}</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Pilih</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// ============================================================================
// 5. STYLES
// ============================================================================
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    // Shadow Styling (Android + iOS)
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: '#eee', // Placeholder color saat loading
  },
  content: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textMain,
    flex: 1, // Agar text truncate bekerja jika kepanjangan
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary, // Menggunakan warna biru primary agar elegan
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
});