import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { hashPassword } from "../../src/security/crypto";
import { saveSession } from "../../src/security/session";
import {
  getUserByUsername, incrementLoginAttempts,
  lockAccount, resetLoginAttempts
} from "../../src/database/db";
import AuthForm from "../../src/components/AuthForm";
import { authStyles } from "../../src/styles/authStyles";

const MAX_ATTEMPTS = 5;

const FIELDS = [
  {
    key: "username",
    label: "Username",
    placeholder: "Masukkan username",
  },
  {
    key: "password",
    label: "Password",
    placeholder: "Masukkan password",
    secureTextEntry: true,
  },
];

export default function LoginScreen() {
  const [values, setValues] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
   
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!values.username.trim()) newErrors.username = "Username tidak boleh kosong";
    if (!values.password) newErrors.password = "Password tidak boleh kosong";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await getUserByUsername(values.username.trim());

      if (!user) {
        setErrors({ username: "Username tidak ditemukan" });
        return;
      }

   
      if (user.locked_until && Date.now() < user.locked_until) {
        const menitSisa = Math.ceil((user.locked_until - Date.now()) / 60000);
        Alert.alert("Akun Terkunci", `Coba lagi dalam ${menitSisa} menit.`);
        return;
      }

  
      const inputHash = await hashPassword(values.password);
      if (inputHash !== user.password_hash) {
        await incrementLoginAttempts(values.username.trim());
        const updatedUser = await getUserByUsername(values.username.trim());
        const attemptsLeft = MAX_ATTEMPTS - updatedUser.login_attempts;

        if (updatedUser.login_attempts >= MAX_ATTEMPTS) {
          await lockAccount(values.username.trim());
          Alert.alert("Akun Terkunci", "Terlalu banyak percobaan. Akun dikunci 15 menit.");
        } else {
          setErrors({ password: `Password salah. Sisa percobaan: ${attemptsLeft}` });
        }
        return;
      }

  
      await resetLoginAttempts(values.username.trim());
      await saveSession(user.id, user.username, inputHash);
      router.replace("/(main)/dashboard");
    } catch (e) {
      Alert.alert("Error", "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <AuthForm
        title="Selamat Datang"
        subtitle="SecureVault"
        fields={FIELDS}
        values={values}
        onChange={handleChange}
        errors={errors}
        onSubmit={handleLogin}
        submitLabel="Login"
        loading={loading}
        footer={
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text style={authStyles.linkText}>
              Belum punya akun?{" "}
              <Text style={authStyles.link}>Daftar</Text>
            </Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}