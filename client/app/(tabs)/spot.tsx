import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import SpotCard from "@/components/spotCard";
import { SpotService, SessionService } from "@/service/api";
import { API_URL } from "@env";
import { useRouter } from "expo-router";

// ============================================================================
// CONFIGURATION & CONSTANTS
// Tips: Di real project, pindahkan ini ke file constant/config.js atau .env
// ============================================================================
const API_CONFIG = {
  BASE_URL: API_URL, // Ganti IP sesuai environment
  TIMEOUT: 5000,
};

const ASSETS_URL = `${API_CONFIG.BASE_URL}/assets`;

const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  background: "#f8f9fa",
  textMain: "#333",
  textMuted: "#666",
  white: "#fff",
};

// ============================================================================
// TYPES / INTERFACES
// Tips: Pindahkan ke folder types/index.ts agar reusable
// ============================================================================
interface Spot {
  id: number;
  slug: string;
  name: string;
  address: string;
  image: string | null;
  rating: number;
  nextPrice: number | null;
}

interface FilterState {
  minPrice: number | null;
  maxPrice: number | null;
  rating: number;
}

// ============================================================================
// CUSTOM HOOK: DATA FETCHING LOGIC
// Memisahkan logic bisnis dari UI Component
// ============================================================================
const useFishingSpots = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  /**
   * Mengambil data spots dan menggabungkannya dengan data harga sesi berikutnya.
   * Menggunakan Promise.all untuk parallel request agar lebih efisien.
   */
  const fetchSpots = useCallback(async () => {
    try {
      setLoading(true);
      const response = await SpotService.getAll();
      const rawSpots = response.data; // Ambil isinya (.data)

      // Mapping data spot untuk mengambil harga sesi secara paralel
      const spotsWithPrice: Spot[] = await Promise.all(
        rawSpots.map(async (sp: Spot) => {
          try {
            const sessionRes = await SessionService.getNextPrice(sp.id);
            return { ...sp, nextPrice: sessionRes.data?.price ?? null };
          } catch (error) {
            // Graceful degradation: Jika gagal ambil harga, set null tapi jangan crash
            return { ...sp, nextPrice: null };
          }
        })
      );

      setSpots(spotsWithPrice);
    } catch (err) {
      console.error("[useFishingSpots] Error fetching data:", err);
      // Fallback data untuk development/testing jika API mati
      setSpots([
        {
          id: 1,
          slug: "Pemancingan_Galatama",
          name: "Pemancingan Galatama",
          address: "Bandung, Jawa Barat",
          image: null,
          nextPrice: 50000,
          rating: 4.5,
        },
        {
          id: 2,
          slug: "Danau_Toba_Spot",
          name: "Danau Toba Spot",
          address: "Medan, Sumatra Utara",
          image: null,
          nextPrice: 75000,
          rating: 5.0,
        },
      ]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Trigger fetch saat pertama kali mount
  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  // Handler untuk pull-to-refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchSpots();
  };

  return { spots, loading, isRefreshing, onRefresh };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ExploreScreen() {
  // 1. Menggunakan Custom Hook untuk manajemen data
  const { spots, loading, isRefreshing, onRefresh } = useFishingSpots();

  const router = useRouter();

  // 2. Local UI State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter] = useState<FilterState>({
    minPrice: null,
    maxPrice: null,
    rating: 0,
  });

  /**
   * Filtering Logic
   * Menggunakan useMemo agar kalkulasi filter hanya berjalan
   * jika data spots atau input search berubah.
   */
  const filteredSpots = useMemo(() => {
    if (!spots.length) return [];

    const query = searchQuery.toLowerCase();

    return spots.filter((spot) => {
      // Filter Text (Nama atau Alamat)
      const matchText =
        spot.name?.toLowerCase().includes(query) ||
        spot.address?.toLowerCase().includes(query);

      // Filter Harga & Rating
      const price = spot.nextPrice || 0;
      const matchMin = filter.minPrice ? price >= filter.minPrice : true;
      const matchMax = filter.maxPrice ? price <= filter.maxPrice : true;
      const matchRating = filter.rating ? spot.rating >= filter.rating : true;

      return matchText && matchMin && matchMax && matchRating;
    });
  }, [spots, searchQuery, filter]);

  /**
   * Render Item Function
   * Dipisah agar tidak di-recreate setiap kali render cycle
   */
  // Di dalam renderSpotItem explore.tsx

  const renderSpotItem: ListRenderItem<Spot> = useCallback(({ item }) => {
    // AMAN: tidak pakai require asset lokal
    const imageSource = item.image
      ? { uri: `${ASSETS_URL}/spots/${item.image}` }
      : undefined;

    return (
      <SpotCard
        id={item.id}
        title={item.name}
        imageSource={imageSource}
        location={item.address}
        price={item.nextPrice}
        rating={item.rating}
        onPress={() => {
          router.push({
            pathname: "/spot/[slug]",
            params: { slug: item.slug },
          });
        }}
      />
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Cari Spot</Text>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={COLORS.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Cari lokasi atau nama spot..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Content Section */}
        {loading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>Memuat spot...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredSpots}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSpotItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            // Fitur Refresh
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[COLORS.accent]}
              />
            }
            // Tampilan saat data kosong
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Ionicons
                  name="fish-outline"
                  size={48}
                  color={COLORS.textMuted}
                />
                <Text style={styles.emptyText}>
                  Tidak ada spot ditemukan :(
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Header Styles
  header: {
    marginBottom: 15,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12, // Modern rounded corner
    paddingHorizontal: 12,
    height: 50,
    // Shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow Android
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: COLORS.textMain,
    fontSize: 14,
  },
  // List Styles
  listContainer: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: 12,
  },
  emptyText: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
