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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "@env";
import { useAuth } from "@/context/AuthContext";

// ============================================================================
// WARNA
// ============================================================================
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

// ============================================================================
// PARSER TANGGAL INDONESIA (WAJIB)
// ============================================================================
const parseIndoDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    Mei: 4,
    Jun: 5,
    Jul: 6,
    Agu: 7,
    Sep: 8,
    Okt: 9,
    Nov: 10,
    Des: 11,
  };

  const parts = dateStr.split(" ");
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = months[parts[1]];
  const year = Number(parts[2]);

  if (isNaN(day) || month === undefined || isNaN(year)) return null;

  return new Date(year, month, day);
};

// ============================================================================
// TAB
// ============================================================================
const TAB_OPTIONS = {
  ACTIVE: "active",
  HISTORY: "history",
} as const;

type TabType = (typeof TAB_OPTIONS)[keyof typeof TAB_OPTIONS];

// ============================================================================
// TIPE DATA
// ============================================================================
interface Ticket {
  id: number;
  spot: string;
  date: string; // "19 Jan 2026"
  price: string;
  original_status: "paid" | "pending" | "cancelled";
}

// ============================================================================
// TAB SWITCH
// ============================================================================
const FilterTabs = ({
  currentTab,
  onTabChange,
}: {
  currentTab: TabType;
  onTabChange: (t: TabType) => void;
}) => (
  <View style={styles.tabContainer}>
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

// ============================================================================
// CARD
// ============================================================================
const TicketCard = ({ item }: { item: Ticket }) => {
  const getBadge = () => {
    switch (item.original_status) {
      case "paid":
        return { bg: COLORS.successBg, text: COLORS.successText, label: "Lunas" };
      case "pending":
        return {
          bg: COLORS.pendingBg,
          text: COLORS.pendingText,
          label: "Menunggu Bayar",
        };
      case "cancelled":
        return {
          bg: COLORS.cancelBg,
          text: COLORS.cancelText,
          label: "Dibatalkan",
        };
    }
  };

  const badge = getBadge();
  const price = Number(item.price).toLocaleString("id-ID");

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.spotName} numberOfLines={1}>
          {item.spot}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={styles.price}>Rp {price}</Text>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function ActivityScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(TAB_OPTIONS.ACTIVE);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const url = `${API_URL}/history/${user?.id}`;

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(url);
      if (res.data?.success) {
        setTickets(res.data.data);
      }
    } catch (e) {
      console.log("FETCH ERROR", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [url]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ========================================================================
  // FILTER UTAMA (TANPA UBAH BACKEND)
  // ========================================================================
  const displayedData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === TAB_OPTIONS.ACTIVE) {
      return tickets.filter((item) => {
        if (item.original_status !== "paid") return false;

        const ticketDate = parseIndoDate(item.date);
        if (!ticketDate) return false;

        ticketDate.setHours(0, 0, 0, 0);
        return ticketDate >= today;
      });
    }

    // RIWAYAT
    return tickets.filter((item) => {
      if (item.original_status === "pending") return false;

      const ticketDate = parseIndoDate(item.date);
      if (!ticketDate) return true;

      ticketDate.setHours(0, 0, 0, 0);
      return ticketDate < today;
    });
  }, [activeTab, tickets]);

  const renderItem: ListRenderItem<Ticket> = ({ item }) => (
    <TicketCard item={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Aktivitas Saya</Text>

      <FilterTabs currentTab={activeTab} onTabChange={setActiveTab} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchHistory} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>
                {activeTab === TAB_OPTIONS.ACTIVE
                  ? "Tidak ada tiket aktif"
                  : "Belum ada riwayat"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    margin: 20,
  },
  tabContainer: { flexDirection: "row", marginHorizontal: 20 },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  activeTab: { borderBottomColor: COLORS.accent },
  tabText: { color: COLORS.textMuted, fontWeight: "600" },
  activeTabText: { color: COLORS.accent },

  listContent: { padding: 20 },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  spotName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  date: { color: COLORS.textMuted },
  price: { fontWeight: "bold", color: COLORS.accent },

  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { color: COLORS.textMuted, marginTop: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
