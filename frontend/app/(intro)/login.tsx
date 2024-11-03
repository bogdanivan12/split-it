import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { Link, router } from "expo-router";

export default function Login() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello this is the login component</Text>
      <Pressable
        style={styles.button}
        onPress={() => {
          router.replace("/(account)");
        }}
      >
        <Text>Go to account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
  },
  text: {
    color: "white",
  },
  button: {
    backgroundColor: "green",
    padding: 10,
  },
});
