import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SpotService, SessionService } from "@/service/api";
import { API_URL } from "@env";

// Format Jam (HH:MM)
const formatTime = (timeString: string | null) => {
  if (!timeString) return "--:--";
  return timeString.slice(0, 5);
};

const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  background: "#f8f9fa",
  cardBlue: "#18647b",
};

export default function SpotDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  
  const [spot, setSpot] = useState<any>(null);
  const [opsHours, setOpsHours] = useState<{ open: string | null; close: string | null }>({ open: null, close: null });
  const [price, setPrice] = useState<number | null>(null); // Pake state harga simpel aja
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        // 1. Ambil Detail Spot
        const spotRes = await SpotService.getBySlug(slug);
        const spotData = spotRes.data;
        setSpot(spotData);

        if (spotData?.id) {
          
          // 2. Ambil Jam Operasional
          try {
            const opsRes = await SessionService.getOperationalHours(spotData.id);
            setOpsHours(opsRes.data);
          } catch (e) {
            console.log("Error Ops Hours:", e);
          }

          // 3. Ambil Harga (Pake getNextPrice kayak di Explore)
          try {
            const priceRes = await SessionService.getNextPrice(spotData.id);
            // Cek struktur data, kadang {data: {price: ...}} atau {price: ...}
            const priceVal = priceRes.data?.price || priceRes.data || 0;
            setPrice(priceVal);
          } catch (e) {
            console.log("Error Price:", e);
            setPrice(0);
          }
        }

      } catch (err) {
        console.error("Error Fetch All:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!spot) return null;

  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER IMAGE */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: `${API_URL}/assets/spots/${spot.image}` }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.imageContent}>
          <Text style={styles.headerTitle}>{spot.name}</Text>
          <View style={styles.headerRating}>
            <Ionicons name="star" size={16} color={COLORS.accent} />
            <Text style={styles.headerRatingText}>{spot.rating}</Text>
          </View>
        </View>
      </View>

      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <TouchableOpacity
            style={styles.commentButton}
            onPress={() => router.push({ pathname: "/review", params: { spotId: spot.id } })}
          >
            <Ionicons name="star" size={18} color={COLORS.white} />
            <Text style={styles.commentButtonText}>Ulasan Pengunjung</Text>
          </TouchableOpacity>

          {/* LOKASI */}
          <View style={styles.addressRow}>
             <Ionicons name="location" size={20} color={COLORS.primary} />
             <Text style={styles.addressText}>{spot.address}</Text>
          </View>

          {/* CARD INFO (FASILITAS & HARGA) */}
          <View style={styles.mainInfoCard}>
            
            {/* Fasilitas */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Fasilitas</Text>
              {spot.fasilitas?.length > 0 ? (
                <View style={styles.facilityGrid}>
                  {spot.fasilitas.map((f: any, index: number) => (
                    <View key={index} style={styles.facilityItem}>
                      <Image
                        source={{ uri: `${API_URL}/assets/facilities/${f.icon}` }}
                        style={styles.facilityIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.facilityText}>{f.name}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.textWhiteMuted}>Tidak ada data fasilitas</Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* Operasional & Harga */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>JAM OPERASIONAL :</Text>
              
              {opsHours.open && opsHours.close ? (
                <Text style={styles.opsTime}>
                  {formatTime(opsHours.open)} - {formatTime(opsHours.close)}
                </Text>
              ) : (
                <Text style={styles.textWhiteMuted}>Tutup / Jadwal belum tersedia</Text>
              )}

              {/* HARGA FIX DISINI */}
              <View style={styles.priceGroup}>
                <View>
                  <Text style={styles.priceLabel}>Harga per Sesi</Text>
                  <Text style={styles.priceValue}>
                    {/* Render harga dari state 'price' */}
                    Rp {price ? Number(price).toLocaleString("id-ID") : "0"}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.pesanButton}
                  onPress={() => {
                    router.push({
                      pathname: "/booking",
                      params: { spotId: spot.id },
                    });
                  }}
                >
                  <Text style={styles.pesanButtonText}>Pesan Sekarang</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  imageWrapper: { height: 260, overflow: "hidden" },
  image: { width: "100%", height: "100%", position: "absolute" },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  backButton: { position: "absolute", top: 12, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  imageContent: { position: "absolute", bottom: 20, left: 20, right: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.white, marginBottom: 6 },
  headerRating: { flexDirection: "row", alignItems: "center" },
  headerRatingText: { color: COLORS.white, marginLeft: 6, fontWeight: "600" },

  container: { flex: 1, paddingHorizontal: 20, marginTop: -40 },

  addressRow: {
    marginTop: 20, 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressText: {
    marginLeft: 10,
    color: COLORS.textMain,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },

  mainInfoCard: {
    marginTop: 20,
    backgroundColor: COLORS.cardBlue,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  
  infoSection: { marginBottom: 10 },
  infoTitle: { color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 10, textTransform: "uppercase" },

  facilityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 15 },
  facilityItem: { flexDirection: "row", alignItems: "center", width: "45%", marginBottom: 8 },
  facilityIcon: { width: 24, height: 24, marginRight: 8, tintColor: "white" },
  facilityText: { color: "white", fontSize: 13, flex: 1 },

  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 15 },

  opsTime: { color: "white", fontSize: 16, marginBottom: 15 },
  textWhiteMuted: { color: "rgba(255,255,255,0.7)", fontSize: 14 },

  priceGroup: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  priceLabel: { color: "white", fontSize: 12 },
  priceValue: { color: "#ffcc00", fontWeight: "bold", fontSize: 18 },

  pesanButton: { backgroundColor: "#ff9f00", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  pesanButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },

  commentButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: -10,
    zIndex: 10,
    elevation: 6,
  },
  commentButtonText: { color: COLORS.white, fontWeight: "600", marginLeft: 6 },
});