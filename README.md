# 🔐 SecureVault

Aplikasi manajemen password lokal dengan enkripsi AES-256, hashing SHA-256, dan proteksi brute-force. Dibangun menggunakan **React Native + Expo** untuk platform iOS & Android.

> 📚 Proyek ini dibuat untuk keperluan dokumentasi & pembelajaran mata kuliah Keamanan Informasi (UTS).

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🔐 **Enkripsi AES-256** | Password notes dienkripsi sebelum disimpan ke database lokal |
| 🔑 **Hashing SHA-256** | Password user di-hash one-way, tidak pernah tersimpan plaintext |
| 🛡️ **Brute Force Protection** | Maksimal 5x percobaan login salah → akun terkunci 15 menit |
| 📱 **Secure Session** | Session token disimpan di Keychain (iOS) / Keystore (Android) via SecureStore |
| 🔢 **Password Generator** | Generate password kuat dengan custom panjang & karakter |
| 📡 **WiFi Security Warning** | Deteksi koneksi WiFi & peringatan risiko MITM, Rogue AP, Packet Sniffing |
| 🛠️ **Debug Panel** | Inspeksi raw database, demo Caesar Cipher vs AES-256, analisis ancaman WiFi |
| 🌐 **Network Security** | Memblokir semua koneksi HTTP plaintext (cleartextTrafficPermitted="false") |

---

## 🏗️ Struktur Folder

```
SecureVault/
├── app/                          # Expo Router file-based routing
│   ├── _layout.jsx             # Root layout + auth guard & init database
│   ├── index.jsx               # Redirect ke login/dashboard
│   ├── (auth)/                 # Group route: autentikasi
│   │   ├── login.jsx
│   │   └── register.jsx
│   └── (main)/                 # Group route: aplikasi utama
│       ├── dashboard.jsx       # Home: list password notes
│       ├── add-note.jsx        # Tambah password baru + generator
│       ├── view-note.jsx       # Detail & copy password
│       └── debug.jsx           # Panel debugging & edukasi kripto
├── src/
│   ├── components/
│   │   └── AuthForm.jsx        # Reusable form komponen auth
│   ├── database/
│   │   └── db.js               # SQLite: users & password_notes table
│   ├── security/
│   │   ├── crypto.js           # SHA-256, AES-256, Caesar Cipher
│   │   └── session.js          # SecureStore session management
│   ├── styles/
│   │   ├── authStyles.js
│   │   ├── colors.js
│   │   └── mainStyles.js
│   └── utils/
│       ├── networkWarning.js   # WiFi security detection & alerts
│       └── passwordGen.js      # Password generator + strength checker
├── .env                        # Environment variables
├── app.json                    # Expo configuration
├── network_security_config.xml # Android: blok HTTP plaintext
└── package.json
```

---

## 🚀 Instalasi

### Prasyarat
- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (untuk emulator) atau Expo Go di device

### Langkah-langkah

```bash
# 1. Clone repository
git clone <repo-url>
cd SecureVault

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env

# 4. Jalankan aplikasi
npx expo start
```

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root project:

```env
# Session Configuration
EXPO_PUBLIC_SESSION_KEY=securevault_session_v1
EXPO_PUBLIC_SESSION_DURATION_DAYS=15
```

> ⚠️ **Penting**: Ganti `SESSION_KEY` dengan nilai unik untuk production. Key ini digunakan sebagai identifier penyimpanan di SecureStore.

---

## 🔒 Arsitektur Keamanan

### 1. Autentikasi & Session
```
[User Input Password]
    ↓
[SHA-256 Hash] ──→ [Compare dengan DB]
    ↓
[Save Session] ──→ [SecureStore (Keychain/Keystore)]
    ↓
[Session Valid 15 Hari]
```

### 2. Penyimpanan Password Notes
```
[Input Password]
    ↓
[AES-256 Encrypt] ──→ key = SHA-256 hash password user
    ↓
[Store Ciphertext] ──→ SQLite database
```

### 3. Proteksi Brute Force
- Counter login attempts per user di database
- Setelah 5x gagal: `locked_until = now + 15 menit`
- Reset counter setelah login berhasil

### 4. Keamanan Jaringan
- `network_security_config.xml`: `cleartextTrafficPermitted="false"`
- Semua traffic wajib HTTPS (tidak ada HTTP plaintext)
- WiFi Warning untuk edukasi user tentang ancaman jaringan

---

## 📚 Materi Pembelajaran (UTS)

Aplikasi ini mencakup beberapa materi perkuliahan:

| Pertemuan | Materi | Implementasi |
|-----------|--------|--------------|
| P2 | Caesar Cipher | `crypto.js` — demo enkripsi klasik + brute force simulation |
| P3 | AES-256 | `crypto.js` — enkripsi modern untuk password notes |
| P4 | Hashing (SHA-256) | `crypto.js` — password hashing & encryption key |
| P5 | Database Security | `db.js` — SQLite dengan foreign key, WAL mode |
| P6 | Session Management | `session.js` — SecureStore vs AsyncStorage comparison |
| P7 | WiFi Security | `networkWarning.js` — MITM, Rogue AP, Packet Sniffing detection |

---

## 🛠️ Debug Panel

Panel debug (`/(main)/debug`) menyediakan:

- **👤 Users**: Inspeksi tabel `users` — lihat hash vs plaintext comparison
- **🔐 Notes**: Lihat ciphertext & plaintext (setelah dekripsi dengan session key)
- **🎫 Session**: Detail session di SecureStore + perbandingan dengan AsyncStorage
- **🔑 Kripto**: Demo Caesar Cipher (shift 1-25) + simulasi brute force 26 kunci + perbandingan AES-256
- **📡 WiFi**: Analisis 4 ancaman WiFi + protokol keamanan (WEP → WPA3)

> ⚠️ **Panel debug hanya untuk keperluan pengujian & dokumentasi UTS. Harus dihapus/didisabled sebelum production.**

---

## 📦 Dependencies Utama

| Package | Fungsi |
|---------|--------|
| `expo` | Framework React Native |
| `expo-router` | File-based navigation |
| `expo-sqlite` | Database lokal |
| `expo-secure-store` | Penyimpanan session terenkripsi OS |
| `expo-crypto` | SHA-256 hashing native |
| `expo-clipboard` | Copy password ke clipboard |
| `crypto-js` | AES-256 enkripsi/dekripsi |
| `@react-native-community/netinfo` | Deteksi status jaringan |

---

## 📝 Catatan Pengembangan

1. **Font Monospace**: Debug panel menggunakan font monospace untuk menampilkan hash & ciphertext. Pastikan device mendukung font family `monospace`.

2. **WAL Mode**: Database SQLite diaktifkan dengan `PRAGMA journal_mode = WAL` untuk performa baca-tulis yang lebih baik.

3. **Caesar Cipher Limitation**: Demo Caesar hanya mendukung huruf A-Z (uppercase). Input akan difilter otomatis.

4. **Android Adaptive Icon**: Sudah dikonfigurasi dengan background, foreground, dan monochrome image sesuai Material You guidelines.

---

## ⚠️ Disclaimer

Aplikasi ini dibuat untuk **tujuan edukasi dan demonstrasi** konsep keamanan informasi:

- Debug panel mengekspos raw database — **tidak untuk production**
- Caesar Cipher adalah kriptografi klasik yang **sangat lemah** — hanya untuk pembelajaran
- Selalu gunakan **WPA3 atau WPA2-AES** untuk WiFi pribadi
- Untuk production, pertimbangkan tambahan: biometric lock, auto-lock app, backup encrypted

---

## 👨‍💻 Author

**Nacha** — Dibuat untuk UTS Keamanan Informasi

---

