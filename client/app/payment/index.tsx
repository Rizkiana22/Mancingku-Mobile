import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BookingService } from "@/service/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";

const COLORS = {
  primary: "#0f4c5c",
  background: "#0b3c49",
  white: "#ffffff",
  accent: "#f59f00",
  card: "#0e5a6b",
};

const paymentMethods = [
  { id: "qris", label: "QRIS", icon: "qr-code-outline" },
  { id: "bca", label: "BCA", icon: "card-outline" },
  { id: "mandiri", label: "Mandiri", icon: "business-outline" },
  { id: "dana", label: "Dana", icon: "wallet-outline" },
];

const paymentInfo: Record<string, string> = {
  qris: "SCAN QR CODE DI BAWAH",
  bca: "BCA - 1234567890 a.n Mancingku",
  mandiri: "Mandiri - 0987654321 a.n Mancingku",
  dana: "Dana - 0812 3456 7890",
};

export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedMethod, setSelectedMethod] = useState("qris");

  // modal + fake payment
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [processing, setProcessing] = useState(false);

  // ================= FETCH BOOKING =================
  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.replace("/auth/login");
          return;
        }

        const res = await BookingService.getById(Number(bookingId), token);
        setBooking(res.data);
      } catch {
        Alert.alert("Error", "Gagal mengambil data booking");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // ================= COUNTDOWN =================
  useEffect(() => {
    if (!showModal || processing) return;

    if (countdown === 0) {
      finalizePayment();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, showModal, processing]);

  // ================= PAY CLICK =================
  const handlePay = () => {
    if (!user) {
      Alert.alert("Login dulu", "Silakan login untuk melanjutkan pembayaran");
      return;
    }

    setCountdown(10);
    setShowModal(true);
  };

  // ================= FINALIZE =================
  const finalizePayment = async () => {
    if (processing) return;

    try {
      setProcessing(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      await BookingService.pay(Number(bookingId), token);

      setShowModal(false);

      Alert.alert("Berhasil", "Pembayaran berhasil", [
        { text: "OK", onPress: () => router.replace("/aktivitas") },
      ]);
    } catch (err) {
      console.log("PAY ERROR:", err);
      Alert.alert("Gagal", "Pembayaran gagal");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !booking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  const subtotal = Number(booking.total_amount);
  const pajak = 2500;
  const total = subtotal + pajak;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Mancingku</Text>

        {/* PAYMENT METHOD */}
        <View style={styles.card}>
          {paymentMethods.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.methodItem,
                selectedMethod === item.id && styles.methodActive,
              ]}
              onPress={() => setSelectedMethod(item.id)}
            >
              <Ionicons name={item.icon as any} size={22} color={COLORS.white} />
              <Text style={styles.methodText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RINCIAN */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rincian Biaya</Text>

          <Row
            label="Subtotal Pesanan"
            value={`Rp${subtotal.toLocaleString("id-ID")}`}
          />
          <Row label="Pajak & Layanan" value="Rp2.500" />
          <View style={styles.divider} />
          <Row
            label="Total Pembayaran"
            value={`Rp${total.toLocaleString("id-ID")}`}
            bold
          />
        </View>

        {/* PAY BUTTON */}
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payText}>Lanjutkan Pembayaran</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ================= MODAL ================= */}
      <Modal transparent animationType="fade" visible={showModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {paymentMethods.find((m) => m.id === selectedMethod)?.label}
            </Text>

            <View style={styles.fakeBox}>
              {selectedMethod === "qris" ? (
                <Ionicons name="qr-code" size={120} color={COLORS.primary} />
              ) : (
                <Text style={styles.fakeText}>
                  {paymentInfo[selectedMethod]}
                </Text>
              )}
            </View>

            <Text style={styles.waitText}>Menunggu pembayaran...</Text>
            <Text style={styles.countdown}>{countdown} detik</Text>

            {processing && <ActivityIndicator />}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ================= ROW =================
const Row = ({ label, value, bold }: any) => (
  <View style={styles.row}>
    <Text style={[styles.rowText, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.rowText, bold && styles.bold]}>{value}</Text>
  </View>
);

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", color: COLORS.white, marginBottom: 20 },

  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 16 },
  methodItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  methodActive: {
  backgroundColor: "rgba(255,255,255,0.1)",
  borderRadius: 8,
  transform: [{ translateX: 8 }], 
},
  methodText: { color: COLORS.white, marginLeft: 12 },

  sectionTitle: { color: COLORS.white, fontWeight: "bold", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  rowText: { color: COLORS.white },
  bold: { fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 10 },

  payButton: { backgroundColor: COLORS.accent, padding: 14, borderRadius: 12, alignItems: "center" },
  payText: { fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  fakeBox: { marginVertical: 20 },
  fakeText: { fontSize: 16, textAlign: "center" },
  waitText: { marginTop: 10 },
  countdown: { fontSize: 16, fontWeight: "bold", marginTop: 4 },
});
