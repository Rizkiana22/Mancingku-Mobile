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
import { AuthService } from "@/service/api";

// Konstanta warna (konsisten sama Login)
const COLORS = {
  primary: "#014b69",
  white: "#ffffff",
  textMuted: "#666666",
  danger: "#d32f2f",
};

export default function Register() {
  const router = useRouter();

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

      Alert.alert("Berhasil 🎉", "Registrasi berhasil, silakan login", [
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
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Daftar Akun 🎣</Text>
        <Text style={styles.subtitle}>Buat akun untuk mulai booking spot</Text>

        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {/* Password */}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {/* Konfirmasi Password */}
        <TextInput
          placeholder="Konfirmasi Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />

        {/* Button Register */}
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

        {/* Link ke Login */}
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
  );
}

// Styles (konsisten sama Login)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
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
