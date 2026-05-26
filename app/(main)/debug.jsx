import { useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, TextInput
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as SQLite from "expo-sqlite";
import { getSession } from "../../src/security/session";
import { decryptData, caesarEncrypt, caesarDecrypt, caesarBruteForce } from "../../src/security/crypto";
import { WIFI_THREATS } from "../../src/utils/networkWarning";

export default function DebugScreen() {
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  // Caesar demo state
  const [caesarInput, setCaesarInput] = useState("PASSWORD");
  const [caesarShift, setCaesarShift] = useState(3);
  const [showBruteForce, setShowBruteForce] = useState(false);

  useFocusEffect(
    useCallback(() => { loadDebugData(); }, [])
  );

  const loadDebugData = async () => {
    setLoading(true);
    try {
      const currentSession = await getSession();
      setSession(currentSession);
      const db = await SQLite.openDatabaseAsync("securevault.db");
      const rawUsers = await db.getAllAsync("SELECT * FROM users");
      setUsers(rawUsers);
      const rawNotes = await db.getAllAsync("SELECT * FROM password_notes");
      setNotes(rawNotes);
    } catch (e) {
      console.error("Debug load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const tryDecrypt = (encryptedPassword) => {
    if (!session?.encryptionKey) return "❌ Tidak ada session key";
    return decryptData(encryptedPassword, session.encryptionKey) || "❌ Gagal dekripsi";
  };

  const formatDate = (timestamp) =>
    timestamp ? new Date(timestamp).toLocaleString("id-ID") : "-";

  const TABS = [
    { key: "users", label: `👤 Users (${users.length})` },
    { key: "notes", label: `🔐 Notes (${notes.length})` },
    { key: "session", label: "🎫 Session" },
    { key: "kripto", label: "🔑 Kripto" },
    { key: "wifi", label: "📡 WiFi" },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Kembali</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>🛠️ Debug Panel</Text>
          <Text style={styles.subtitle}>Raw Database Inspector</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadDebugData}>
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <Text style={styles.warningText}>
          ⚠️ Halaman ini hanya untuk keperluan dokumentasi & pengujian UTS.
          Tidak boleh ada di aplikasi production.
        </Text>
      </View>

      {/* Tabs - scrollable */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* ============ TAB USERS ============ */}
        {activeTab === "users" && (
          <View>
            <Text style={styles.sectionDesc}>
              Data user di database. Password disimpan sebagai hash SHA-256, bukan plaintext.
            </Text>
            {users.length === 0
              ? <Text style={styles.emptyText}>Belum ada user terdaftar</Text>
              : users.map((user) => (
                <View key={user.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>User #{user.id}</Text>
                    <Text style={styles.cardBadge}>SQLite Row</Text>
                  </View>
                  <Row label="ID" value={user.id.toString()} />
                  <Row label="Username" value={user.username} />
                  <Row label="Password (plaintext)" value="[TIDAK TERSIMPAN]" valueStyle={styles.redText} />
                  <Row label="Password Hash (SHA-256)" value={user.password_hash} valueStyle={styles.hashText} mono />
                  <Row label="Login Attempts" value={user.login_attempts.toString()} valueStyle={user.login_attempts > 0 ? styles.yellowText : styles.greenText} />
                  <Row label="Locked Until" value={user.locked_until > 0 ? formatDate(user.locked_until) : "Tidak terkunci"} valueStyle={user.locked_until > 0 ? styles.redText : styles.greenText} />
                  <Row label="Created At" value={formatDate(user.created_at)} />

                  <View style={styles.comparisonBox}>
                    <Text style={styles.comparisonTitle}>📊 Plaintext vs SHA-256</Text>
                    <View style={styles.comparisonRow}>
                      <View style={[styles.comparisonCard, styles.dangerCard]}>
                        <Text style={styles.comparisonLabel}>❌ Tanpa Hashing</Text>
                        <Text style={styles.comparisonValue}>password123</Text>
                        <Text style={styles.comparisonNote}>Langsung terbaca jika database bocor</Text>
                      </View>
                      <View style={[styles.comparisonCard, styles.safeCard]}>
                        <Text style={styles.comparisonLabel}>✅ SHA-256</Text>
                        <Text style={styles.comparisonValue} numberOfLines={2}>
                          {user.password_hash.substring(0, 20)}...
                        </Text>
                        <Text style={styles.comparisonNote}>One-way hash, tidak bisa dikembalikan</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            }
          </View>
        )}

        {/* ============ TAB NOTES ============ */}
        {activeTab === "notes" && (
          <View>
            <Text style={styles.sectionDesc}>
              Password notes terenkripsi AES-256. Dekripsi hanya bisa dengan key milik user yang login.
            </Text>
            {notes.length === 0
              ? <Text style={styles.emptyText}>Belum ada password note tersimpan</Text>
              : notes.map((note) => (
                <View key={note.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Note #{note.id} — {note.title}</Text>
                    <Text style={styles.cardBadge}>SQLite Row</Text>
                  </View>
                  <Row label="User ID" value={note.user_id.toString()} />
                  <Row label="Title" value={note.title} />
                  <Row label="Website/App" value={note.website_or_app || "-"} />
                  <Row label="Notes" value={note.notes || "-"} />
                  <Row label="Created At" value={formatDate(note.created_at)} />

                  <View style={styles.comparisonBox}>
                    <Text style={styles.comparisonTitle}>🔐 Ciphertext vs Plaintext</Text>
                    <Text style={styles.comparisonLabel}>❌ Raw di Database (AES-256 Ciphertext)</Text>
                    <View style={styles.cipherBox}>
                      <Text style={styles.cipherText}>{note.encrypted_password}</Text>
                    </View>
                    <Text style={[styles.comparisonLabel, { marginTop: 12 }]}>✅ Setelah Dekripsi</Text>
                    <View style={[styles.cipherBox, styles.decryptedBox]}>
                      <Text style={styles.decryptedText}>{tryDecrypt(note.encrypted_password)}</Text>
                    </View>
                    <Text style={styles.comparisonNote}>
                      Key = hash SHA-256 password user. Tanpa login yang benar, ciphertext tidak bisa didekripsi.
                    </Text>
                  </View>
                </View>
              ))
            }
          </View>
        )}

        {/* ============ TAB SESSION ============ */}
        {activeTab === "session" && (
          <View>
            <Text style={styles.sectionDesc}>
              Data session di SecureStore (Keychain iOS / Keystore Android).
              Lebih aman dari AsyncStorage karena dienkripsi oleh OS.
            </Text>
            {!session
              ? <Text style={styles.emptyText}>Tidak ada session aktif</Text>
              : (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Session Aktif</Text>
                    <Text style={[styles.cardBadge, styles.badgeGreen]}>SecureStore</Text>
                  </View>
                  <Row label="User ID" value={session.userId.toString()} />
                  <Row label="Username" value={session.username} />
                  <Row label="Platform" value={session.deviceInfo?.platform ?? "-"} />
                  <Row label="OS Version" value={session.deviceInfo?.version ?? "-"} />
                  <Row label="Login At" value={formatDate(session.loginAt)} />
                  <Row label="Expires At" value={formatDate(session.expiresAt)} />
                  <Row
                    label="Sisa Waktu"
                    value={`${Math.ceil((session.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))} hari`}
                    valueStyle={styles.greenText}
                  />
                  <Row label="Encryption Key (SHA-256)" value={session.encryptionKey} valueStyle={styles.hashText} mono />

                  <View style={styles.comparisonBox}>
                    <Text style={styles.comparisonTitle}>📊 AsyncStorage vs SecureStore</Text>
                    <View style={styles.comparisonRow}>
                      <View style={[styles.comparisonCard, styles.dangerCard]}>
                        <Text style={styles.comparisonLabel}>❌ AsyncStorage</Text>
                        <Text style={styles.comparisonNote}>Plaintext, mudah diakses tool forensik</Text>
                      </View>
                      <View style={[styles.comparisonCard, styles.safeCard]}>
                        <Text style={styles.comparisonLabel}>✅ SecureStore</Text>
                        <Text style={styles.comparisonNote}>Dienkripsi OS, hanya bisa diakses app yang sama</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )
            }
          </View>
        )}

        {/* ============ TAB KRIPTO ============ */}
        {activeTab === "kripto" && (
          <View>
            <Text style={styles.sectionDesc}>
              Demonstrasi perbandingan kriptografi klasik (Caesar Cipher) vs modern (AES-256).
              Berkaitan dengan materi Pertemuan 2 & 3.
            </Text>

            {/* Caesar Cipher Demo */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🏛️ Caesar Cipher (Shift Cipher)</Text>
                <Text style={styles.cardBadge}>Pertemuan 2</Text>
              </View>

              <Text style={styles.formulaText}>e_K(x) = x + K mod 26</Text>
              <Text style={styles.formulaText}>d_K(y) = y - K mod 26</Text>

              <Text style={styles.label}>Input Teks:</Text>
              <TextInput
                style={styles.debugInput}
                value={caesarInput}
                onChangeText={(v) => setCaesarInput(v.replace(/[^a-zA-Z]/g, ""))}
                placeholder="Masukkan teks (huruf saja)"
                placeholderTextColor="#64748b"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Shift (K): {caesarShift}</Text>
              <View style={styles.shiftButtons}>
                {[1, 3, 7, 13, 25].map((k) => (
                  <TouchableOpacity
                    key={k}
                    style={[styles.shiftBtn, caesarShift === k && styles.shiftBtnActive]}
                    onPress={() => setCaesarShift(k)}
                  >
                    <Text style={[styles.shiftBtnText, caesarShift === k && styles.shiftBtnTextActive]}>
                      K={k}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.comparisonRow}>
                <View style={[styles.comparisonCard, styles.dangerCard]}>
                  <Text style={styles.comparisonLabel}>Plaintext</Text>
                  <Text style={styles.cipherResultText}>{caesarInput || "-"}</Text>
                </View>
                <View style={[styles.comparisonCard, styles.warnCard]}>
                  <Text style={styles.comparisonLabel}>Ciphertext (Caesar)</Text>
                  <Text style={styles.cipherResultText}>
                    {caesarInput ? caesarEncrypt(caesarInput, caesarShift) : "-"}
                  </Text>
                </View>
              </View>

              <View style={styles.weaknessBox}>
                <Text style={styles.weaknessTitle}>⚠️ Kelemahan Caesar Cipher</Text>
                <Text style={styles.weaknessText}>
                  Hanya 26 kemungkinan kunci (K=0 s/d K=25). Dapat dipecahkan dengan
                  exhaustive key search dalam hitungan detik.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.bruteForceBtn}
                onPress={() => setShowBruteForce(!showBruteForce)}
              >
                <Text style={styles.bruteForceBtnText}>
                  {showBruteForce ? "▲ Sembunyikan" : "▼ Simulasi Brute Force (26 kunci)"}
                </Text>
              </TouchableOpacity>

              {showBruteForce && caesarInput && (
                <View style={styles.bruteForceList}>
                  <Text style={styles.comparisonLabel}>Semua kemungkinan dekripsi:</Text>
                  {caesarBruteForce(caesarEncrypt(caesarInput, caesarShift)).map((item) => (
                    <View key={item.shift} style={[
                      styles.bruteForceRow,
                      item.shift === caesarShift && styles.bruteForceRowMatch
                    ]}>
                      <Text style={styles.bruteForceKey}>K={item.shift}</Text>
                      <Text style={styles.bruteForceResult}>{item.result}</Text>
                      {item.shift === caesarShift && (
                        <Text style={styles.bruteForceMatch}>✓ Match!</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* AES-256 Comparison */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🔐 AES-256 (SecureVault)</Text>
                <Text style={[styles.cardBadge, styles.badgeGreen]}>Pertemuan 3</Text>
              </View>

              <View style={styles.comparisonBox}>
                <Text style={styles.comparisonTitle}>📊 Perbandingan Keamanan</Text>
                <View style={{ gap: 8 }}>
                  <CompareRow label="Keyspace" bad="26 kunci (Caesar)" good="2²⁵⁶ kunci (AES-256)" />
                  <CompareRow label="Brute Force" bad="Selesai < 1 detik" good="Tidak mungkin secara komputasi" />
                  <CompareRow label="Jenis" bad="Substitusi sederhana" good="Block Cipher (128-bit block)" />
                  <CompareRow label="Prinsip Shannon" bad="Tidak memenuhi" good="Confusion + Diffusion terpenuhi" />
                  <CompareRow label="Digunakan untuk" bad="Demo saja" good="Enkripsi password notes" />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ============ TAB WIFI ============ */}
        {activeTab === "wifi" && (
          <View>
            <Text style={styles.sectionDesc}>
              Analisis ancaman WiFi berdasarkan materi Pertemuan 7.
              Relevan karena SecureVault bisa digunakan saat terhubung ke WiFi publik.
            </Text>

            {WIFI_THREATS.map((threat, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>⚠️ {threat.name}</Text>
                  <Text style={[styles.cardBadge, { backgroundColor: "#450a0a" }]}>
                    <Text style={{ color: "#fca5a5" }}>Ancaman</Text>
                  </Text>
                </View>
                <Row label="Deskripsi" value={threat.description} />
                <Row label="Tool yang digunakan" value={threat.tool} valueStyle={styles.yellowText} />
                <Row label="Mitigasi" value={threat.mitigation} valueStyle={styles.greenText} />

                {/* Relevansi ke SecureVault */}
                <View style={[styles.comparisonBox, { marginTop: 8 }]}>
                  <Text style={styles.comparisonTitle}>🛡️ Perlindungan di SecureVault</Text>
                  {threat.name.includes("MITM") && (
                    <Text style={styles.comparisonNote}>
                      Data tidak dikirim ke server, tersimpan lokal. Tidak ada traffic yang bisa disadap.
                      Enkripsi AES-256 melindungi data meski perangkat dikompromikan.
                    </Text>
                  )}
                  {threat.name.includes("Rogue") && (
                    <Text style={styles.comparisonNote}>
                      Aplikasi offline — tidak bergantung pada koneksi internet.
                      Session token di SecureStore tidak bisa dicuri via network.
                    </Text>
                  )}
                  {threat.name.includes("Sniffing") && (
                    <Text style={styles.comparisonNote}>
                      Network Security Config memblokir HTTP plaintext.
                      Tidak ada data sensitif yang dikirim melalui jaringan.
                    </Text>
                  )}
                  {threat.name.includes("Deauthentication") && (
                    <Text style={styles.comparisonNote}>
                      Aplikasi tetap berfungsi offline. Session tersimpan lokal di SecureStore,
                      tidak terpengaruh disconnect jaringan.
                    </Text>
                  )}
                </View>
              </View>
            ))}

            {/* Protocol Security */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🔒 Protokol Keamanan WiFi</Text>
                <Text style={styles.cardBadge}>Materi P7</Text>
              </View>
              {[
                { proto: "WEP", level: "❌ Tidak Aman", desc: "Mudah di-crack dengan Aircrack-ng, harus dihindari", color: styles.redText },
                { proto: "WPA", level: "⚠️ Lemah", desc: "TKIP sudah rentan, tidak direkomendasikan", color: styles.yellowText },
                { proto: "WPA2 + AES", level: "✅ Aman", desc: "Standar minimum yang direkomendasikan saat ini", color: styles.greenText },
                { proto: "WPA3", level: "✅✅ Sangat Aman", desc: "SAE handshake, Protected Management Frames", color: styles.greenText },
              ].map((item) => (
                <View key={item.proto} style={styles.protocolRow}>
                  <Text style={styles.protocolName}>{item.proto}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={item.color}>{item.level}</Text>
                    <Text style={styles.protocolDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ---- Helper Components ----
function Row({ label, value, valueStyle, mono }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.monoText, valueStyle]} numberOfLines={mono ? 3 : 2}>
        {value}
      </Text>
    </View>
  );
}

function CompareRow({ label, bad, good }) {
  return (
    <View style={styles.compareRow}>
      <Text style={styles.compareLabel}>{label}</Text>
      <View style={styles.compareValues}>
        <Text style={[styles.compareBad]}>✗ {bad}</Text>
        <Text style={[styles.compareGood]}>✓ {good}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 24, paddingTop: 60 },
  backBtn: { color: "#6366f1", fontSize: 15 },
  title: { fontSize: 18, fontWeight: "bold", color: "#f1f5f9", textAlign: "center" },
  subtitle: { fontSize: 12, color: "#64748b", textAlign: "center" },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#1e293b", justifyContent: "center", alignItems: "center" },
  refreshBtnText: { color: "#6366f1", fontSize: 20 },
  warningBanner: { backgroundColor: "#451a03", borderLeftWidth: 4, borderLeftColor: "#f59e0b", marginHorizontal: 16, borderRadius: 8, padding: 12, marginBottom: 8 },
  warningText: { color: "#fbbf24", fontSize: 12, lineHeight: 18 },
  tabsScroll: { maxHeight: 48, marginBottom: 8 },
  tabs: { flexDirection: "row", paddingHorizontal: 16, gap: 8, alignItems: "center" },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  tabActive: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  tabText: { color: "#64748b", fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  content: { flex: 1, paddingHorizontal: 16 },
  sectionDesc: { color: "#64748b", fontSize: 13, lineHeight: 20, marginBottom: 16, fontStyle: "italic" },
  emptyText: { color: "#64748b", textAlign: "center", marginTop: 40, fontSize: 14 },
  card: { backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#334155" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#334155" },
  cardTitle: { color: "#f1f5f9", fontWeight: "bold", fontSize: 14, flex: 1, marginRight: 8 },
  cardBadge: { backgroundColor: "#312e81", color: "#a5b4fc", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 11, fontWeight: "600" },
  badgeGreen: { backgroundColor: "#14532d", color: "#86efac" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#0f172a" },
  rowLabel: { color: "#64748b", fontSize: 12, flex: 1, marginRight: 8 },
  rowValue: { color: "#94a3b8", fontSize: 12, flex: 2, textAlign: "right" },
  monoText: { fontFamily: "monospace", fontSize: 10, color: "#a5b4fc" },
  hashText: { fontFamily: "monospace", fontSize: 9, color: "#a5b4fc" },
  greenText: { color: "#22c55e" },
  yellowText: { color: "#f59e0b" },
  redText: { color: "#ef4444" },
  comparisonBox: { backgroundColor: "#0f172a", borderRadius: 12, padding: 14, marginTop: 12 },
  comparisonTitle: { color: "#f1f5f9", fontWeight: "600", fontSize: 13, marginBottom: 12 },
  comparisonRow: { flexDirection: "row", gap: 8 },
  comparisonCard: { flex: 1, borderRadius: 10, padding: 10 },
  dangerCard: { backgroundColor: "#450a0a", borderWidth: 1, borderColor: "#7f1d1d" },
  safeCard: { backgroundColor: "#052e16", borderWidth: 1, borderColor: "#14532d" },
  warnCard: { backgroundColor: "#451a03", borderWidth: 1, borderColor: "#78350f" },
  comparisonLabel: { fontSize: 11, fontWeight: "700", marginBottom: 6, color: "#94a3b8" },
  comparisonValue: { fontSize: 10, fontFamily: "monospace", color: "#e2e8f0", marginBottom: 4 },
  comparisonNote: { fontSize: 11, color: "#64748b", lineHeight: 16, marginTop: 4 },
  cipherBox: { backgroundColor: "#0f172a", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#334155", marginTop: 4 },
  cipherText: { fontFamily: "monospace", fontSize: 10, color: "#ef4444", lineHeight: 16 },
  decryptedBox: { borderColor: "#14532d" },
  decryptedText: { fontFamily: "monospace", fontSize: 12, color: "#22c55e", fontWeight: "600" },

  // Caesar demo
  label: { color: "#94a3b8", fontSize: 13, marginBottom: 8, marginTop: 12 },
  debugInput: { backgroundColor: "#0f172a", color: "#f1f5f9", borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: "#334155", fontFamily: "monospace", marginBottom: 4 },
  formulaText: { fontFamily: "monospace", fontSize: 13, color: "#a5b4fc", marginBottom: 4, textAlign: "center" },
  shiftButtons: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  shiftBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#334155" },
  shiftBtnActive: { backgroundColor: "#6366f1", borderColor: "#6366f1" },
  shiftBtnText: { color: "#94a3b8", fontSize: 13 },
  shiftBtnTextActive: { color: "#fff", fontWeight: "600" },
  cipherResultText: { fontFamily: "monospace", fontSize: 14, color: "#f1f5f9", fontWeight: "bold", marginTop: 4 },
  weaknessBox: { backgroundColor: "#451a03", borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1, borderColor: "#78350f" },
  weaknessTitle: { color: "#fbbf24", fontWeight: "600", fontSize: 13, marginBottom: 6 },
  weaknessText: { color: "#d97706", fontSize: 12, lineHeight: 18 },
  bruteForceBtn: { backgroundColor: "#1e293b", borderRadius: 10, padding: 12, alignItems: "center", marginTop: 12, borderWidth: 1, borderColor: "#334155" },
  bruteForceBtnText: { color: "#6366f1", fontWeight: "600", fontSize: 13 },
  bruteForceList: { backgroundColor: "#0f172a", borderRadius: 10, padding: 12, marginTop: 8 },
  bruteForceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#1e293b", gap: 8 },
  bruteForceRowMatch: { backgroundColor: "#052e16", borderRadius: 6, paddingHorizontal: 4 },
  bruteForceKey: { color: "#64748b", fontSize: 11, width: 36, fontFamily: "monospace" },
  bruteForceResult: { color: "#94a3b8", fontSize: 11, fontFamily: "monospace", flex: 1 },
  bruteForceMatch: { color: "#22c55e", fontSize: 11, fontWeight: "bold" },

  // CompareRow
  compareRow: { backgroundColor: "#1e293b", borderRadius: 8, padding: 10, marginBottom: 6 },
  compareLabel: { color: "#94a3b8", fontSize: 12, marginBottom: 6, fontWeight: "600" },
  compareValues: { gap: 4 },
  compareBad: { color: "#ef4444", fontSize: 11 },
  compareGood: { color: "#22c55e", fontSize: 11 },

  // WiFi
  protocolRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12, gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#0f172a" },
  protocolName: { color: "#f1f5f9", fontWeight: "bold", fontSize: 13, width: 60 },
  protocolDesc: { color: "#64748b", fontSize: 11, marginTop: 2 },
});