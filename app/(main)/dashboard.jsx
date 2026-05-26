import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  getSession,
  clearSession,
  getSessionTimeLeft,
} from "../../src/security/session";
import { getNotesByUser, deleteNote } from "../../src/database/db";
import { mainStyles, dashboardStyles } from "../../src/styles/mainStyles";
import { colors } from "../../src/styles/colors";

export default function DashboardScreen() {
  const [notes, setNotes] = useState([]);
  const [session, setSession] = useState(null);
  const [sessionDaysLeft, setSessionDaysLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const currentSession = await getSession();

      if (!currentSession) {
        router.replace("/(auth)/login");
        return;
      }

      setSession(currentSession);

      const daysLeft = await getSessionTimeLeft();
      setSessionDaysLeft(daysLeft);

      const userNotes = await getNotesByUser(currentSession.userId);
      setNotes(userNotes);

    } catch (e) {
      console.log(e);

      Alert.alert("Error", "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Yakin ingin logout?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await clearSession();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleDeleteNote = (id, title) => {
    Alert.alert("Hapus", `Hapus "${title}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await deleteNote(id, session.userId);
          setNotes((prev) => prev.filter((n) => n.id !== id));
        },
      },
    ]);
  };

  const renderNote = ({ item }) => (
    <TouchableOpacity
      style={dashboardStyles.noteCard}
      onPress={() =>
        router.push({ pathname: "/(main)/view-note", params: { id: item.id } })
      }
    >
      <View style={dashboardStyles.noteIcon}>
        <Text style={dashboardStyles.noteIconText}>
          {item.title.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={dashboardStyles.noteInfo}>
        <Text style={dashboardStyles.noteTitle}>{item.title}</Text>
        <Text style={dashboardStyles.noteSubtitle}>
          {item.website_or_app || "Tidak ada keterangan"}
        </Text>
      </View>

      <TouchableOpacity
        style={dashboardStyles.deleteBtn}
        onPress={() => handleDeleteNote(item.id, item.title)}
      >
        <Text style={dashboardStyles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={mainStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={dashboardStyles.container}>
  
      <View style={dashboardStyles.header}>
        <View>
          <Text style={dashboardStyles.greeting}>
            Halo, {session?.username} 👋
          </Text>
          <Text style={dashboardStyles.sessionInfo}>
            Session aktif {sessionDaysLeft} hari lagi
          </Text>
        </View>
        <TouchableOpacity
          style={dashboardStyles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={dashboardStyles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={dashboardStyles.debugBtn}
          onPress={() => router.push("/(main)/debug")}
        >
          <Text style={dashboardStyles.debugBtnText}>🛠️</Text>
        </TouchableOpacity>

        
      </View>

  
      <View style={dashboardStyles.statsCard}>
        <Text style={dashboardStyles.statsNumber}>{notes.length}</Text>
        <Text style={dashboardStyles.statsLabel}>Password tersimpan</Text>
      </View>

  
      <Text style={dashboardStyles.sectionTitle}>Password Tersimpan</Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNote}
        ListEmptyComponent={
          <View style={dashboardStyles.emptyContainer}>
            <Text style={dashboardStyles.emptyIcon}>🔐</Text>
            <Text style={dashboardStyles.emptyText}>
              Belum ada password tersimpan
            </Text>
            <Text style={dashboardStyles.emptySubtext}>
              Tap tombol + untuk menambahkan
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />


      <TouchableOpacity
        style={dashboardStyles.fab}
        onPress={() => router.push("/(main)/add-note")}
      >
        <Text style={dashboardStyles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
