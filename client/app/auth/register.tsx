import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthService } from "@/service/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Konstanta warna
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
      const response = await AuthService.register({
        email,
        password,
      });

      console.log("REGISTER SUCCESS:", response.data);

      Alert.alert(
        "Registrasi Berhasil",
        "Silakan login",
        [{ text: "OK", onPress: () => router.replace("/auth/login") }]
      );
    } catch (error: any) {
      console.error("REGISTER ERROR:", error);
      let messageText = "Registrasi gagal";
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        messageText = Array.isArray(msg) ? msg.join("\n") : typeof msg === "object" ? Object.values(msg).flat().join("\n") : msg;
      }
      Alert.alert("Gagal", messageText);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR (DI LUAR KeyboardAvoidingView) */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Daftar</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 2. WRAPPER ANTI KETUTUP KEYBOARD */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* 3. SCROLL VIEW (Penting biar form bisa digulir kalau HP kecil) */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Biar bisa klik tombol walau keyboard nyala
        >
          
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
          
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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
    zIndex: 10,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  // Style untuk ScrollView biar kontennya di tengah
  scrollContent: {
    flexGrow: 1,
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