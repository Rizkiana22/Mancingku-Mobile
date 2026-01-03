import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

// ============================================================================
// 1. KONFIGURASI WARNA & KONSTANTA
// ============================================================================
// Mengumpulkan semua warna di satu objek agar mudah dikelola (Clean Code).
// Jika ingin ganti tema aplikasi, cukup ubah di sini.
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  background: "#f8f9fa",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  border: "#dddddd",
  // Warna Status
  successBg: "#e6f4ea",
  successText: "#1e8e3e",
  pendingBg: "#fff3cd",
  pendingText: "#856404",
  cancelBg: "#f8d7da",
  cancelText: "#721c24",
  defaultBg: "#f1f3f4",
  defaultText: "#5f6368",
};

// Menggunakan object 'as const' untuk menghindari typo saat menulis string 'active' atau 'history'
const TAB_OPTIONS = {
  ACTIVE: "active",
  HISTORY: "history",
} as const;

// ============================================================================
// 2. DEFINISI TIPE DATA (INTERFACE)
// ============================================================================
type TabType = (typeof TAB_OPTIONS)[keyof typeof TAB_OPTIONS];

interface Ticket {
  id: number;
  spot: string;
  date: string;
  price: string; // Backend mengirim harga dalam string (misal: "30000.00"), nanti kita convert.
  
  /**
   * PENTING:
   * 'status_tab' -> Menentukan tiket ini masuk ke Tab mana (Aktif / Riwayat).
   * 'original_status' -> Menentukan warna badge (Paid/Pending/Cancelled).
   */
  status_tab: TabType; 
  original_status: string;
}

// ============================================================================
// 3. KOMPONEN KECIL (SUB-COMPONENTS)
// Memecah UI menjadi komponen kecil agar kode utama tidak berantakan.
// ============================================================================

/**
 * Komponen Tab Switcher (Tombol Aktif/Riwayat di atas)
 */
const FilterTabs = ({
  currentTab,
  onTabChange,
}: {
  currentTab: TabType;
  onTabChange: (t: TabType) => void;
}) => (
  <View style={styles.tabContainer}>
    {/* Tombol Tab Aktif */}
    <TouchableOpacity
      style={[
        styles.tabButton,
        currentTab === TAB_OPTIONS.ACTIVE && styles.activeTab,
      ]}
      onPress={() => onTabChange(TAB_OPTIONS.ACTIVE)}
    >
      <Text
        style={[
          styles.tabText,
          currentTab === TAB_OPTIONS.ACTIVE && styles.activeTabText,
        ]}
      >
        Tiket Aktif
      </Text>
    </TouchableOpacity>

    {/* Tombol Tab Riwayat */}
    <TouchableOpacity
      style={[
        styles.tabButton,
        currentTab === TAB_OPTIONS.HISTORY && styles.activeTab,
      ]}
      onPress={() => onTabChange(TAB_OPTIONS.HISTORY)}
    >
      <Text
        style={[
          styles.tabText,
          currentTab === TAB_OPTIONS.HISTORY && styles.activeTabText,
        ]}
      >
        Riwayat
      </Text>
    </TouchableOpacity>
  </View>
);

/**
 * Komponen Kartu Tiket
 * Menampilkan detail tiket dan statusnya.
 */
const TicketCard = ({ item }: { item: Ticket }) => {
  // Logic untuk menentukan warna badge berdasarkan status pembayaran
  const getStatusBadge = () => {
    const status = item.original_status || "paid"; // Fallback ke 'paid' jika kosong

    switch (status) {
      case "pending":
        return { bg: COLORS.pendingBg, text: COLORS.pendingText, label: "Menunggu Bayar" };
      case "cancelled":
        return { bg: COLORS.cancelBg, text: COLORS.cancelText, label: "Dibatalkan" };
      case "paid":
        return { bg: COLORS.successBg, text: COLORS.successText, label: "Lunas" };
      default:
        return { bg: COLORS.defaultBg, text: COLORS.defaultText, label: status };
    }
  };

  const badgeStyle = getStatusBadge();
  
  // Konversi string harga ("30000.00") ke format Rupiah ("30.000")
  const formattedPrice = Number(item.price).toLocaleString("id-ID");

  return (
    <View style={styles.card}>
      {/* Bagian Atas: Nama Spot & Status */}
      <View style={styles.cardHeader}>
        <Text style={styles.spotName}>{item.spot}</Text>
        <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.statusText, { color: badgeStyle.text }]}>
            {badgeStyle.label}
          </Text>
        </View>
      </View>

      {/* Bagian Bawah: Tanggal & Harga */}
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.textMuted}
            style={{ marginRight: 5 }}
          />
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={styles.price}>Rp {formattedPrice}</Text>
      </View>
    </View>
  );
};

// ============================================================================
// 4. MAIN COMPONENT (LAYAR UTAMA)
// ============================================================================
export default function ActivityScreen() {
  // State Management
  const [activeTab, setActiveTab] = useState<TabType>(TAB_OPTIONS.ACTIVE); // Tab yang sedang dipilih
  const [tickets, setTickets] = useState<Ticket[]>([]); // Menyimpan semua data dari API
  const [loading, setLoading] = useState(true); // Indikator loading awal
  const [refreshing, setRefreshing] = useState(false); // Indikator tarik-turun (pull-to-refresh)

  // Konfigurasi API
  const USER_ID = 1; // Hardcoded sementara
  // Catatan: Ngrok URL berubah setiap restart. Pastikan selalu update.
  const API_URL = `https://arline-noncensored-shockedly.ngrok-free.dev/history/${USER_ID}`;

  /**
   * Fungsi Fetch Data
   * Menggunakan 'useCallback' agar fungsi ini tidak dibuat ulang setiap render,
   * menjaga performa 'useEffect' tetap stabil.
   */
  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);
      
      // Validasi response sukses
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error("Gagal ambil history:", error);
      // Opsional: Alert.alert("Error", "Gagal mengambil data");
    } finally {
      // Matikan loading baik sukses maupun gagal
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL]);

  /**
   * Lifecycle: Component Did Mount
   * Jalankan fetchHistory() saat pertama kali halaman dibuka.
   */
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /**
   * Handler saat user menarik layar ke bawah (Refresh)
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  /**
   * Filtering Data (Optimasi Performa)
   * Menggunakan 'useMemo' agar filter hanya dijalankan saat 
   * 'tickets' berubah atau user ganti 'activeTab'.
   * Ini mencegah filtering ulang yang tidak perlu saat render UI lain.
   */
  const displayedData = useMemo(() => {
    return tickets.filter((item) => item.status_tab === activeTab);
  }, [activeTab, tickets]);

  /**
   * Render Item Helper
   * Fungsi untuk merender setiap baris FlatList.
   */
  const renderItem: ListRenderItem<Ticket> = useCallback(
    ({ item }) => <TicketCard item={item} />,
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Aktivitas Saya</Text>

      {/* Navigasi Tab */}
      <FilterTabs currentTab={activeTab} onTabChange={setActiveTab} />

      {/* Logic Tampilan Loading vs Data */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.textMuted }}>
            Sedang memuat...
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedData} // Data hasil filter
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          
          // Fitur Pull to Refresh
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          
          // Tampilan jika data kosong (Empty State)
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="receipt-outline"
                size={64}
                color={COLORS.border}
              />
              <Text style={styles.emptyText}>
                {activeTab === TAB_OPTIONS.ACTIVE
                  ? "Tidak ada tiket aktif saat ini."
                  : "Belum ada riwayat pemesanan."}
              </Text>
              <Text style={{ fontSize: 12, color: "#999", marginTop: 5 }}>
                (Coba cek tab sebelah, mungkin tiketnya ada disana)
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ============================================================================
// 5. STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  activeTab: { borderBottomColor: COLORS.accent },
  tabText: { fontSize: 15, color: COLORS.textMuted, fontWeight: "600" },
  activeTabText: { color: COLORS.accent },
  listContent: { padding: 20, paddingTop: 10, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  spotName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    flex: 1,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: "700" },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  date: { color: COLORS.textMuted, fontSize: 14 },
  price: { fontSize: 16, fontWeight: "bold", color: COLORS.accent },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: COLORS.textMuted,
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
  },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});