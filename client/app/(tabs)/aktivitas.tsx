import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// ============================================================================
// 1. CONSTANTS & CONFIGURATION
// Mengatur warna dan tipe status di satu tempat
// ============================================================================
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  background: "#f8f9fa",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  border: "#dddddd",
  // Status Colors
  successBg: "#e6f4ea",
  successText: "#1e8e3e",
  defaultBg: "#f1f3f4",
  defaultText: "#5f6368",
};

const TAB_OPTIONS = {
  ACTIVE: "active",
  HISTORY: "history",
} as const;

// ============================================================================
// 2. TYPES
// ============================================================================
type TabType = (typeof TAB_OPTIONS)[keyof typeof TAB_OPTIONS];

interface Ticket {
  id: string;
  spot: string;
  date: string;
  status: TabType;
  price: number;
}

// Data Dummy (Simulasi Database)
const DUMMY_TICKETS: Ticket[] = [
  {
    id: "1",
    spot: "Pemancingan Galatama",
    date: "12 Jan 2024",
    status: "active",
    price: 50000,
  },
  {
    id: "2",
    spot: "Danau Toba Spot",
    date: "01 Jan 2024",
    status: "history",
    price: 75000,
  },
  {
    id: "3",
    spot: "Laut Selatan",
    date: "20 Des 2023",
    status: "history",
    price: 100000,
  },
];

// ============================================================================
// 3. SUB-COMPONENTS
// Komponen kecil yang dipisah agar kode utama lebih bersih
// ============================================================================

/**
 * Komponen Tab Switcher
 */
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
      activeOpacity={0.7}
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
      activeOpacity={0.7}
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
 */
const TicketCard = ({ item }: { item: Ticket }) => {
  // Helper untuk menentukan warna status agar JSX tidak kotor
  const getStatusStyle = (status: TabType) => {
    return status === TAB_OPTIONS.ACTIVE
      ? { bg: COLORS.successBg, text: COLORS.successText, label: "Aktif" }
      : { bg: COLORS.defaultBg, text: COLORS.defaultText, label: "Selesai" };
  };

  const statusStyle = getStatusStyle(item.status);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.spotName}>{item.spot}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>
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
        <Text style={styles.price}>
          Rp {item.price.toLocaleString("id-ID")}
        </Text>
      </View>
    </View>
  );
};

// ============================================================================
// 4. CUSTOM HOOK
// Logic Bisnis: Filtering Data
// ============================================================================
const useActivityFilter = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TAB_OPTIONS.ACTIVE);

  // Memoize hasil filter agar tidak kalkulasi ulang setiap render jika data/tab tidak berubah
  const displayedData = useMemo(() => {
    return DUMMY_TICKETS.filter((item) => item.status === activeTab);
  }, [activeTab]);

  return { activeTab, setActiveTab, displayedData };
};

// ============================================================================
// 5. MAIN COMPONENT
// ============================================================================
export default function ActivityScreen() {
  const { activeTab, setActiveTab, displayedData } = useActivityFilter();

  const renderItem: ListRenderItem<Ticket> = useCallback(
    ({ item }) => <TicketCard item={item} />,
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Aktivitas Saya</Text>

      {/* Tab Navigation */}
      <FilterTabs currentTab={activeTab} onTabChange={setActiveTab} />

      {/* Content List */}
      <FlatList
        data={displayedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>
              {activeTab === TAB_OPTIONS.ACTIVE
                ? "Tidak ada tiket aktif saat ini."
                : "Belum ada riwayat pemesanan."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ============================================================================
// 6. STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },

  // Tab Styles
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
  activeTab: {
    borderBottomColor: COLORS.accent,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  activeTabText: {
    color: COLORS.accent,
  },

  // List Styles
  listContent: {
    padding: 20,
    paddingTop: 10,
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    // Shadow Styling
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
    flex: 1, // Agar text truncate kalau kepanjangan
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.accent,
  },

  // Empty State Styles
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
});
