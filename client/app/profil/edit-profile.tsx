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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { UserService } from "@/service/api";

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
  const { user } = useAuth(); // Note: Kalau ada fungsi update local user, bisa dipake di sini

  // State Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // State Loading
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ============================================================================
  // 1. AMBIL DATA TERBARU
  // ============================================================================
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!user?.id) return;

      try {
        setIsFetching(true);
        const response = await UserService.getById(user.id);
        const userData = response.data.data || response.data;

        setName(userData.name || "");
        setPhone(userData.phone || "");
      } catch (error) {
        console.error("Gagal ambil profil:", error);
        // Fallback ke data context kalau API gagal
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
      const updateData = {
        name: name,
        phone: phone,
      };

      await UserService.update(user!.id, updateData);

      Alert.alert("Sukses", "Profil berhasil diperbarui!", [
        { 
            text: "OK", 
            onPress: () => {
                // Opsional: Kalau di AuthContext ada fungsi refreshUser(), panggil di sini
                router.back(); 
            } 
        }
      ]);
    } catch (error) {
      console.error("Gagal update:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Silakan login dulu.</Text>
      </View>
    );
  }

  if (isFetching) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. HEADER (DI LUAR KEYBOARD AVOIDING VIEW) */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Edit Profil</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 2. WRAPPER KONTEN + FOOTER */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
            
          {/* SCROLLABLE FORM */}
          <ScrollView 
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
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

          {/* FOOTER (BUTTON SIMPAN) */}
          <View style={[styles.footer, { paddingBottom: 20 + (Platform.OS === 'ios' ? 0 : 0) }]}>
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

        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  center: { 
    justifyContent: "center", 
    alignItems: "center" 
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 15,
    backgroundColor: COLORS.primary,
    zIndex: 10,
  },
  topTitle: { 
    fontSize: 18, 
    fontWeight: "bold",
    color: COLORS.white 
},
  content: { 
    paddingVertical: 20 
  },
  formContainer: { 
    paddingHorizontal: 20 
  },
  headerForm: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: COLORS.primary, 
    marginBottom: 20 
  },
  
  inputGroup: { 
    marginBottom: 20 
  },
  label: { 
    marginBottom: 8, 
    fontWeight: 'bold', 
    color: COLORS.textMain, 
    fontSize: 14 
  },
  
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.border,
    height: 50
  },
  input: { 
    flex: 1, 
    marginLeft: 10, 
    fontSize: 16, 
    color: COLORS.textMain 
  },
  readOnlyInput: { 
    backgroundColor: '#e9ecef', 
    borderColor: 'transparent' 
  },
  helperText: { 
    fontSize: 12, 
    color: COLORS.textMuted, 
    marginTop: 4, 
    fontStyle: 'italic' 
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, 
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15, borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});