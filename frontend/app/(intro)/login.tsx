import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/Theme";
import { signUpStyles as styles } from "@/constants/SharedStyles";
import { router } from "expo-router";

export default function Login() {
  const [logoPosition] = useState(new Animated.Value(0));

  const [scaleAnim] = useState(new Animated.Value(1));
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(10000),
        Animated.timing(scaleAnim, {
          toValue: -1,
          duration: 600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: -1,
          duration: 600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        Animated.timing(logoPosition, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        Animated.timing(logoPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [logoPosition]);

  const flip = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const submit = () => {
    router.replace("/(account)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ translateY: logoPosition }] },
        ]}
      >
        <Animated.Image
          source={require("@/assets/images/Logo1.png")}
          style={[styles.logo, { transform: [{ scaleX: flip }] }]}
        />
      </Animated.View>
      <View style={styles.container}>
        <View style={styles.registerBox}>
          <Text style={styles.headerText}>Let's get into it!</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={Colors.theme1.inputPlaceholder}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.theme1.inputPlaceholder}
            secureTextEntry={true}
          />

          <TouchableOpacity onPress={submit} style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

