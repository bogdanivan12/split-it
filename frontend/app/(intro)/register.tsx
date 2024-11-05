import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "@/constants/Colors";

export default function Register() {
  const [logoPosition] = useState(new Animated.Value(0));

  const [rotateAnim] = useState(new Animated.Value(0)); // Rotation animated value
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.elastic(5),
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 10000,
          easing: Easing.elastic(5),
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
  }, [logoPosition, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
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
          style={[styles.logo, { transform: [{ rotate: spin }] }]}
        />
      </Animated.View>
      <View style={styles.container}>
        <View style={styles.registerBox}>
          <Text style={styles.headerText}>Register</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#ccc"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#ccc"
            secureTextEntry={true}
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.theme1.background2,
  },
  logoContainer: {
    position: "absolute",
    top: "5%",
    right: 0,
    left: 0,
    alignItems: "center",
    zIndex: 100,
  },
  registerBox: {
    backgroundColor: Colors.theme1.background1,
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    shadowColor: Colors.theme1.tint,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.theme1.text,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    width: "90%",
    backgroundColor: Colors.theme1.inputBackground,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: Colors.theme1.inputText,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  button: {
    backgroundColor: Colors.theme1.button,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "45%",
  },
  buttonText: {
    color: Colors.theme1.text,
    fontSize: 16,
    fontWeight: "bold",
  },
});
