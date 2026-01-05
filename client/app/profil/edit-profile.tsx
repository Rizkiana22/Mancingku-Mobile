import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { UserService } from "@/service/api"; // Pastikan import ini benar

const COLORS = {
  primary: "#014b69",
  background: "#f8f9fa",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  border: "#dddddd",
};

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // State Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // State Loading
  const [isSaving, setIsSaving] = useState(false); // Loading saat simpan
  const [isFetching, setIsFetching] = useState(true); // Loading saat ambil data awal

  // ============================================================================
  // 1. AMBIL DATA TERBARU DARI DB SAAT HALAMAN DIBUKA
  // ============================================================================
  if (!user) {
  return (
    <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
      <Text>Silakan login untuk mengedit profil</Text>
    </SafeAreaView>
  );
}

  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!user?.id) return;

      try {
        
        setIsFetching(true);
        const response = await UserService.getById(user.id);
        
        // Sesuaikan struktur response backend kamu
        // Biasanya: response.data.data ATAU response.data
        const userData = response.data.data || response.data;

        // ISI FORM DENGAN DATA DATABASE
        // Jika null, ganti string kosong "" agar tidak error di TextInput
        setName(userData.name || ""); 
        setPhone(userData.phone || "");

      } catch (error) {
        console.error("Gagal mengambil data profil:", error);
        // Fallback: Jika gagal fetch API, pakai data dari AuthContext sementara
        setName(user.name || "");
        setPhone(user.phone || "");
      } finally {
        setIsFetching(false);
      }
    };

    fetchLatestProfile();
  }, [user?.id]);

  // ============================================================================
  // 2. FUNGSI SIMPAN
  // ============================================================================
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Peringatan", "Nama tidak boleh kosong.");
      return;
    }

    setIsSaving(true);

    try {
      // Kita kirim 'name' dan 'phone' yang ada di State.
      // Karena state sudah diisi data lama di useEffect, 
      // data yang tidak diedit akan tetap aman (tidak jadi kosong).
      const updateData = {
        name: name,
        phone: phone,
      };
      
      const response = await UserService.update(user.id, updateData);

      if (response.data) {
        Alert.alert("Sukses", "Profil berhasil diperbarui!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error("Gagal update profil:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  // Tampilan Loading Awal (Supaya user tidak lihat form kosong berkedip)
  if (isFetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textMuted }}>Memuat data profil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Edit Profil</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.headerForm}>Informasi Pribadi</Text>

            {/* Input Nama */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Masukkan nama lengkap"
                />
              </View>
            </View>

            {/* Input Email (Read Only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, styles.readOnlyInput]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={[styles.input, { color: COLORS.textMuted }]}
                  value={user?.email}
                  editable={false}
                />
                <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} />
              </View>
              <Text style={styles.helperText}>Email tidak dapat diubah.</Text>
            </View>

            {/* Input Telepon */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nomor Telepon</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Contoh: 0812xxxx"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 15,
    backgroundColor: COLORS.primary,
  },
  topTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.white },
  content: { paddingVertical: 20 },
  formContainer: { paddingHorizontal: 20 },
  headerForm: { fontSize: 16, fontWeight: "bold", color: COLORS.primary, marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { marginBottom: 8, fontWeight: 'bold', color: COLORS.textMain, fontSize: 14 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.border,
    height: 50
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: COLORS.textMain },
  readOnlyInput: { backgroundColor: '#e9ecef', borderColor: 'transparent' },
  helperText: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15, borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
});