import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Aktifkan LayoutAnimation untuk Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================================
// CONSTANTS
// ============================================================================
const COLORS = {
  primary: "#014b69",
  background: "#f8f9fa",
  white: "#ffffff",
  textMain: "#333333",
  textMuted: "#666666",
  border: "#eeeeee",
  success: "#25D366", // Warna WA
};

// Data Dummy FAQ
const FAQ_DATA = [
  {
    id: 1,
    question: "Bagaimana cara booking spot mancing?",
    answer: "Pilih menu 'Cari Spot', pilih lokasi yang diinginkan, pilih sesi waktu, lalu klik 'Lanjutkan Pemesanan' dan selesaikan pembayaran.",
  },
  {
    id: 2,
    question: "Metode pembayaran apa saja yang tersedia?",
    answer: "Saat ini kami mendukung transfer bank (BCA dan Mandiri) serta E-Wallet (QRIS dan Dana).",
  },
  {
    id: 3,
    question: "Apakah tiket bisa di-refund?",
    answer: "Tiket yang sudah dibeli tidak dapat dibatalkan atau diuangkan kembali (Non-Refundable), kecuali ada pembatalan dari pihak pemancingan.",
  },
  {
    id: 4,
    question: "Bagaimana jika cuaca buruk?",
    answer: "Beberapa kolam pemancingan memiliki atap (semi-indoor). Namun jika kondisi ekstrim, silakan hubungi admin spot terkait untuk reschedule.",
  },
];

// ============================================================================
// COMPONENT: FAQ ITEM (ACCORDION)
// ============================================================================
const AccordionItem = ({ item, expanded, onPress }: any) => {
  return (
    <View style={styles.faqCard}>
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqBody}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// COMPONENT: CONTACT BUTTON
// ============================================================================
const ContactButton = ({ icon, label, subLabel, onPress, color }: any) => (
  <TouchableOpacity style={styles.contactItem} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.contactText}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactSub}>{subLabel}</Text>
    </View>
    <Ionicons name="arrow-forward" size={20} color={COLORS.textMuted} />
  </TouchableOpacity>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function CustomerServiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Toggle Accordion
  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  // Logic Buka WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = "xxx-xxx-xxx";
    const text = "Halo Admin Mancingku, saya butuh bantuan.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${text}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        alert("WhatsApp tidak terinstall di HP ini.");
      }
    });
  };

  // Logic Email
  const openEmail = () => {
    Linking.openURL("mailto:support@mancingku.com?subject=Bantuan Aplikasi");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pusat Bantuan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SECTION: HUBUNGI KAMI */}
        <Text style={styles.sectionTitle}>Hubungi Kami</Text>
        <View style={styles.card}>
          <ContactButton
            icon="logo-whatsapp"
            label="WhatsApp Admin"
            subLabel="Respon Cepat (08:00 - 20:00)"
            color="#25D366"
            onPress={openWhatsApp}
          />
          <View style={styles.divider} />
          <ContactButton
            icon="mail-outline"
            label="Email Support"
            subLabel="support@mancingku.com"
            color="#EA4335"
            onPress={openEmail}
          />
        </View>

        {/* SECTION: FAQ */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Pertanyaan Umum (FAQ)
        </Text>
        
        {FAQ_DATA.map((item) => (
          <AccordionItem
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onPress={() => toggleExpand(item.id)}
          />
        ))}

        {/* FOOTER TEXT */}
        <Text style={styles.footerText}>
          Masih butuh bantuan? Jangan ragu untuk menghubungi kami melalui WhatsApp.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  backBtn: {
    width: 40,
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textMain,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textMain,
  },
  contactSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 58, // Biar garisnya gak nabrak icon
  },
  // FAQ Styles
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
    flex: 1,
    marginRight: 10,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fcfcfc",
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 30,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});