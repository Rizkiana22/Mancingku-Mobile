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
import { BaitService } from "@/service/api";

/* ================= TYPES ================= */
interface Bait {
  id: number;
  name: string;
  image: string;
  description: string;
  purchase_link: string;
}

/* ================= SCREEN ================= */
export default function UmpanScreen() {
  const [baits, setBaits] = useState<Bait[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fetchBaits = async () => {
    try {
      const response = await BaitService.getAll();
      setBaits(response.data?.data ?? response.data);
    } catch (err) {
      console.error("Gagal mengambil data umpan:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBaits();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBaits();
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: Bait }) => {
    const imageUrl = `${API_URL}/assets/perlengkapan/umpan/${item.image}`;

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />

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
      {/* ===== TOP BAR (IDENTIK LOGIN) ===== */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Umpan</Text>

        {/* spacer biar title center */}
        <View style={{ width: 24 }} />
      </View>

      {/* ===== CONTENT ===== */}
      <FlatList
        data={baits}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada data umpan.</Text>
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

  /* TOP BAR — SAMA LOGIN */
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
    textAlign: "center",
    marginTop: 50,
    color: "#888",
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
