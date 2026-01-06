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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { AuthService } from "@/service/api";

// ==================
// COLORS
// ==================
const COLORS = {
  primary: "#014b69",
  background: "#f0f2f5",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
};

// ==================
// SCREEN
// ==================
export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan Password wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.login({ email, password });
      const { data } = response;

      if (data.token) {
        await signIn(data.token, data.user);
        router.replace("/(tabs)/beranda");
      } else {
        Alert.alert("Login Gagal", data.message || "Token tidak diterima");
      }
    } catch (error: any) {
      Alert.alert(
        "Login Gagal",
        error?.response?.data?.message || "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ================= TOP BAR (Di Luar KAV) ================= */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Login</Text>

        {/* spacer biar title center */}
        <View style={{ width: 24 }} />
      </View>

      {/* ================= KEYBOARD HANDLING ================= */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* ScrollView biar bisa discroll kalau layar kekecilan */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Biar tombol bisa diklik langsung
        >
          
          <View style={styles.card}>
            <Text style={styles.title}>Mancingku 🎣</Text>
            <Text style={styles.subtitle}>
              Masuk untuk mulai booking spot
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

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Masuk</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 20 }}
              onPress={() => router.push("/auth/register")}
            >
              <Text style={styles.registerText}>
                Belum punya akun? <Text style={{ fontWeight: "bold" }}>Daftar</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ==================
// STYLES
// ==================
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

  // Style untuk ScrollView biar kontennya di tengah vertikal
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
    fontSize: 28,
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
  registerText: {
    color: COLORS.primary,
    textAlign: "center",
  },
});