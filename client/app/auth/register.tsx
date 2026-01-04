import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthService } from "@/service/api";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Konstanta warna (konsisten sama Login)
const COLORS = {
  primary: "#014b69",
  white: "#ffffff",
  background: "#f0f2f5",
  textMuted: "#666666",
  danger: "#d32f2f",
};

export default function Register() {
  const router = useRouter();
    const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Validasi input
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Semua field wajib diisi!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Password dan konfirmasi tidak sama!");
      return;
    }

    setLoading(true);

    try {
      // 2. Panggil API register
      const response = await AuthService.register({
        email,
        password,
      });

      const { data } = response;
      console.log("REGISTER SUCCESS:", data);

      Alert.alert("Registrasi berhasil, silakan login", [
        {
          text: "OK",
          onPress: () => router.replace("/auth/login"),
        },
      ]);
    } catch (error: any) {
      console.error("REGISTER ERROR:", error);

      if (error.response) {
        Alert.alert("Gagal", error.response.data.message || "Registrasi gagal");
      } else if (error.request) {
        Alert.alert("Koneksi Error", "Tidak dapat terhubung ke server.");
      } else {
        Alert.alert("Error", "Terjadi kesalahan sistem.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
  <SafeAreaView style={styles.container}>
    {/* ===== TOP BAR ===== */}
    <View style={[styles.topBar, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color={COLORS.white} />
      </TouchableOpacity>

      <Text style={styles.topTitle}>Daftar</Text>
      <View style={{ width: 24 }} />
    </View>

    {/* ===== CONTENT (SAMA KAYA LOGIN) ===== */}
    <View style={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Daftar Akun</Text>
        <Text style={styles.subtitle}>
          Buat akun untuk mulai booking spot
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          placeholder="Konfirmasi Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Daftar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => router.replace("/auth/login")}
        >
          <Text style={{ color: COLORS.primary, textAlign: "center" }}>
            Sudah punya akun? <Text style={{ fontWeight: "bold" }}>Masuk</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </SafeAreaView>
);

}

// Styles (konsisten sama Login)
const styles = StyleSheet.create({
  container: {
  flex: 1,
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
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  content: {
  flex: 1,
  justifyContent: "center",
  padding: 20,
},

  card: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});
