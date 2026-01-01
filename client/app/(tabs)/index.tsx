import { Image, StyleSheet, Platform, View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.judul}>🎣 Mancingku</Text>
      <Text style={styles.deskripsi}>
        Selamat datang di aplikasi Mancingku!
        Ini adalah halaman (tabs)/index.tsx
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  judul: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginBottom: 10,
  },
  deskripsi: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
});