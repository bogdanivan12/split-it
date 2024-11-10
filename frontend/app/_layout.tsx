import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(intro)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    AlegreyaBold: require("../assets/fonts/Alegreya/Alegreya-Bold.ttf"),
    Alegreya: require("../assets/fonts/Alegreya/Alegreya-Black.ttf"),
    AlegreyaMedium: require("../assets/fonts/Alegreya/Alegreya-Medium.ttf"),
    AlegreyaRegular: require("../assets/fonts/Alegreya/Alegreya-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} redirect />
      <Stack.Screen name="(intro)" options={{ headerShown: false }} />
      <Stack.Screen name="(account)" options={{ headerShown: false }} />
      <Stack.Screen name="(group)" options={{ headerShown: false }} />
      </Stack>
  );
}
