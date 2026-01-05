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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { API_URL } from "@env";
import { GearService } from "@/service/api";

/**
 * Interface FishingGear
 */
interface FishingGear {
  id: number;
  name: string;
  image: string;
  description: string;
  purchase_link: string;
}

export default function PerlengkapanScreen() {
  const [gears, setGears] = useState<FishingGear[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fetchGears = async () => {
    try {
      const response = await GearService.getAll();
      if (response.data?.data) {
        setGears(response.data.data);
      } else {
        setGears(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data perlengkapan:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGears();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGears();
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: FishingGear }) => {
    const imageUrl = `${API_URL}/assets/perlengkapan/pancingan/${item.image}`;

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="contain" />

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={styles.cardDescription}>
            {item.description}
          </Text>

          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => handleOpenLink(item.purchase_link)}
          >
            <Text style={styles.buyButtonText}>Beli di Shopee</Text>
            <Ionicons name="cart-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== TOP BAR (PERSIS LOGIN) ===== */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Alat Pancing</Text>

        {/* spacer biar title center */}
        <View style={{ width: 24 }} />
      </View>

      {/* ===== CONTENT ===== */}
      <FlatList
        data={gears}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Belum ada data perlengkapan.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  /* TOP BAR – SAMA LOGIN */
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContainer: {
    padding: 16,
  },

  emptyText: {
    color: "#888",
    marginTop: 40,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 3,
    alignItems: "flex-start",
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginTop: 4,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginVertical: 8,
  },
  buyButton: {
    backgroundColor: "#EE4D2D",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
    gap: 6,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
