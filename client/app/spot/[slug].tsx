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
import { useSafeAreaInsets } from "react-native-safe-area-context";


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

  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const [spot, setSpot] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const insets = useSafeAreaInsets();


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
    <SafeAreaView style={styles.root}>
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
              {sessions.map((s) => {
                const isSelected = selectedSession?.id === s.id;
                const isDisabled = s.seats_left <= 0;

                return (
                  <TouchableOpacity
                    key={s.id}
                    activeOpacity={0.8}
                    disabled={isDisabled}
                    onPress={() => setSelectedSession(s)}
                    style={[
                      styles.sessionCard,
                      isSelected && styles.sessionCardSelected,
                      isDisabled && styles.sessionCardDisabled,
                    ]}
                  >
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

                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={COLORS.accent}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.ctaButton,
              !selectedSession && styles.ctaButtonDisabled,
            ]}
            disabled={!selectedSession}
            onPress={() => {
              router.push({
                pathname: "/booking/[sessionId]",
                params: {
                  sessionId: selectedSession.id,
                },
              });
            }}
          >
            <Text style={styles.ctaButtonText}>
              Lanjutkan Pemesanan
            </Text>
          </TouchableOpacity> 
        </ScrollView>
      </SafeAreaView>
    </SafeAreaView>
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
    marginTop: 25,
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

  sessionCardSelected: {
  borderColor: COLORS.accent,
  backgroundColor: "#fff7e6",
},

sessionCardDisabled: {
  opacity: 0.5,
},

ctaButton: {
  marginTop: 16,
  backgroundColor: COLORS.accent,
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: "center",
},

ctaButtonDisabled: {
  backgroundColor: "#ccc",
},

ctaButtonText: {
  color: COLORS.white,
  fontWeight: "bold",
  fontSize: 16,
},

});
