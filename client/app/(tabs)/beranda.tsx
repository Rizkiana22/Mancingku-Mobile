import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Image, // Tambah Image component
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Mengambil variabel environment
import { API_URL } from "@env";

// === IMPORT SERVICE ===
// Tambahkan BlogService di sini
import { SpotService, BlogService, BLOG_IMAGE_URL } from "@/service/api";

// === IMPORT COMPONENTS ===
import SpotHighlightCard from "@/components/SpotHighlightCard";

const { width } = Dimensions.get("window");

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  cardBg: "rgba(255,255,255,0.95)",
};

// ============================================================================
// SUB-COMPONENTS (Local)
// ============================================================================

const HeaderSection = ({ onProfilePress }: { onProfilePress: () => void }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.greetingText}>Mancingku</Text>
    <TouchableOpacity onPress={onProfilePress}>
      <Ionicons name="person-circle-outline" size={45} color={COLORS.white} />
    </TouchableOpacity>
  </View>
);

const PromoBanner = ({ onPress }: { onPress: () => void }) => (
  <View style={styles.bannerContainer}>
    <View style={styles.bannerContent}>
      <Text style={styles.bannerTitle}>Cuaca Cerah ☀️</Text>
      <Text style={styles.bannerDesc}>Waktu terbaik untuk booking.</Text>
      <TouchableOpacity style={styles.bannerButton} onPress={onPress}>
        <Text style={styles.bannerButtonText}>Lihat</Text>
      </TouchableOpacity>
    </View>
    <Ionicons
      name="sunny"
      size={90}
      color="rgba(255,255,255,0.2)"
      style={styles.bannerIcon}
    />
  </View>
);

const QuickMenuItem = ({
  label,
  icon,
  iconType = "ion",
  onPress,
  color = COLORS.primary,
}: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
      {iconType === "material" ? (
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      ) : (
        <Ionicons name={icon} size={28} color={color} />
      )}
    </View>
    <Text style={styles.menuText}>{label}</Text>
  </TouchableOpacity>
);

// === NEW COMPONENT: BLOG CARD ===
// Komponen kecil khusus untuk kartu blog
const BlogCard = ({ title, date, image, onPress }: any) => (
  <TouchableOpacity
    style={styles.blogCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Image source={image} style={styles.blogImage} resizeMode="cover" />
    <View style={styles.blogContent}>
      <Text style={styles.blogDate}>{date}</Text>
      <Text style={styles.blogTitle} numberOfLines={2}>
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);
 
// ============================================================================
// MAIN SCREEN COMPONENT
// ============================================================================
export default function HomeScreen() {
  const router = useRouter();

  // STATE MANAGEMENT
  const [popularSpots, setPopularSpots] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]); // State untuk Blog
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Panggil API Spot dan Blog secara bersamaan (Parallel)
        const [spotsRes, blogsRes] = await Promise.all([
          SpotService.getPopular(),
          BlogService.getAll(),
        ]);
          
        // 1. MAPPING DATA SPOTS
        const mappedSpots = spotsRes.data.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          title: item.name,
          location: item.address,
          rating: Number(item.rating) || 0,
          imageSource: {
            uri: `${API_URL}/assets/spots/${item.image}`,
          },
        }));

        // 2. MAPPING DATA BLOGS
        const blogList = blogsRes.data?.data ?? blogsRes.data ?? [];
        const mappedBlogs = blogList.slice(0, 5).map((item: any) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          date: new Date(item.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          imageSource: {
            uri: BLOG_IMAGE_URL(item.image), // PAKAI INI
          },
        }));

        setPopularSpots(mappedSpots);
        setBlogs(mappedBlogs);
      } catch (error) {
        console.error("Error Fetching Data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ImageBackground
      source={require("@/assets/images/bg.webp")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} pointerEvents="none" />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* === HEADER SECTION === */}
          <HeaderSection
            onProfilePress={() => router.push("/(tabs)/profile")}
          />

          {/* === BANNER PROMO === */}
          <PromoBanner onPress={() => router.push("/(tabs)/spot")} />

          {/* === MENU NAVIGASI CEPAT === */}
          <View style={styles.menuCard}>
            <View style={styles.menuRow}>
              <QuickMenuItem
                label="Cari Spot"
                icon="map"
                onPress={() => router.push("/(tabs)/spot")}
              />
              <QuickMenuItem
                label="Aktivitas"
                icon="ticket"
                color="#E91E63"
                onPress={() => router.push("/(tabs)/aktivitas")}
              />
              <QuickMenuItem
                label="Perlengkapan"
                icon="hook"
                iconType="material"
                color={COLORS.accent}
                onPress={() => router.push("/(tabs)/perlengkapan")}
              />
            </View>
          </View>

          {/* === SECTION: SPOT POPULER === */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spot Paling Populer</Text>
            {/* Opsi: Tambah tombol 'Lihat Semua' jika perlu */}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.white}
                style={{ marginLeft: 20 }}
              />
            ) : (
              popularSpots.map((spot) => (
                <SpotHighlightCard
                  key={spot.slug}
                  title={spot.title}
                  location={spot.location}
                  rating={spot.rating}
                  imageSource={spot.imageSource}
                  
                  onPress={() => {
                    console.log('Spot pressed:', spot);
                    console.log('Slug:', spot.slug);
                    
                    router.push(`/spot/${spot.slug}` as any);
                  }}
                />
              ))
            )}
          </ScrollView>

          {/* === SECTION: BLOG / TIPS MANCING (BARU) === */}
          <View style={[styles.sectionHeader, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Tips & Artikel Mancing</Text>
            {/* Tombol kecil jika user ingin lihat semua blog */}
            {/* <TouchableOpacity onPress={() => router.push('/blog')}>
                <Text style={styles.seeAllText}>Lihat Semua</Text>
             </TouchableOpacity> */}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.white}
                style={{ marginLeft: 20 }}
              />
            ) : blogs.length > 0 ? (
              blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  title={blog.title}
                  date={blog.date}
                  image={blog.imageSource}
                  // Navigasi ke detail blog (pastikan buat file [slug].tsx nanti)
                  onPress={() => router.push(`/blog/${blog.slug}` as any)}
                />
              ))
            ) : (
              <Text style={{ color: "#eee", marginLeft: 20 }}>
                Belum ada berita terbaru.
              </Text>
            )}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 50,
    marginTop: 15,
  },
  greetingText: { fontSize: 22, fontWeight: "bold", color: COLORS.white },

  // Banner
  bannerContainer: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 5,
    overflow: "hidden",
    height: 160,
    justifyContent: "center",
  },
  bannerContent: { zIndex: 2, maxWidth: "80%" },
  bannerTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.white },
  bannerDesc: { color: "#eee", marginVertical: 8, fontSize: 13 },
  bannerButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  bannerButtonText: { color: COLORS.white, fontWeight: "bold", fontSize: 12 },
  bannerIcon: { position: "absolute", right: -10, bottom: -10 },

  // Menu
  menuCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 30, // Dikurangi dikit biar muat banyak
    elevation: 3,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItem: { width: (width - 80) / 3, alignItems: "center" },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  menuText: { fontSize: 14, fontWeight: "600", color: COLORS.primary },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  seeAllText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: "bold",
  },

  // === STYLES BLOG CARD ===
  blogCard: {
    width: 220, // Lebar fixed biar bisa di-scroll horizontal
    height: 180,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    marginRight: 15, // Jarak antar kartu
    overflow: "hidden",
    elevation: 2,
  },
  blogImage: {
    width: "100%",
    height: 100, // Gambar ambil separuh kartu
    backgroundColor: "#ddd",
  },
  blogContent: {
    padding: 10,
    flex: 1,
    justifyContent: "center",
  },
  blogDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  blogTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.textMain,
    lineHeight: 18,
  },
});
