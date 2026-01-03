import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ============================================================================
// 1. TYPE DEFINITION (INTERFACE)
// ============================================================================
// Di Vue, ini mirip bagian `props: { ... }` dengan validasi tipe data.
// TypeScript memastikan parent component mengirim data yang BENAR.
interface SpotCardProps {
  id: number;
  title: string;
  imageSource?: ImageSourcePropType; // Tanda '?' artinya props ini Opsional
  location: string;
  rating: number;
  price: number | null; // Bisa null jika harga belum ditentukan
  onPress?: () => void; // Fungsi callback ketika kartu diklik (mirip @click di Vue)
}

export default function SpotCard({
  title,
  imageSource,
  location,
  rating,
  price,
  onPress,
}: SpotCardProps) {
  
  // ==========================================================================
  // 2. LOGIC BINTANG (useMemo)
  // ==========================================================================
  // `useMemo` adalah hook React yang fungsinya SAMA PERSIS dengan "Computed Property" di Vue.
  // Dia hanya akan menghitung ulang jika nilai di dalam array dependensi `[rating]` berubah.
  // Jika rating tidak berubah, dia pakai hasil cache (hemat performa).
  const renderStars = useMemo(() => {
    const roundedRating = Math.round(rating);
    
    return (
      <View style={styles.ratingContainer}>
        {/* Menampilkan Angka Rating (misal: 4.5) */}
        <Text style={styles.ratingText}>{rating}</Text>
        
        {/* Looping Bintang */}
        <View style={styles.starsRow}>
          {/* Trik membuat array kosong panjang 5 untuk di-map */}
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i} // Wajib ada key unik dalam loop React
              name={i < roundedRating ? "star" : "star-outline"}
              size={14}
              color="#FFD700"
            />
          ))}
        </View>
      </View>
    );
  }, [rating]);

  // ==========================================================================
  // 3. FORMAT HARGA (useMemo)
  // ==========================================================================
  // Sama, ini juga Computed Property.
  // Mengubah angka mentah (30000) menjadi format Rupiah (Rp 30.000).
  const formattedPrice = useMemo(() => {
    if (price === null) return "Rp ..."; // Fallback jika data kosong
    
    // Intl.NumberFormat adalah fitur bawaan JavaScript modern
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }, [price]);

  // ==========================================================================
  // 4. TEMPLATE (JSX)
  // ==========================================================================
  return (
    <View style={styles.card}>
      
      {/* --- GAMBAR --- */}
      <View style={styles.imageWrapper}>
        {/* Conditional Rendering: Mirip `v-if="imageSource"` di Vue */}
        {/* Hanya render Image jika imageSource ada isinya */}
        {imageSource && (
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
        )}
      </View>

      {/* --- DETAIL INFO --- */}
      <View style={styles.details}>
        {/* numberOfLines={1}: Text truncation (titik-titik ...) jika kepanjangan */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.row}>
          <Text style={styles.location} numberOfLines={1}>
            📍 {location}
          </Text>
        </View>

        {/* Memanggil hasil computed property bintang */}
        {renderStars}
      </View>

      {/* --- HARGA & TOMBOL --- */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Harga per sesi</Text>
          <Text style={styles.priceValue}>{formattedPrice}</Text>
        </View>

        {/* TouchableOpacity: Komponen standar RN untuk tombol dengan efek klik */}
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Pilih</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// 5. STYLES
// ============================================================================
// Di React Native, styling menggunakan JavaScript Object, bukan CSS biasa.
// Default display-nya adalah FLEXBOX (flexDirection default: 'column').
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    
    // --- BAYANGAN (SHADOW) ---
    // Di RN, shadow iOS dan Android beda properti.
    
    // Shadow khusus iOS:
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Shadow khusus Android:
    elevation: 3, 
    
    // Agar konten (gambar) yang di sudut tidak menembus rounded corner
    overflow: "hidden", 
  },
  imageWrapper: {
    height: 180, // Tinggi fix agar layout tidak loncat
    width: "100%",
    backgroundColor: "#eee", // Warna abu-abu saat gambar loading/kosong
  },
  image: {
    width: "100%",
    height: "100%",
  },
  details: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row", // Ubah arah flex jadi horizontal
    alignItems: "center", // Vertikal align center
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: "#666",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontWeight: "bold",
    marginRight: 6,
    color: "#333",
  },
  starsRow: {
    flexDirection: "row",
  },
  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between", // Kiri (Harga) dan Kanan (Tombol) mentok ujung
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fafafa",
  },
  priceLabel: {
    fontSize: 10,
    color: "#888",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#da9723", // Warna Oranye
  },
  button: {
    backgroundColor: "#d97706",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});