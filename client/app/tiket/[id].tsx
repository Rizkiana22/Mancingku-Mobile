import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  background: "#f8f9fa",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  border: "#dddddd",

  successBg: "#e6f4ea",
  successText: "#1e8e3e",
  pendingBg: "#fff3cd",
  pendingText: "#856404",
  cancelBg: "#f8d7da",
  cancelText: "#721c24",
};

export default function TicketDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // 1. Konstanta Pajak/Biaya Layanan
  const BIAYA_LAYANAN = 2500;

  const {
    id,
    spot,
    date,
    price,
    toolPrice,
    status,
  } = useLocalSearchParams<{
    id: string;
    spot: string;
    date: string;
    price: string;
    toolPrice?: string; // Optional
    status: "paid" | "pending" | "cancelled";
  }>();

  // 2. Kalkulasi Harga
  const spotCost = Number(price) || 0;
  const toolCost = Number(toolPrice) || 0;
  const totalBayar = spotCost + toolCost + BIAYA_LAYANAN;

  // 3. Helper Format Rupiah
  const formatRupiah = (num: number) => {
    return "Rp " + num.toLocaleString("id-ID");
  };

  const badge =
    status === "paid"
      ? { bg: COLORS.successBg, text: COLORS.successText, label: "Lunas" }
      : status === "pending"
      ? { bg: COLORS.pendingBg, text: COLORS.pendingText, label: "Menunggu Bayar" }
      : { bg: COLORS.cancelBg, text: COLORS.cancelText, label: "Dibatalkan" };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Detail Tiket</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* CARD UTAMA */}
        <View style={styles.card}>
          {/* Header Card: Nama Spot & Status */}
          <View style={styles.header}>
            <Text style={styles.spot}>{spot}</Text>
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>
                {badge.label}
              </Text>
            </View>
          </View>

          {/* Tanggal */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.dateText}>{date}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* RINCIAN PEMBAYARAN */}
          <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Harga Sesi Mancing</Text>
            <Text style={styles.priceValue}>{formatRupiah(spotCost)}</Text>
          </View>

          {/* Tampilkan Sewa Alat cuma kalau harganya > 0 */}
          {toolCost > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Sewa Alat</Text>
              <Text style={styles.priceValue}>{formatRupiah(toolCost)}</Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Pajak & Layanan</Text>
            <Text style={styles.priceValue}>{formatRupiah(BIAYA_LAYANAN)}</Text>
          </View>

          {/* Total Line */}
          <View style={styles.totalDivider} />
          
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Biaya</Text>
            <Text style={styles.totalValue}>{formatRupiah(totalBayar)}</Text>
          </View>

        </View>

        {/* QR CODE CARD */}
        <View style={styles.qrCard}>
          <Ionicons name="qr-code-outline" size={140} color={COLORS.border} />
          <Text style={styles.code}>TIKET-{id}</Text>
          <Text style={styles.helper}>Tunjukkan kode ini di lokasi</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },

  // Top Bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#014b69",
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  // Main Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    elevation: 2, // Shadow Android
    shadowColor: "#000", // Shadow iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Biar kalau nama spot panjang, badge tetep di atas
    marginBottom: 10,
  },
  spot: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textMain,
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Date
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },
  totalDivider: {
    height: 1,
    backgroundColor: "#ddd", // Lebih gelap dikit buat pemisah total
    marginVertical: 10,
    borderStyle: 'dashed', // Opsional: garis putus-putus biar estetik
    borderWidth: 1,
    borderColor: '#eee'
  },

  // Payment Details
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: 14,
    color: COLORS.textMain,
    fontWeight: "500",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.accent, // Warna oranye buat harga total biar pop
  },

  // QR Card
  qrCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    elevation: 2,
  },
  code: {
    marginTop: 10,
    fontWeight: "bold",
    color: COLORS.textMain,
    letterSpacing: 1,
    fontSize: 16,
  },
  helper: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textMuted,
  },
});