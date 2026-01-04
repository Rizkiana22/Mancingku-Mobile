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

// === CONFIG & SERVICES ===
// @env: Best practice untuk menyimpan konfigurasi sensitif/berubah-ubah (seperti Base URL)
// agar tidak perlu mengubah kodingan logic saat pindah dari Dev -> Production.
import { API_URL } from "@env";
// BaitService: Abstraksi panggilan API. Memisahkan Logic UI (View) dari Logic Data (Service).
import { BaitService } from "@/service/api";

/**
 * Interface Bait
 * Mendefinisikan 'shape' atau struktur data umpan yang diterima dari backend.
 * TypeScript akan membantu mencegah error typo saat mengakses properti (misal: item.nama vs item.name).
 */
interface Bait {
  id: number;
  name: string;
  image: string;
  description: string;
  purchase_link: string;
}

export default function UmpanScreen() {
  // === STATE MANAGEMENT ===
  // Menyimpan array data umpan
  const [baits, setBaits] = useState<Bait[]>([]);
  // Mengontrol spinner loading saat layar pertama kali dibuka
  const [loading, setLoading] = useState(true);
  // Mengontrol spinner loading saat user melakukan refresh manual (tarik layar)
  const [refreshing, setRefreshing] = useState(false);

  /**
   * fetchBaits
   * Fungsi sentral untuk sinkronisasi data dengan server.
   * Menggunakan async/await untuk kode yang lebih bersih (avoid callback hell).
   */
  const fetchBaits = async () => {
    try {
      // Request data ke endpoint backend via Service
      const response = await BaitService.getAll();

      // === ROBUST DATA HANDLING ===
      // Mengecek struktur response backend. Terkadang backend membungkus data dalam properti 'data',
      // terkadang langsung array. Logic ini mencegah aplikasi crash jika backend berubah format.
      if (response.data && response.data.data) {
        setBaits(response.data.data);
      } else {
        setBaits(response.data);
      }
    } catch (error) {
      // Error handling: Saat ini hanya log ke console.
      // TODO: Bisa ditambahkan Sentry/Crashlytics untuk monitoring error di production.
      console.error("Gagal mengambil data umpan:", error);
    } finally {
      // Eksekusi cleanup: Matikan semua indikator loading
      // 'finally' menjamin loading mati baik request sukses maupun gagal.
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Lifecycle: componentDidMount
  // Mengambil data otomatis saat user masuk ke layar ini.
  useEffect(() => {
    fetchBaits();
  }, []);

  /**
   * onRefresh
   * Handler UX untuk fitur 'Pull-to-Refresh'.
   * Memberikan kontrol kepada user untuk memperbarui data jika terjadi perubahan di server.
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchBaits();
  };

  /**
   * handleOpenLink
   * Handler navigasi eksternal (Deep Linking).
   * Membuka aplikasi marketplace (Shopee) atau browser bawaan.
   */
  const handleOpenLink = (url: string) => {
    // Validasi URL sebelum dibuka untuk mencegah crash aplikasi
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback jika URL rusak atau skema tidak dikenali
        alert("Link Shopee tidak valid / Aplikasi tidak ditemukan");
      }
    });
  };

  /**
   * renderItem
   * Komponen presentasional untuk setiap item dalam list.
   * Dirender secara 'lazy' oleh FlatList untuk efisiensi memori.
   */
  const renderItem = ({ item }: { item: Bait }) => {
    // === KONSTRUKSI ASSET URL ===
    // Path ini harus SINKRON dengan struktur folder 'public' di server Backend (Express/Laravel).
    // Jika path di server berubah, baris ini harus disesuaikan.
    const imageUrl = `${API_URL}/assets/perlengkapan/umpan/${item.image}`;

    return (
      <View style={styles.card}>
        {/* Gambar Produk */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          // resizeMode 'cover' mengisi penuh area gambar, cocok untuk foto produk makanan/umpan
          // agar terlihat menarik/full, meski sedikit terpotong.
          resizeMode="cover"
        />

        {/* Konten Text & Action */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Deskripsi dibatasi 3 baris (ellipsis ...) agar layout kartu seragam tingginya */}
          <Text style={styles.cardDescription} numberOfLines={3}>
            {item.description}
          </Text>

          {/* Tombol CTA (Call To Action) */}
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => handleOpenLink(item.purchase_link)}
            activeOpacity={0.8} // Feedback visual saat ditekan
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

  // Tampilan Loading State (Blocking UI)
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
      {/* FlatList: Komponen list performa tinggi.
          Hanya merender item yang terlihat di layar (+ sedikit buffer),
          berbeda dengan ScrollView yang merender semua item sekaligus (berat).
      */}
      <FlatList
        data={baits}
        keyExtractor={(item) => item.id.toString()} // Key unik wajib string untuk optimasi React Reconciliation
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        // Props Refresh Control
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // Komponen Fallback jika array kosong
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada data umpan.</Text>
        }
      />
    </View>
  );
}

// === STYLES ===
// Menggunakan StyleSheet.create agar style di-compile sekali saja (Performance Optimization)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" }, // Background abu-abu muda (Modern Look)
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: { padding: 16 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#888" },

  // Card Style dengan Shadow (iOS) dan Elevation (Android)
  // Memberikan efek kedalaman (Depth) pada UI
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#eee", // Placeholder warna saat gambar loading
    resizeMode: "cover",
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between", // Menyebar konten vertikal (Judul atas, tombol bawah)
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  cardDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18, // Spasi antar baris teks agar mudah dibaca
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: "#EE4D2D", // Warna Brand Shopee
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start", // Tombol mengikuti lebar kontennya, bukan lebar container
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
