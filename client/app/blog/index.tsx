import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { BlogService, BLOG_IMAGE_URL } from "@/service/api";
// Tambahkan Import Icon dan Safe Area
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// 1. CONSTANTS
// ============================================================================
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  background: "#f8f9fa",
  white: "#ffffff",
  textMain: "#333",
  textMuted: "#666",
  cardBorder: "#eee",
};

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  author: string;
  image: string;
  created_at: string;
}

export default function BlogListPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Hook untuk mengatur jarak poni HP

  // === STATE MANAGEMENT ===
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBlogs = async () => {
    try {
      const response = await BlogService.getAll();
      if (response.data && response.data.data) {
        setBlogs(response.data.data);
      } else {
        setBlogs(response.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data blog:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBlogs();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* === HEADER DENGAN TOMBOL BACK === 
        Menggunakan paddingTop dari insets.top agar tidak ketutup jam/poni HP
      */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={styles.topTitle}>Blog & Artikel</Text>
          <Text style={styles.subTitle}>Cari berita terbaru di sini</Text>
        </View>
        {/* spacer biar title center */}
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={blogs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}

        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }

        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada artikel tersedia.</Text>
        }

        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => router.push(`/blog/${item.slug}` as any)}
          >
            <Image
              source={{ uri: BLOG_IMAGE_URL(item.image) }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.meta}>
                {item.author} ·{" "}
                {new Date(item.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#014b69",
    marginBottom: 30,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  titleWrapper: {
    flex: 1,
    alignItems: "center",
  },

  subTitle: {
    fontSize: 12,
    color: "#ffffff81",
    marginTop: 2,
  },

  // === STYLE HEADER BARU ===
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: COLORS.background, // Warna background nyambung sama body
    // Kita hapus marginTop: 50 karena sudah diganti pakai insets.top
  },

  // Tombol Back
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start", // Rata kiri
    marginBottom: 5,
    backgroundColor: "#00000000",
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },

  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  listContainer: {
    padding: 20,
    paddingTop: 0, // Dikurangi karena header sudah punya paddingBottom
  },

  // --- BLOG CARD ---
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    height: 100,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  thumbnail: {
    width: 110,
    height: "100%",
    backgroundColor: "#ddd",
  },

  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textMain,
    marginBottom: 6,
    lineHeight: 20,
  },

  meta: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  emptyText: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 40,
  },
});