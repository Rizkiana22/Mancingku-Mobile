import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import RenderHTML from "react-native-render-html";
import { BlogService } from "@/service/api";
import { API_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Interface BlogPost
 * Menyamakan tipe data dengan halaman Perlengkapan agar tidak pakai 'any'.
 */
interface BlogPost {
  id: number;
  title: string;
  author: string;
  content: string;
  image: string;
  created_at: string;
}

export default function BlogDetailPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // === STATE MANAGEMENT ===
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * fetchPost
   * Fungsi ambil data dipisah (seperti fetchGears di halaman alat).
   * Lebih rapi dan handle error lebih jelas.
   */
  const fetchPost = async () => {
    try {
      const response = await BlogService.getBySlug(String(slug));

      // === VALIDASI RESPONSE ===
      // Mirip dengan logic di PerlengkapanScreen
      if (response.data && response.data.data) {
        setPost(response.data.data);
      } else {
        setPost(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil detail blog:", error);
      setPost(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Lifecycle: Jalan sekali pas mount
  useEffect(() => {
    fetchPost();
  }, [slug]);

  /**
   * onRefresh
   * Fitur tarik layar untuk refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchPost();
  };

  const metaDate = useMemo(() => {
    if (!post?.created_at) return "";
    return new Date(post.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [post]);

  const tagStyles = useMemo(
    () => ({
      h2: {
        marginTop: 24,
        marginBottom: 10,
        fontSize: 22,
        color: "#004160",
        fontWeight: "600" as const,
      },
      p: {
        marginBottom: 14,
        fontSize: 18,
        lineHeight: 28,
        color: "#222",
      },
      ul: { paddingLeft: 18, marginBottom: 16 },
      ol: { paddingLeft: 18, marginBottom: 16 },
      li: {
        marginBottom: 8,
        fontSize: 18,
        lineHeight: 28,
        color: "#222",
      },
      blockquote: {
        marginVertical: 18,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#0077c2",
        backgroundColor: "#f5faff",
        fontStyle: "italic" as const,
        borderRadius: 6,
      },
    }),
    []
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#014b69" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16 }}>Artikel tidak ditemukan</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#014b69", fontWeight: "bold" }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const coverUrl = `${API_URL}/assets/blog/${post.image}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ================= HEADER ================= */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={30} color="#ffffffff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Tips & Artikel</Text>

        {/* Spacer supaya title tetap center */}
        <View style={styles.headerBtn} />
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.wrapper}
        // Tambahan RefreshControl biar bisa ditarik
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.h1}>{post.title}</Text>

        <Text style={styles.meta}>
          {post.author} · {metaDate}
        </Text>

        <Image
          source={{ uri: coverUrl }}
          style={styles.coverImg}
          // Tambah resizeMode biar aman
          resizeMode="cover"
        />

        <RenderHTML
          contentWidth={Math.min(width, 900) - 32}
          source={{ html: post.content ?? "" }}
          baseStyle={styles.blogContentBase}
          tagsStyles={tagStyles}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#014b69",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffffff",
  },
  headerBtn: {
    width: 24,
    alignItems: "center",
  },

  page: { flex: 1, backgroundColor: "#fff" },
  wrapper: {
    paddingBottom: 48,
    paddingHorizontal: 16,
    paddingTop: 24,
    alignSelf: "center",
    width: "100%",
    maxWidth: 900,
  },
  h1: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 16,
    lineHeight: 40,
    color: "#111",
  },
  meta: {
    color: "#666",
    marginBottom: 24,
    fontSize: 14,
  },
  coverImg: {
    width: "100%",
    height: 260,
    borderRadius: 10,
    marginBottom: 24,
    backgroundColor: "#eee",
  },
  blogContentBase: {
    fontSize: 18,
    lineHeight: 28,
    color: "#222",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});