import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function MenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kategori Perlengkapan</Text>

      {/* Link yang BENAR sesuai folder 'equipment' */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/equipment/umpan")}
      >
        <Text>🐟 Umpan Jitu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/equipment/alat")}
      >
        <Text>🎣 Alat Pancing</Text>
      </TouchableOpacity>
    </View>
  );
}

/* */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, marginBottom: 20, fontWeight: "bold" },
  card: {
    padding: 20,
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 8,
  },
});
