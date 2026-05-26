import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { initDatabase } from "../src/database/db";
import { getSession } from "../src/security/session";
import { colors } from "../src/styles/colors";
import { checkNetworkSecurity } from "../src/utils/networkWarning";


export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
       
        await initDatabase();
        await checkNetworkSecurity();
     
        const session = await getSession();

        if (session) {
          router.replace("/(main)/dashboard");
        } else {
          router.replace("/(auth)/login");
        }
      } catch (e) {
        console.error("App init error:", e);
        router.replace("/(auth)/login");
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, []);

 
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>

    <Stack screenOptions={{
      headerShown: false,
      contentStyle: {
        backgroundColor: colors.background
      }
    }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
    </Stack>
       </View>
  );
}