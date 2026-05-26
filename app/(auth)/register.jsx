import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { hashPassword } from "../../src/security/crypto";
import { createUser, getUserByUsername } from "../../src/database/db";
import AuthForm from "../../src/components/AuthForm";
import { authStyles } from "../../src/styles/authStyles";

const FIELDS = [
  {
    key: "username",
    label: "Username",
    placeholder: "Masukkan username",
  },
  {
    key: "password",
    label: "Password",
    placeholder: "Minimal 8 karakter, huruf kapital & angka",
    secureTextEntry: true,
  },
  {
    key: "confirmPassword",
    label: "Konfirmasi Password",
    placeholder: "Ulangi password",
    secureTextEntry: true,
  },
];

export default function RegisterScreen() {
  const [values, setValues] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!values.username.trim()) {
      newErrors.username = "Username tidak boleh kosong";
    } else if (values.username.length < 3) {
      newErrors.username = "Username minimal 3 karakter";
    } else if (!/^[a-zA-Z0-9_]+$/.test(values.username)) {
      newErrors.username = "Username hanya boleh huruf, angka, dan underscore";
    }

    if (!values.password) {
      newErrors.password = "Password tidak boleh kosong";
    } else if (values.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    } else if (!/[A-Z]/.test(values.password)) {
      newErrors.password = "Password harus mengandung huruf kapital";
    } else if (!/[0-9]/.test(values.password)) {
      newErrors.password = "Password harus mengandung angka";
    }

    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const existing = await getUserByUsername(values.username.trim());
      if (existing) {
        setErrors({ username: "Username sudah digunakan" });
        return;
      }

      const passwordHash = await hashPassword(values.password);
      await createUser(values.username.trim(), passwordHash);

      Alert.alert("Berhasil", "Akun berhasil dibuat! Silakan login.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") }
      ]);
    } catch (e) {
      Alert.alert("Error", "Gagal membuat akun. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={authStyles.scrollContainer}
      contentContainerStyle={authStyles.scrollContent}
    >
      <AuthForm
        title="Buat Akun"
        subtitle="SecureVault"
        fields={FIELDS}
        values={values}
        onChange={handleChange}
        errors={errors}
        onSubmit={handleRegister}
        submitLabel="Daftar"
        loading={loading}
        footer={
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={authStyles.linkText}>
              Sudah punya akun?{" "}
              <Text style={authStyles.link}>Login</Text>
            </Text>
          </TouchableOpacity>
        }
      />
    </ScrollView>
  );
}