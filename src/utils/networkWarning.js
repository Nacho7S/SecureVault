import { Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";

// ============================================================
// WIFI RISK WARNING
// Materi Pertemuan 7: WiFi Security
// Mendeteksi koneksi WiFi dan memberi peringatan risiko
// Berdasarkan ancaman: MITM, Rogue AP, Packet Sniffing
// ============================================================
export const checkNetworkSecurity = async () => {
  try {
    const state = await NetInfo.fetch();

    if (state.type === "wifi") {
      const ssid = state.details?.ssid ?? "tidak diketahui";
      const isSecured = state.details?.isConnectionExpensive === false;

      Alert.alert(
        "⚠️ Peringatan Keamanan Jaringan",
        `Anda terhubung via WiFi: "${ssid}"\n\n` +
        "📡 Risiko WiFi (Materi P7):\n" +
        "• MITM Attack: Penyerang dapat menyadap komunikasi\n" +
        "• Packet Sniffing: Tools seperti Wireshark dapat membaca data\n" +
        "• Rogue AP: Fake access point dapat mencuri kredensial\n\n" +
        "✅ Keamanan SecureVault:\n" +
        "• Data tersimpan lokal, tidak dikirim ke server\n" +
        "• Password terenkripsi AES-256 di database\n" +
        "• Session token di Keychain/Keystore native OS\n\n" +
        "💡 Rekomendasi:\n" +
        "• Gunakan VPN di WiFi publik\n" +
        "• Pastikan WiFi dari sumber terpercaya",
        [{ text: "Saya Mengerti", style: "default" }]
      );
    }
  } catch (e) {
    // Silent fail — tidak mengganggu flow aplikasi
    console.log("Network check error:", e);
  }
};

// Untuk keperluan laporan — deskripsi ancaman WiFi
export const WIFI_THREATS = [
  {
    name: "MITM (Man-in-the-Middle)",
    description: "Penyerang menyadap & memodifikasi komunikasi antara user dan server",
    tool: "Wireshark, WiFi Pineapple",
    mitigation: "Enkripsi end-to-end, VPN, HTTPS only",
  },
  {
    name: "Rogue Access Point",
    description: "Fake AP meniru jaringan terpercaya untuk mencuri data",
    tool: "WiFi Pineapple ($199.99)",
    mitigation: "Verifikasi SSID, gunakan VPN, hindari auto-connect",
  },
  {
    name: "Packet Sniffing",
    description: "Menangkap dan menganalisis paket data di jaringan shared",
    tool: "Wireshark, Aircrack-ng suite",
    mitigation: "Enkripsi data, gunakan WPA3, hindari HTTP",
  },
  {
    name: "Deauthentication Attack",
    description: "Memaksa disconnect user untuk intercept re-authentication",
    tool: "aireplay-ng (Aircrack-ng suite)",
    mitigation: "WPA3 dengan Protected Management Frames (PMF)",
  },
];