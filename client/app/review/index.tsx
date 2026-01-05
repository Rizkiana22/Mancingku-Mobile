import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,

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
    const COLORS = {
        primary: "#014b69",
        white: "#ffffff",
    };

    const [reviews, setReviews] = useState<any[]>([]);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);


    const insets = useSafeAreaInsets();
    const router = useRouter();
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

    const submitReview = async () => {
        if (!comment.trim()) return;

        try {
            if (!user) {
                return (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Text>Silakan login untuk memberi Ulasan</Text>
                    </View>
                );
            }
            await ReviewService.create({
                user_id: user.id,
                spot_id: Number(spotId),
                rating,
                comment,
            });

            setComment("");
            loadReviews(); // refresh list
        } catch (err) {
            console.error("Gagal kirim review:", err);
        }
    };

    if (loading) {
        return <ActivityIndicator style={{ marginTop: 40 }} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* TOP BAR FULL WIDTH */}
            <View style={[styles.topBar, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={30} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.topTitle}>Ulasan</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* CONTENT */}
            <View style={styles.content}>
                <FlatList
                    data={reviews}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.reviewCard}>
                            <Text style={styles.user}>{item.user_name}</Text>
                            <Text style={styles.comment}>{item.comment}</Text>
                            <Text style={styles.rating}>⭐ {item.rating}</Text>
                        </View>
                    )}
                />

                <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Ionicons
                                name={rating !== null && star <= rating ? "star" : "star-outline"}
                                size={28}
                                color="#da9723"
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.inputBox}>
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Tulis Ulasan..."
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={submitReview}>
                        <Text style={styles.send}>Kirim</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>

    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1

    },

    content: {
        flex: 1,
        padding: 16, // ⬅️ padding cuma untuk isi
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
    reviewCard: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    user: { fontWeight: "bold" },
    comment: { marginTop: 4 },
    rating: { marginTop: 4, color: "#da9723" },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        paddingTop: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
    },
    send: {
        marginLeft: 10,
        color: "#014b69",
        fontWeight: "bold",
    },
    starRow: {
        flexDirection: "row",
        marginBottom: 10,
    },

});
