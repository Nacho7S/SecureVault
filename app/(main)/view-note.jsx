import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { getSession } from "../../src/security/session";
import { decryptData } from "../../src/security/crypto";
import { getNoteById, deleteNote } from "../../src/database/db";
import {  mainStyles, viewNoteStyles } from "../../src/styles/mainStyles";
import { colors } from "../../src/styles/colors";


export default function ViewNoteScreen() {
  const { id } = useLocalSearchParams();
  const [note, setNote] = useState(null);
  const [decryptedPassword, setDecryptedPassword] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      if (!session) {
        router.replace("/(auth)/login");
        return;
      }

      const noteData = await getNoteById(Number(id), session.userId);
      if (!noteData) {
        Alert.alert("Error", "Data tidak ditemukan.");
        router.back();
        return;
      }

      const plainPassword = decryptData(noteData.encrypted_password, session.encryptionKey);
      if (!plainPassword) {
        Alert.alert("Error", "Gagal mendekripsi data.");
        router.back();
        return;
      }

      setNote(noteData);
      setDecryptedPassword(plainPassword);
    } catch (e) {
      Alert.alert("Error", "Gagal memuat data.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(decryptedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    Alert.alert("Hapus", `Hapus "${note.title}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const session = await getSession();
          await deleteNote(note.id, session.userId);
          router.back();
        }
      }
    ]);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  if (loading) {
    return (
      <View style={mainStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={mainStyles.container} contentContainerStyle={mainStyles.content}>
      {/* Header */}
      <View style={viewNoteStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={mainStyles.backBtn}>← Kembali</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={viewNoteStyles.deleteText}>🗑️ Hapus</Text>
        </TouchableOpacity>
      </View>

      {/* Icon & Title */}
      <View style={viewNoteStyles.iconContainer}>
        <View style={viewNoteStyles.icon}>
          <Text style={viewNoteStyles.iconText}>
            {note.title.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={mainStyles.screenTitle}>{note.title}</Text>
        {note.website_or_app ? (
          <Text style={viewNoteStyles.subtitle}>{note.website_or_app}</Text>
        ) : null}
      </View>

      {/* Password Card */}
      <View style={mainStyles.card}>
        <Text style={mainStyles.cardLabel}>Password</Text>

        <View style={viewNoteStyles.passwordRow}>
          <Text style={viewNoteStyles.passwordText} numberOfLines={1}>
            {showPassword ? decryptedPassword : "•".repeat(Math.min(decryptedPassword.length, 20))}
          </Text>
          <TouchableOpacity
            style={viewNoteStyles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={viewNoteStyles.encryptedLabel}>
          🔒 Disimpan terenkripsi (AES-256)
        </Text>

        <TouchableOpacity
          style={[viewNoteStyles.copyBtn, copied && viewNoteStyles.copyBtnSuccess]}
          onPress={handleCopy}
        >
          <Text style={viewNoteStyles.copyBtnText}>
            {copied ? "✓ Disalin!" : "📋 Salin Password"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notes */}
      {note.notes ? (
        <View style={mainStyles.card}>
          <Text style={mainStyles.cardLabel}>Catatan</Text>
          <Text style={viewNoteStyles.notesText}>{note.notes}</Text>
        </View>
      ) : null}

      {/* Metadata */}
      <View style={viewNoteStyles.metaCard}>
        <View style={viewNoteStyles.metaRow}>
          <Text style={viewNoteStyles.metaLabel}>Dibuat</Text>
          <Text style={viewNoteStyles.metaValue}>{formatDate(note.created_at)}</Text>
        </View>
        <View style={viewNoteStyles.metaRow}>
          <Text style={viewNoteStyles.metaLabel}>Diperbarui</Text>
          <Text style={viewNoteStyles.metaValue}>{formatDate(note.updated_at)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}