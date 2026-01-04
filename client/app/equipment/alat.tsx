import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// @env mengelola variabel environment agar URL API tidak hardcoded (mudah diganti untuk Development/Production)
import { API_URL } from "@env";
// Import service terpusat agar kodingan di UI tetap bersih (Separation of Concerns)
import { GearService } from "@/service/api";

/**
 * Interface FishingGear
 * Mendefinisikan kontrak tipe data sesuai dengan response database.
 * Ini mencegah error "undefined" saat mengakses properti objek.
 */
interface FishingGear {
  id: number;
  name: string;
  image: string;
  description: string;
  purchase_link: string;
}

export default function PerlengkapanScreen() {
  // === STATE MANAGEMENT ===
  // Menyimpan data list perlengkapan
  const [gears, setGears] = useState<FishingGear[]>([]);
  // Indikator loading saat pertama kali buka layar
  const [loading, setLoading] = useState(true);
  // Indikator loading saat user melakukan pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  /**
   * fetchGears
   * Fungsi asinkron untuk mengambil data dari backend.
   * Menggunakan blok try-catch-finally untuk handle error yang graceful.
   */
  const fetchGears = async () => {
    try {
      // Memanggil API endpoint '/fishingGear' lewat service wrapper
      const response = await GearService.getAll();

      // === VALIDASI RESPONSE ===
      // Backend seringkali memiliki format response yang berbeda (dibungkus 'data' atau array langsung).
      // Pengecekan ini membuat frontend lebih robust terhadap perubahan struktur backend.
      if (response.data && response.data.data) {
        setGears(response.data.data); // Jika format: { success: true, data: [...] }
      } else {
        setGears(response.data); // Jika format langsung array [...]
      }
    } catch (error) {
      // Logging error untuk debugging developer
      console.error("Gagal mengambil data perlengkapan:", error);
      // Di aplikasi real, bisa tambahkan Toast/Alert ke user disini
    } finally {
      // Pastikan loading berhenti, baik sukses maupun gagal
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Lifecycle method: Jalankan fetchGears sekali saat komponen pertama kali dimount
  useEffect(() => {
    fetchGears();
  }, []);

  /**
   * onRefresh
   * Handler untuk fitur Pull-to-Refresh.
   * Memberikan feedback visual ke user bahwa data sedang diperbarui.
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchGears();
  };

  /**
   * handleOpenLink
   * Membuka deep link atau browser eksternal (misal: Shopee/Tokopedia).
   * Dilengkapi pengecekan 'canOpenURL' untuk mencegah crash jika aplikasi target tidak terinstall/link rusak.
   */
  const handleOpenLink = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        alert("Link tidak valid atau aplikasi tidak ditemukan");
      }
    });
  };

  /**
   * renderItem
   * Komponen UI untuk setiap baris data di FlatList.
   * Dipisahkan agar kode return utama lebih bersih.
   */
  const renderItem = ({ item }: { item: FishingGear }) => {
    // === KONSTRUKSI URL GAMBAR ===
    // Database biasanya hanya menyimpan nama file (cth: 'joran.jpg').
    // Kita perlu menggabungkannya dengan Base URL Server.
    const imageUrl = `${API_URL}/assets/perlengkapan/pancingan/${item.image}`;

    return (
      <View style={styles.card}>
        {/* Gambar Produk */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          // resizeMode 'contain' penting agar gambar produk utuh & tidak terpotong (crop)
          resizeMode="contain"
        />

        {/* Konten Teks */}
        <View style={styles.cardContent}>
          {/* Judul dibatasi 2 baris agar layout kartu tetap rapi */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Deskripsi dibatasi 3 baris */}
          <Text style={styles.cardDescription} numberOfLines={3}>
            {item.description}
          </Text>

          {/* Tombol CTA (Call to Action) */}
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => handleOpenLink(item.purchase_link)}
            activeOpacity={0.8} // Efek visual saat ditekan
          >
            <Text style={styles.buyButtonText}>Beli di Shopee</Text>
            <Ionicons
              name="cart-outline"
              size={16}
              color="#fff"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Tampilan saat Loading State aktif
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Tampilan Utama
  return (
    <View style={styles.container}>
      {/* FlatList dipilih daripada ScrollView karena performa (Lazy Rendering).
        Hanya merender item yang terlihat di layar, sangat efisien untuk list panjang.
      */}
      <FlatList
        data={gears}
        keyExtractor={(item) => item.id.toString()} // Key unik wajib string
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        // Props untuk fitur Refresh
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // Tampilan jika data kosong (UX yang baik)
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Belum ada data perlengkapan.</Text>
          </View>
        }
      />
    </View>
  );
}

// === STYLES ===
// Menggunakan StyleSheet.create untuk performa (bridge native hanya load sekali)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" }, // Warna background abu-abu muda agar modern
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: { padding: 16 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#888" },

  // Card Style: Memberikan efek kartu melayang (Shadow/Elevation)
  card: {
    flexDirection: "row", // Layout Horizontal (Gambar kiri, Teks kanan)
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    // Shadow untuk iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation untuk Android
    elevation: 3,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#eee", // Placeholder color saat gambar loading
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between", // Menyebar konten (Judul di atas, Tombol di bawah)
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    textTransform: "capitalize", // Memaksa huruf kapital di awal kata
  },
  cardDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18, // Line height untuk keterbacaan yang lebih baik
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: "#EE4D2D", // Warna oranye khas Shopee
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start", // Tombol tidak full width, mengikuti konten
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
