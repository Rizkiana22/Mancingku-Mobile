import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ReviewService } from "@/service/api";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function CommentScreen() {
  const { spotId } = useLocalSearchParams<{ spotId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [reviews, setReviews] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await ReviewService.getBySpot(Number(spotId));
      setReviews(res.data);
    } catch (err) {
      console.error("Gagal load review:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // ============================
  // SUBMIT REVIEW (ANTI BOCOR)
  // ============================
  const submitReview = async () => {
    if (!user) {
      Alert.alert("Login dulu", "Silakan login untuk memberi ulasan");
      return;
    }

    const safeRating = Number(rating);

    if (!safeRating || safeRating < 1 || safeRating > 5) {
      Alert.alert("Rating wajib", "Silakan beri rating ⭐ terlebih dahulu");
      return;
    }

    if (!comment.trim()) {
      Alert.alert("Ulasan kosong", "Ulasan tidak boleh kosong");
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);

      await ReviewService.create({
        user_id: user.id,
        spot_id: Number(spotId),
        rating: safeRating, // 🔒 FIX UTAMA
        comment: comment.trim(),
      });

      setComment("");
      setRating(null);
      loadReviews();
    } catch (err: any) {
      console.error("Gagal kirim review:", err?.response?.data || err);
      Alert.alert(
        "Gagal",
        err?.response?.data?.message || "Gagal mengirim ulasan"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    !!user &&
    rating !== null &&
    comment.trim().length > 0 &&
    !submitting;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#014b69" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Ulasan</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          {/* LIST REVIEW */}
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id.toString()}
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => (
              <View style={styles.reviewCard}>
                <Text style={styles.user}>{item.user_name}</Text>
                <Text style={styles.comment}>{item.comment}</Text>
                <Text style={styles.rating}>⭐ {item.rating}</Text>
              </View>
            )}
          />

          {/* INPUT */}
          <View style={styles.bottomSection}>
            {/* STAR */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Ionicons
                    name={
                      rating !== null && star <= rating
                        ? "star"
                        : "star-outline"
                    }
                    size={28}
                    color="#da9723"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* INPUT BOX */}
            <View style={styles.inputBox}>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Tulis ulasan..."
                style={styles.input}
                multiline
              />
              <TouchableOpacity
                onPress={submitReview}
                disabled={!canSubmit}
                style={[
                  styles.sendButton,
                  !canSubmit && styles.sendDisabled,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#014b69" />
                ) : (
                  <Text style={styles.sendText}>Kirim</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================
// STYLES
// ============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#014b69",
  },
  topTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },

  content: { flex: 1, paddingHorizontal: 16 },

  reviewCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    elevation: 2,
  },
  user: { fontWeight: "bold" },
  comment: { marginTop: 4, color: "#333" },
  rating: { marginTop: 4, color: "#da9723" },

  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 10,
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#fff",
    maxHeight: 100,
  },
  sendButton: { 
    paddingHorizontal: 10 
  },
  sendDisabled: { 
    opacity: 0.4 
  },
  sendText: {
    fontWeight: "bold",
    color: "#014b69",
  },
});
