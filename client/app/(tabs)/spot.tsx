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
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert, // Tambah Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location"; // Tambah Expo Location
import SpotCard from "@/components/spotCard";
import { SpotService, SessionService } from "@/service/api";
import { API_URL } from "@env";
import { useRouter } from "expo-router";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================
const ASSETS_URL = `${API_URL}/assets`;

const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  background: "#f8f9fa",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  border: "#dddddd",
  inputBg: "#f0f2f5",
};

// ============================================================================
// TYPES
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
  minPrice: string;
  maxPrice: string;
  rating: number;
}

// ============================================================================
// CUSTOM HOOK: DATA FETCHING
// ============================================================================
const useFishingSpots = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchSpots = useCallback(async () => {
    try {
      setLoading(true);
      const response = await SpotService.getAll();
      // Handle struktur response standar Laravel/API Resource
      const rawSpots = response.data?.data || response.data || [];

      const spotsWithPrice: Spot[] = await Promise.all(
        rawSpots.map(async (sp: Spot) => {
          try {
            const sessionRes = await SessionService.getNextPrice(sp.id);
            return { ...sp, nextPrice: sessionRes.data?.price ?? null };
          } catch (error) {
            return { ...sp, nextPrice: null };
          }
        })
      );

      setSpots(spotsWithPrice);
    } catch (err) {
      console.error("[useFishingSpots] Error fetching data:", err);
      setSpots([]); // Kosongkan data jika error
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchSpots();
  };

  return { spots, loading, isRefreshing, onRefresh };
};

// ============================================================================
// COMPONENT: FILTER MODAL
// ============================================================================
const FilterModal = ({
  visible,
  onClose,
  onApply,
  initialFilter,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: (filter: FilterState) => void;
  initialFilter: FilterState;
}) => {
  const [localFilter, setLocalFilter] = useState<FilterState>(initialFilter);

  useEffect(() => {
    if (visible) setLocalFilter(initialFilter);
  }, [visible]);

  const handleReset = () => {
    setLocalFilter({ minPrice: "", maxPrice: "", rating: 0 });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Pencarian</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.filterLabel}>Rentang Harga (Rp)</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                keyboardType="numeric"
                value={localFilter.minPrice}
                onChangeText={(t) => setLocalFilter({ ...localFilter, minPrice: t })}
              />
              <Text style={{ marginHorizontal: 10 }}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                keyboardType="numeric"
                value={localFilter.maxPrice}
                onChangeText={(t) => setLocalFilter({ ...localFilter, maxPrice: t })}
              />
            </View>

            <Text style={styles.filterLabel}>Rating Minimum</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setLocalFilter({ ...localFilter, rating: star })}
                >
                  <Ionicons
                    name={star <= localFilter.rating ? "star" : "star-outline"}
                    size={32}
                    color={COLORS.accent}
                    style={{ marginRight: 8 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onApply(localFilter)}
              style={styles.applyButton}
            >
              <Text style={styles.applyButtonText}>Terapkan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ExploreScreen() {
  const { spots, loading, isRefreshing, onRefresh } = useFishingSpots();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  
  // State untuk loading lokasi
  const [locationLoading, setLocationLoading] = useState(false); 
  
  const [activeFilter, setActiveFilter] = useState<FilterState>({
    minPrice: "",
    maxPrice: "",
    rating: 0,
  });

  // ==========================================================================
  // LOGIC: GET LOCATION & REVERSE GEOCODE
  // ==========================================================================
  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      // Minta Izin
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Ditolak", "Izinkan aplikasi mengakses lokasi untuk fitur ini.");
        return;
      }

      // Ambil Koordinat
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse Geocode (Koordinat -> Nama Tempat)
      let addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const addr = addressResponse[0];
        // Prioritaskan nama kota/kabupaten, atau wilayah
        const locationName = addr.subregion || addr.city || addr.region || "";
        
        if (locationName) {
          setSearchQuery(locationName); // Isi ke search bar
        } else {
          Alert.alert("Info", "Nama lokasi tidak ditemukan, coba lagi.");
        }
      }
    } catch (error) {
      console.error("Gagal ambil lokasi:", error);
      Alert.alert("Error", "Gagal mendapatkan lokasi saat ini.");
    } finally {
      setLocationLoading(false);
    }
  };

  // ==========================================================================
  // LOGIC: FILTERING
  // ==========================================================================
  const filteredSpots = useMemo(() => {
    if (!spots.length) return [];

    const query = searchQuery.toLowerCase();
    const minP = activeFilter.minPrice ? parseInt(activeFilter.minPrice) : 0;
    const maxP = activeFilter.maxPrice ? parseInt(activeFilter.maxPrice) : Infinity;

    return spots.filter((spot) => {
      const matchText =
        spot.name?.toLowerCase().includes(query) ||
        spot.address?.toLowerCase().includes(query);

      const price = spot.nextPrice || 0;
      const matchPrice = price >= minP && price <= maxP;
      const matchRating = spot.rating >= activeFilter.rating;

      return matchText && matchPrice && matchRating;
    });
  }, [spots, searchQuery, activeFilter]);

  const renderSpotItem: ListRenderItem<Spot> = useCallback(({ item }) => {
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
          
          <View style={styles.searchRow}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                placeholder="Lokasi atau nama spot..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {/* Tombol Clear Search */}
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Button */}
            <TouchableOpacity
              style={[
                styles.filterBtn,
                (activeFilter.rating > 0 || activeFilter.minPrice !== "") && styles.filterBtnActive
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons 
                name="options" 
                size={24} 
                color={(activeFilter.rating > 0 || activeFilter.minPrice !== "") ? COLORS.white : COLORS.primary} 
              />
            </TouchableOpacity>
          </View>

          {/* CHIP LOKASI SAAT INI */}
          <TouchableOpacity 
            style={styles.locationChip} 
            onPress={handleUseCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: 6 }} />
            ) : (
              <Ionicons name="navigate-circle" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
            )}
            <Text style={styles.locationChipText}>
              {locationLoading ? "Mencari lokasi..." : "Gunakan Lokasi Saat Ini"}
            </Text>
          </TouchableOpacity>

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
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[COLORS.accent]}
              />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Ionicons name="fish-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Tidak ada spot ditemukan :(</Text>
              </View>
            }
          />
        )}
      </View>

      {/* MODAL COMPONENT */}
      <FilterModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)}
        onApply={(newFilter) => {
          setActiveFilter(newFilter);
          setModalVisible(false);
        }}
        initialFilter={activeFilter}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: 20 },
  
  // Header
  header: { marginBottom: 15, marginTop: 50 },
  title: { fontSize: 24, fontWeight: "bold", color: COLORS.primary, marginBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, height: "100%", color: COLORS.textMain, fontSize: 14 },
  
  // Filter Button on Header
  filterBtn: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },

  // STYLE CHIP LOKASI
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary + "15", // Opacity 15%
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 12,
  },
  locationChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  // List & Loading
  listContainer: { paddingBottom: 100 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  loadingText: { marginTop: 10, color: COLORS.textMuted, fontSize: 12 },
  emptyText: { marginTop: 10, color: COLORS.textMuted, fontSize: 14 },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  filterLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMain, marginBottom: 10, marginTop: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  ratingRow: { flexDirection: 'row', marginBottom: 20 },
  
  modalActions: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 10,
  },
  resetButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  resetButtonText: { fontWeight: 'bold', color: COLORS.textMuted },
  applyButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: { fontWeight: 'bold', color: COLORS.white },
});