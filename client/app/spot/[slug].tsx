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

// ============================================================================
// COLORS
// ============================================================================
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  background: "#f8f9fa",
};

// ============================================================================
// SCREEN
// ============================================================================
export default function SpotDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const [spot, setSpot] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
    try {
      const spotRes = await SpotService.getBySlug(slug);
      setSpot(spotRes.data);

      SessionService
        .getBySpot(spotRes.data.id)
        .then(res => setSessions(res.data));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


    fetchData();
  }, [slug]);

  // ==========================================================================
  // LOADING
  // ==========================================================================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat detail spot...</Text>
      </View>
    );
  }

  if (!spot) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Spot tidak ditemukan</Text>
      </View>
    );
  }

  // ==========================================================================
  // MAIN UI
  // ==========================================================================
  return (
    <View style={styles.root}>
      {/* HEADER IMAGE */}
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri: `${API_URL}/assets/spots/${spot.image}`,
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        {/* Header Text */}
        <View style={styles.imageContent}>
          <Text style={styles.headerTitle}>{spot.name}</Text>
          <View style={styles.headerRating}>
            <Ionicons name="star" size={16} color={COLORS.accent} />
            <Text style={styles.headerRatingText}>{spot.rating}</Text>
          </View>
        </View>
      </View>

      {/* CONTENT */}
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* CARD */}
          <View style={styles.card}>
            {/* Address */}
            <View style={styles.row}>
              <Ionicons
                name="location-outline"
                size={18}
                color={COLORS.textMuted}
              />
              <Text style={styles.address}>{spot.address}</Text>
            </View>

            {/* Facilities */}
            {spot.fasilitas?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Fasilitas</Text>
                <View style={styles.facilityRow}>
                  {spot.fasilitas.map((f: any) => (
                    <View key={f.id} style={styles.facilityItem}>
                      <Ionicons
                        name={f.icon}
                        size={18}
                        color={COLORS.primary}
                      />
                      <Text style={styles.facilityText}>{f.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Sessions */}
            <Text style={styles.sectionTitle}>Pilih Sesi</Text>
            {sessions.map((s) => (
              <View key={s.id} style={styles.sessionCard}>
                <View>
                  <Text style={styles.sessionName}>{s.session_name}</Text>
                  <Text style={styles.sessionTime}>
                    {s.start_time} - {s.end_time}
                  </Text>
                  <Text style={styles.sessionPrice}>
                    Rp {Number(s.price).toLocaleString("id-ID")}
                  </Text>
                  <Text style={styles.sessionSeat}>
                    Sisa kursi: {s.seats_left}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.bookButton,
                    s.seats_left <= 0 && styles.bookButtonDisabled,
                  ]}
                  disabled={s.seats_left <= 0}
                  // onPress={() =>
                  //   router.push({
                  //     pathname: "/booking",
                  //     params: { sessionId: s.id },
                  //   })
                  // }
                >
                  <Text style={styles.bookButtonText}>
                    {s.seats_left <= 0 ? "Penuh" : "Pesan"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: COLORS.textMuted,
  },

  errorText: {
    color: COLORS.textMuted,
  },

  imageWrapper: {
    height: 260,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  backButton: {
    position: "absolute",
    top: 12,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  imageContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 6,
  },

  headerRating: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerRatingText: {
    color: COLORS.white,
    marginLeft: 6,
    fontWeight: "600",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  card: {
    marginTop: -30,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    marginBottom: 40,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  address: {
    marginLeft: 6,
    color: COLORS.textMuted,
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 10,
  },

  facilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },

  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },

  facilityText: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.textMuted,
  },

  sessionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  sessionName: {
    fontWeight: "bold",
    color: COLORS.textMain,
  },

  sessionTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  sessionPrice: {
    fontWeight: "bold",
    color: COLORS.accent,
    marginTop: 4,
  },

  sessionSeat: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },

  bookButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
