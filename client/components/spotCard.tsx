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

// 1. Definisikan tipe data yang diterima (Props)
// Ini ibarat "props: { spot: Object }" di Vue
interface SpotCardProps {
  id: number;
  title: string;
  imageSource?: ImageSourcePropType; // Bisa URL object atau require()
  location: string;
  rating: number;
  price: number | null; // Bisa null kalau belum ada jadwal
  onPress?: () => void; // Buat handle klik tombol "Pilih"
}

export default function SpotCard({
  title,
  imageSource,
  location,
  rating,
  price,
  onPress,
}: SpotCardProps) {
  // 2. Logic Bintang (Computed Property di Vue)
  const renderStars = useMemo(() => {
    const roundedRating = Math.round(rating);
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>{rating}</Text>
        <View style={styles.starsRow}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < roundedRating ? "star" : "star-outline"}
              size={14}
              color="#FFD700"
            />
          ))}
        </View>
      </View>
    );
  }, [rating]);

  // 3. Format Rupiah
  const formattedPrice = useMemo(() => {
    if (price === null) return "Rp ...";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  }, [price]);

  return (
    <View style={styles.card}>
      {/* --- GAMBAR --- */}
      <View style={styles.imageWrapper}>
        {imageSource && (
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
        )}
      </View>

      {/* --- DETAIL INFO --- */}
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.row}>
          <Text style={styles.location} numberOfLines={1}>
            📍 {location}
          </Text>
        </View>

        {/* Rating */}
        {renderStars}

        {/* Info Tambahan (Opsional, sesuai Vue kamu) */}
        {/* Di sini kita bisa tambah info kapasitas kalau datanya dikirim dari Parent */}
      </View>

      {/* --- HARGA & TOMBOL --- */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Harga per sesi</Text>
          <Text style={styles.priceValue}>{formattedPrice}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Pilih</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 4. Styles (Mirip CSS Vue kamu, tapi versi React Native)
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    // Shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow Android
    elevation: 3,
    overflow: "hidden", // Biar gambar gak nembus radius
  },
  imageWrapper: {
    height: 180, // Tinggi gambar fix
    width: "100%",
    backgroundColor: "#eee",
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
    flexDirection: "row",
    alignItems: "center",
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
  // Footer (Harga & Tombol)
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    color: "#da9723", // Warna Oranye sesuai aksen kamu
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
