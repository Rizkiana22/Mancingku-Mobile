import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// AuthContext: Sumber state global autentikasi (user & loading)
// Menghindari prop drilling dan duplikasi logic auth di setiap screen
import { useAuth } from "@/context/AuthContext";

// Service Layer: Abstraksi API call (Booking & Session)
// Memisahkan UI concern dari data-fetching & business logic
import { BookingService, SessionService } from "@/service/api";

// AsyncStorage: Penyimpanan token lokal (persistent)
// Digunakan untuk otorisasi request booking
import AsyncStorage from "@react-native-async-storage/async-storage";

// Date Picker native (iOS & Android)
import DateTimePicker from "@react-native-community/datetimepicker";


// ============================================================================
// DESIGN SYSTEM: COLORS
// Disentralisasi agar konsisten dan mudah di-maintain
// ============================================================================
const COLORS = {
  primary: "#014b69",
  accent: "#da9723",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  background: "#f8f9fa",
};

export default function BookingSession() {
  // ==========================================================================
  // ROUTING & AUTH CONTEXT
  // ==========================================================================
  // sessionId diambil dari URL (dynamic route: /booking/[sessionId])
  const { sessionId } = useLocalSearchParams();

  // user & loading berasal dari global auth state
  const { user, loading } = useAuth();

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  // selectedDate: Object Date untuk DateTimePicker
  // date: String hasil format (YYYY-MM-DD) untuk dikirim ke backend
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [date, setDate] = useState("");

  // people disimpan sebagai string karena berasal dari TextInput
  const [people, setPeople] = useState("1");

  // submitting: Mengunci tombol submit agar tidak double request
  const [submitting, setSubmitting] = useState(false);

  // session: Detail sesi dari backend (kursi, harga, jam, dll)
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Control visibilitas DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ==========================================================================
  // HELPER
  // ==========================================================================
  // Format Date ke standar backend (ISO tanpa time)
  // Backend-friendly & konsisten lintas timezone
  const formatDate = (d: Date) =>
    d.toISOString().split("T")[0]; // YYYY-MM-DD

  // ==========================================================================
  // EFFECT: FETCH SESSION DETAIL
  // Dipanggil ulang setiap:
  // - sessionId berubah
  // - tanggal berubah (untuk cek ketersediaan kursi per tanggal)
  // ==========================================================================
  useEffect(() => {
    if (!sessionId) return;

    setLoadingSession(true);

    SessionService
      .getDetail(Number(sessionId), date || undefined)
      .then(res => setSession(res.data))
      .catch(() => {
        // Defensive UX: Jangan biarkan screen kosong tanpa feedback
        Alert.alert("Error", "Detail sesi tidak ditemukan");
      })
      .finally(() => setLoadingSession(false));
  }, [sessionId, date]);

  // ==========================================================================
  // AUTH GUARD
  // ==========================================================================
  // Saat status auth masih loading → tahan render
  if (loading) return null;

  // Jika user tidak login → redirect paksa ke login
  if (!user) {
    router.replace("/auth/login");
    return null;
  }

  // ==========================================================================
  // SUBMIT HANDLER
  // ==========================================================================
  const submit = async () => {
    // Validasi basic di client untuk UX cepat
    if (!date || Number(people) <= 0) {
      Alert.alert("Error", "Data tidak valid");
      return;
    }

    // Validasi bisnis: kursi tidak mencukupi
    if (session && session.seats_left < Number(people)) {
      Alert.alert("Penuh", "Kursi tidak mencukupi");
      return;
    }

    try {
      setSubmitting(true);

      // Ambil token dari storage lokal
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // Token hilang → anggap sesi expired
        router.replace("/auth/login");
        return;
      }

      // Create booking via service
      await BookingService.create(
        {
          session_id: Number(sessionId),
          booking_date: date,
          total_people: Number(people),
        },
        token
      );

      Alert.alert("Sukses", "Booking berhasil dibuat");
      router.replace("/profile");
    } catch (err: any) {
      // Fallback error message jika backend tidak konsisten
      Alert.alert(
        "Gagal",
        err.response?.data?.message || "Booking gagal"
      );
    } finally {
      // Pastikan state submit selalu dibersihkan
      setSubmitting(false);
    }
  };

  // ==========================================================================
  // DERIVED STATE
  // ==========================================================================
  // Tombol submit dinonaktifkan jika:
  // - sedang submit
  // - session masih loading
  // - session tidak valid
  // - kursi habis
  const disableSubmit =
    submitting || loadingSession || !session || session.seats_left <= 0;

  // ==========================================================================
  // UI
  // ==========================================================================
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        {loadingSession ? (
          // ================================================================
          // LOADING STATE
          // ================================================================
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Memuat sesi...</Text>
          </View>
        ) : (
          <>

            {/* Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

            {/* ============================================================ */}
            {/* SESSION CARD */}
            {/* ============================================================ */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Detail Sesi</Text>

              <Text style={styles.sessionName}>{session.spot_name}</Text>
              <Text style={styles.sessionTime}>
                {session.session_name} • {session.start_time} - {session.end_time}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.sessionPrice}>
                Rp {Number(session.price).toLocaleString("id-ID")}
              </Text>
              <Text style={styles.sessionSeat}>
                Sisa kursi: {session.seats_left}
              </Text>
            </View>

            {/* ============================================================ */}
            {/* FORM BOOKING */}
            {/* ============================================================ */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Data Booking</Text>

              {/* DATE PICKER */}
              <Text style={styles.label}>Tanggal</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
                style={[
                  styles.input,
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{
                    color: date ? COLORS.textMain : COLORS.textMuted,
                  }}
                >
                  {date || "Pilih tanggal"}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  minimumDate={new Date()} // Tidak boleh booking tanggal lampau
                  onChange={(_, d) => {
                    setShowDatePicker(false);
                    if (d) {
                      setSelectedDate(d);
                      setDate(formatDate(d));
                    }
                  }}
                />
              )}

              {/* INPUT JUMLAH ORANG */}
              <Text style={styles.label}>Jumlah Orang</Text>
              <TextInput
                style={styles.input}
                value={people}
                onChangeText={setPeople}
                keyboardType="numeric"
              />
            </View>

            {/* ============================================================ */}
            {/* CTA */}
            {/* ============================================================ */}
            <TouchableOpacity
              style={[
                styles.ctaButton,
                disableSubmit && styles.ctaButtonDisabled,
              ]}
              disabled={disableSubmit}
              onPress={submit}
            >
              <Text style={styles.ctaButtonText}>
                {submitting ? "Memproses..." : "Konfirmasi Booking"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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

  container: {
    padding: 20,
    paddingTop:90,
  },

  center: {
    marginTop: 60,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: COLORS.textMuted,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 12,
  },

  sessionName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.textMain,
  },

  sessionTime: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  sessionPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.accent,
  },

  sessionSeat: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },

  label: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    color: COLORS.textMain,
  },

  ctaButton: {
    marginTop: 12,
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