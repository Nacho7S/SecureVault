import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";


const SESSION_KEY = process.env.EXPO_PUBLIC_SESSION_KEY;
const SESSION_DURATION_DAYS = Number(process.env.EXPO_PUBLIC_SESSION_DURATION_DAYS );

export const saveSession = async (userId, username, encryptionKey) => {
  const session = {
    userId,
    username,
    encryptionKey, // hashed password, dipakai sebagai AES key
    loginAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    deviceInfo: {
      platform: Platform.OS,
      version: String(Platform.Version)
    }
  };
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
};

export const getSession = async () => {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);

  
    if (Date.now() > session.expiresAt) {
      await clearSession(); 
      return null;
    }

    return session;
  } catch (e) {
    return null;
  }
};


export const clearSession = async () => {
  await SecureStore.deleteItemAsync(SESSION_KEY);
};

export const getSessionTimeLeft = async () => {
  const session = await getSession();
  if (!session) return 0;
  const msLeft = session.expiresAt - Date.now();
  return Math.ceil(msLeft / (1000 * 60 * 60 * 24));
};