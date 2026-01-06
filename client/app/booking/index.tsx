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
import { BookingService, SessionService, GearService } from "@/service/api";

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
  const { spotId } = useLocalSearchParams<{ spotId: string }>();

  // user & loading berasal dari global auth state
  const { user, loading } = useAuth();

  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const [sessions, setSessions] = useState<any[]>([]);

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
  const [loadingSession, setLoadingSession] = useState(true);

  // Control visibilitas DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [gears, setGears] = useState<any[]>([]);
  const [selectedGears, setSelectedGears] = useState<
    { gear_id: number; quantity: number }[]
  >([]);



  // ==========================================================================
  // HELPER
  // ==========================================================================
  // Format Date ke standar backend (ISO tanpa time)
  // Backend-friendly & konsisten lintas timezone
  const formatDate = (d: Date) =>
    d.toISOString().split("T")[0]; // YYYY-MM-DD

  const [loadingGear, setLoadingGear] = useState(true);

  const safeNumber = (value: any) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };


  const updateGearQuantity = (gear: any, delta: number) => {
    setSelectedGears(prev => {
      const existing = prev.find(g => g.gear_id === gear.id);

      if (delta > 0 && gear.stock <= (existing?.quantity || 0)) {
        return prev;
      }

      if (!existing && delta > 0) {
        return [...prev, {
          gear_id: gear.id,
          quantity: 1,
        }];
      }

      if (existing) {
        const newQty = existing.quantity + delta;

        if (newQty <= 0) {
          return prev.filter(g => g.gear_id !== gear.id);
        }

        return prev.map(g =>
          g.gear_id === gear.id
            ? { ...g, quantity: newQty }
            : g
        );
      }

      return prev;
    });
  };

  // ==========================================================================
  // EFFECT: FETCH SESSION DETAIL
  // Dipanggil ulang setiap:
  // - sessionId berubah
  // - tanggal berubah (untuk cek ketersediaan kursi per tanggal)
  // ==========================================================================
  useEffect(() => {
    setSelectedGears([]);
  }, [spotId]);

  useEffect(() => {
    if (!spotId) return;

    setLoadingGear(true);
    GearService.getBySpot(spotId)
      .then(res => {
        const normalized = res.data.map((g: any) => ({
          ...g,
          price: Number(g.price),
          stock: Number(g.stock),
        }));
        setGears(normalized);
      })
      .catch(() => Alert.alert("Error", "Gagal memuat peralatan"))
      .finally(() => setLoadingGear(false));



    setLoadingSession(true);
    SessionService.getBySpot(Number(spotId))
      .then(res => setSessions(res.data))
      .catch(() => {
        Alert.alert("Error", "Gagal memuat sesi");
      })
      .finally(() => setLoadingSession(false));
  }, [spotId]);


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
    // ================= VALIDASI =================
    if (!date || Number(people) <= 0) {
      Alert.alert("Error", "Data tidak valid");
      return;
    }

    if (!selectedSession) {
      Alert.alert("Error", "Pilih sesi terlebih dahulu");
      return;
    }

    if (selectedSession.seats_left < Number(people)) {
      Alert.alert("Penuh", "Kursi tidak mencukupi");
      return;
    }

    try {
      setSubmitting(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      // ================= CREATE BOOKING =================
      const res = await BookingService.create(
        {
          session_id: selectedSession.id,
          booking_date: date,
          total_people: Number(people),
          gears: selectedGears.map(g => ({
            gear_id: g.gear_id,
            quantity: g.quantity,
          })),
        },
        token
      );


      const bookingId = res.data.bookingId;

      // ================= KE PAYMENT =================
      router.replace(`/payment?bookingId=${bookingId}`);

    } catch (err: any) {
      Alert.alert(
        "Gagal",
        err.response?.data?.message || "Booking gagal"
      );
    } finally {
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
    submitting ||
    loadingSession ||
    loadingGear ||
    !selectedSession ||
    selectedSession.seats_left <= 0;

  // Total Harga
  // - Total harga dari sesi * jumlah orang
  const gearTotal = selectedGears.reduce((sum, g) => {
    const gear = gears.find(x => x.id === g.gear_id);
    if (!gear) return sum;

    const price = Number(gear.price);
    if (!Number.isFinite(price)) return sum;

    return sum + price * g.quantity;
  }, 0);



  const totalPrice =
    selectedSession && Number(people) > 0
      ? selectedSession.price * Number(people) + gearTotal
      : 0;


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
            {/* DETAIL SESI (HANYA JIKA DIPILIH) */}
            {/* ============================================================ */}
            {selectedSession ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Detail Sesi</Text>

                <Text style={styles.sessionName}>
                  {selectedSession.session_name}
                </Text>

                <Text style={styles.sessionTime}>
                  {selectedSession.start_time} - {selectedSession.end_time}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sessionPrice}>
                  Rp {Number(selectedSession.price).toLocaleString("id-ID")}
                </Text>

                <Text style={styles.sessionSeat}>
                  Sisa kursi: {selectedSession.seats_left}
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Detail Sesi</Text>
                <Text style={{ color: COLORS.textMuted }}>
                  Silakan pilih sesi terlebih dahulu
                </Text>
              </View>
            )}

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

            {/* ============================================================ */}
            {/* FORM SEWA PERALATAN */}
            {/* ============================================================ */}
            <Text style={styles.sectionTitle}>Pilih Peralatan Untuk Disewa</Text>
            {loadingGear && (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ marginVertical: 8 }}
              />
            )}

            {gears.map(gear => {
              const selected = selectedGears.find(
                g => g.gear_id === gear.id
              );

              return (
                <View key={gear.id} style={[
                  styles.gearCard,
                  selected && styles.gearCardSelected,
                  gear.stock === 0 && styles.gearCardDisabled,
                ]}>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gearName}>{gear.name}</Text>

                    <Text style={styles.gearPrice}>
                      Rp {safeNumber(gear.price).toLocaleString("id-ID")}
                    </Text>

                    <Text style={styles.gearStock}>
                      Stok: {gear.stock}
                    </Text>
                  </View>

                  {/* Quantity Control */}
                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      onPress={() => updateGearQuantity(gear, -1)}
                      disabled={!selected}
                    >
                      <Ionicons
                        name="remove-circle"
                        size={26}
                        color={selected ? COLORS.primary : "#ccc"}
                      />
                    </TouchableOpacity>

                    <Text style={styles.qtyText}>
                      {selected?.quantity || 0}
                    </Text>

                    <TouchableOpacity
                      onPress={() => updateGearQuantity(gear, 1)}
                      disabled={gear.stock <= (selected?.quantity || 0)}
                    >
                      <Ionicons
                        name="add-circle"
                        size={26}
                        color={
                          gear.stock > (selected?.quantity || 0)
                            ? COLORS.accent
                            : "#ccc"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}



            {/* Total Harga */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Harga</Text>
              <Text style={styles.totalValue}>
                Rp {totalPrice.toLocaleString("id-ID")}
              </Text>
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
    paddingTop: 90,
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
  
  sessionCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: "#fff7e6",
  },

  sessionCardDisabled: {
    opacity: 0.5,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  totalLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.accent,
  },

  gearCard: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: COLORS.white,
  borderRadius: 14,
  padding: 14,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#eee",
},

gearCardSelected: {
  borderColor: COLORS.accent,
  backgroundColor: "#fff7e6",
},

gearCardDisabled: {
  opacity: 0.5,
},

gearName: {
  fontSize: 15,
  fontWeight: "600",
  color: COLORS.textMain,
},

gearPrice: {
  marginTop: 4,
  fontSize: 14,
  fontWeight: "bold",
  color: COLORS.accent,
},

gearStock: {
  marginTop: 2,
  fontSize: 12,
  color: COLORS.textMuted,
},

qtyControl: {
  flexDirection: "row",
  alignItems: "center",
},

qtyText: {
  marginHorizontal: 10,
  fontSize: 16,
  fontWeight: "bold",
  minWidth: 20,
  textAlign: "center",
},

});