import { StyleSheet } from "react-native";
import { colors } from "./colors";


export const mainStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  // Common Text
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  backBtn: {
    color: colors.primary,
    fontSize: 15,
    marginBottom: 12,
  },



  // Form Elements
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  secondaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

// ============================================================
// ADD NOTE / ADD PASSWORD STYLES
// ============================================================
export const addNoteStyles = StyleSheet.create({
  // Header
  header: { marginBottom: 28 },

  // Text Area
  textArea: { minHeight: 80, textAlignVertical: "top" },

  // Password Input Row
  passwordRow: { flexDirection: "row", alignItems: "center" },
  passwordInput: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  showBtn: {
    backgroundColor: colors.surface,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: colors.border,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  showBtnText: { fontSize: 18 },

  // Strength Indicator
  strengthRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  strengthBar: { height: 4, width: 60, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: "600" },

  // Generator Card
  generatorCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  generatorTitle: { color: colors.textPrimary, fontWeight: "600", fontSize: 15, marginBottom: 16 },
  lengthRow: { marginBottom: 12 },
  lengthButtons: { flexDirection: "row", gap: 8, marginTop: 8 },
  lenBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lenBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  lenBtnText: { color: colors.textSecondary, fontSize: 13 },
  lenBtnTextActive: { color: "#fff", fontWeight: "600" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  toggleLabel: { color: colors.textSecondary, fontSize: 14 },

  // Buttons (exact match dari JSX kamu)
  generateBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  generateBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

// ============================================================
// VIEW NOTE / VIEW PASSWORD STYLES
// ============================================================
export const viewNoteStyles = StyleSheet.create({
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  deleteText: {
    color: colors.error,
    fontSize: 15,
  },

  // Icon
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  iconText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },

  // Password Display
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  passwordText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    letterSpacing: 1,
  },
  eyeBtn: {
    padding: 4,
  },
  encryptedLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 16,
  },

  // Copy Button
  copyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  copyBtnSuccess: {
    backgroundColor: colors.success,
  },
  copyBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Notes / Details
  notesText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },

  // Meta Info
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  metaValue: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});

// ============================================================
// DASHBOARD STYLES
// ============================================================
export const dashboardStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 60,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  sessionInfo: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: colors.error,
    fontWeight: "600",
    fontSize: 13,
  },

  debugBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#1e293b", justifyContent: "center",
    alignItems: "center", borderWidth: 1, borderColor: "#334155",
    marginTop: 4
  },
  debugBtnText: { fontSize: 16 },

  

  // Stats
  statsCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    alignItems: "center",
  },
  statsNumber: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
  },
  statsLabel: {
    fontSize: 14,
    color: colors.primaryLight,
    marginTop: 4,
  },

  // List
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 16,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  noteIconText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
  noteSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    color: colors.textMuted,
    fontSize: 16,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "300",
    marginTop: -2,
  },
});