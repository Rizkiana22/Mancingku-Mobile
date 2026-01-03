// File: client/components/SpotHighlightCard.tsx
import React from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ImageSourcePropType 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Kita pakai 'any' dulu untuk imageSource biar gak rewel error TypeScript
interface SpotHighlightProps {
  title: string;
  location: string;
  rating: number;
  imageSource: any; 
  onPress?: () => void;
}

export default function SpotHighlightCard({
  title,
  location,
  rating,
  imageSource,
  onPress,
}: SpotHighlightProps) {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          📍 {location}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    marginRight: 14,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3, 
  },
  image: {
    width: "100%",
    height: 130,
    backgroundColor: "#eee",
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  info: {
    padding: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: "#666",
  },
});