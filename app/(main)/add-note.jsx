import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ScrollView, Switch, ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { getSession } from "../../src/security/session";
import { encryptData } from "../../src/security/crypto";
import { createNote } from "../../src/database/db";
import { generatePassword, checkPasswordStrength } from "../../src/utils/passwordGen";
import { mainStyles, addNoteStyles } from "../../src/styles/mainStyles";
import { colors } from "../../src/styles/colors";


export default function AddNoteScreen() {
  const [title, setTitle] = useState("");
  const [websiteOrApp, setWebsiteOrApp] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [genLength, setGenLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

  const passwordStrength = password ? checkPasswordStrength(password) : null;

  const handleGenerate = () => {
    const generated = generatePassword({
      length: genLength,
      useUppercase,
      useNumbers,
      useSymbols
    });
    setPassword(generated);
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Judul tidak boleh kosong";
    if (!password) newErrors.password = "Password tidak boleh kosong";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const session = await getSession();
      if (!session) {
        router.replace("/(auth)/login");
        return;
      }

      const encryptedPassword = encryptData(password, session.encryptionKey);

      await createNote(
        session.userId,
        title.trim(),
        websiteOrApp.trim(),
        encryptedPassword,
        notes.trim()
      );

      Alert.alert("Berhasil", "Password berhasil disimpan!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Gagal menyimpan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={mainStyles.container} contentContainerStyle={mainStyles.content}>
      {/* Header */}
      <View style={addNoteStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={mainStyles.backBtn}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={mainStyles.screenTitle}>Tambah Password</Text>
      </View>

      {/* Judul */}
      <View style={mainStyles.inputGroup}>
        <Text style={mainStyles.label}>Judul *</Text>
        <TextInput
          style={[mainStyles.input, errors.title && mainStyles.inputError]}
          placeholder="Contoh: Gmail, Instagram"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        {errors.title && <Text style={mainStyles.errorText}>{errors.title}</Text>}
      </View>

      {/* Website */}
      <View style={mainStyles.inputGroup}>
        <Text style={mainStyles.label}>Website / Nama Aplikasi</Text>
        <TextInput
          style={mainStyles.input}
          placeholder="Contoh: gmail.com"
          placeholderTextColor={colors.textMuted}
          value={websiteOrApp}
          onChangeText={setWebsiteOrApp}
          autoCapitalize="none"
        />
      </View>

      {/* Generator Card */}
      <View style={addNoteStyles.generatorCard}>
        <Text style={addNoteStyles.generatorTitle}>⚙️ Generator Password</Text>

        <View style={addNoteStyles.lengthRow}>
          <Text style={mainStyles.label}>Panjang: {genLength}</Text>
          <View style={addNoteStyles.lengthButtons}>
            {[8, 12, 16, 20, 24].map((len) => (
              <TouchableOpacity
                key={len}
                style={[addNoteStyles.lenBtn, genLength === len && addNoteStyles.lenBtnActive]}
                onPress={() => setGenLength(len)}
              >
                <Text style={[addNoteStyles.lenBtnText, genLength === len && addNoteStyles.lenBtnTextActive]}>
                  {len}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {[
          { label: "Huruf Kapital (A-Z)", value: useUppercase, setter: setUseUppercase },
          { label: "Angka (0-9)", value: useNumbers, setter: setUseNumbers },
          { label: "Simbol (!@#$)", value: useSymbols, setter: setUseSymbols },
        ].map(({ label, value, setter }) => (
          <View key={label} style={addNoteStyles.toggleRow}>
            <Text style={addNoteStyles.toggleLabel}>{label}</Text>
            <Switch
              value={value}
              onValueChange={setter}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        ))}

        <TouchableOpacity style={addNoteStyles.generateBtn} onPress={handleGenerate}>
          <Text style={addNoteStyles.generateBtnText}>🔄 Generate Password</Text>
        </TouchableOpacity>
      </View>

      {/* Password Input */}
      <View style={mainStyles.inputGroup}>
        <Text style={mainStyles.label}>Password *</Text>
        <View style={addNoteStyles.passwordRow}>
          <TextInput
            style={[
              mainStyles.input,
              addNoteStyles.passwordInput,
              errors.password && mainStyles.inputError
            ]}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={addNoteStyles.showBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={addNoteStyles.showBtnText}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        {passwordStrength && (
          <View style={addNoteStyles.strengthRow}>
            <View style={[addNoteStyles.strengthBar, { backgroundColor: passwordStrength.color }]} />
            <Text style={[addNoteStyles.strengthLabel, { color: passwordStrength.color }]}>
              {passwordStrength.label}
            </Text>
          </View>
        )}
        {errors.password && <Text style={mainStyles.errorText}>{errors.password}</Text>}
      </View>

      {/* Notes */}
      <View style={mainStyles.inputGroup}>
        <Text style={mainStyles.label}>Catatan (opsional)</Text>
        <TextInput
          style={[mainStyles.input, addNoteStyles.textArea]}
          placeholder="Contoh: email terdaftar, username, dll"
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[addNoteStyles.saveBtn, loading && addNoteStyles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={addNoteStyles.saveBtnText}>💾 Simpan Password</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}