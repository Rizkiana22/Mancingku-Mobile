import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Mengambil variabel environment
import { API_URL } from "@env";

// = import service =
import { SpotService, BlogService, BLOG_IMAGE_URL } from "@/service/api";

// = IMPORT COMPONENT = 
import SpotHighlightCard from "@/components/SpotHighlightCard";

const { width } = Dimensions.get("window");

//Configuration Constant
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  cardBg: "rgba(255,255,255,0.95)",
};

const HeaderSection = ({ onProfilePress }: { onProfilePress: () => void }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.greetingText}>Mancingku</Text>
    <TouchableOpacity onPress={onProfilePress}>
      <Ionicons name="person-circle-outline" size={45} color={COLORS.white} />
    </TouchableOpacity>
  </View>
);

type Greeting = {
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
};

//sapaan sesuai jam
const getGreeting = (): Greeting => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return {
      title: "Selamat Pagi",
      desc: "Pagi cerah, waktu terbaik untuk mulai memancing.",
      icon: "sunny",
    };
  }

  if (hour >= 11 && hour < 15) {
    return {
      title: "Selamat Siang",
      desc: "Cuaca lagi bagus, cocok buat mancing santai.",
      icon: "partly-sunny",
    };
  }

  if (hour >= 15 && hour < 18) {
    return {
      title: "Selamat Sore ",
      desc: "Waktu terakhir sebelum pemancingan tutup.",
      icon: "cloudy",
    };
  }

  return {
    title: "Selamat Malam",
    desc: "Saatnya istirahat dan rencanakan mancing untuk besok.",
    icon: "moon",
  };
};

//promo benner
const PromoBanner = ({ onPress }: { onPress: () => void }) => {
  const greeting = getGreeting();

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>{greeting.title}</Text>
        <Text style={styles.bannerDesc}>{greeting.desc}</Text>

        <TouchableOpacity style={styles.bannerButton} onPress={onPress}>
          <Text style={styles.bannerButtonText}>Lihat</Text>
        </TouchableOpacity>
      </View>

      <Ionicons
        name={greeting.icon}
        size={90}
        color="rgba(199, 152, 0, 0.2)"
        style={styles.bannerIcon}
      />
    </View>
  );
};

//menu cepat
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
      ) : iconType === "fontawesome" ? (
        <FontAwesome6 name={icon} size={26} color={color} />
      ) : (
        <Ionicons name={icon} size={28} color={color} />
      )}
    </View>
    <Text style={styles.menuText}>{label}</Text>
  </TouchableOpacity>
);

//blog & artikel
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


//tampilan utama
export default function HomeScreen() {
  const router = useRouter();

  // STATE MANAGEMENT
  const [popularSpots, setPopularSpots] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

      //data blog
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
          uri: BLOG_IMAGE_URL(item.image),
        },
      }));

      setPopularSpots(mappedSpots);
      setBlogs(mappedBlogs);
    } catch (error) {
      console.error("Error Fetching Data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false); 
    }
  };

  // Lifecycle awal
  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
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
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={COLORS.white} 
              colors={[COLORS.primary]}
            />
          }
        >
          {/* header */}
          <HeaderSection
            onProfilePress={() => router.push("/(tabs)/profile")}
          />

          {/*banner*/}
          <PromoBanner onPress={() => router.push("/(tabs)/spot")} />

          {/* menu cepat */}
          <View style={styles.menuCard}>
            <View style={styles.menuRow}>
              <QuickMenuItem
                label="Cari Spot"
                icon="map"
                onPress={() => router.push("/(tabs)/spot")}
              />
              <QuickMenuItem
                label="Perlengkapan"
                icon="hook"
                iconType="material"
                color={COLORS.accent}
                onPress={() => router.push("/(tabs)/perlengkapan")}
              />
              <QuickMenuItem
                label="Aktivitas"
                icon="ticket"
                color="#E91E63"
                onPress={() => router.push("/(tabs)/aktivitas")}
              />
              <QuickMenuItem
                label="Artikel"
                icon="newspaper"
                iconType="fontawesome"
                color="#4CAF50"
                onPress={() => router.push("/blog")}
              />
            </View>
          </View>

          {/* spot populer  */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spot Paling Populer</Text>
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
                    router.push(`/spot/${spot.slug}` as any);
                  }}
                />
              ))
            )}
          </ScrollView>

          {/* blog & artikel*/}
          <View style={[styles.sectionHeader, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Blog & Artikel Mancing</Text>
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

// STYLES
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

 //BANNER
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
  bannerIcon: { position: "absolute", right: 5, bottom: -5 },

  //MENU
  menuCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 30,
    elevation: 3,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItem: { width: (width - 80) / 4, alignItems: "center" },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  menuText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },

  // HEADER
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

  // BLOG 
  blogCard: {
    width: 220,
    height: 180,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
    elevation: 2,
  },
  blogImage: {
    width: "100%",
    height: 100,
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