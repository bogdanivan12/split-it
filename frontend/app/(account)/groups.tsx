import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import { Link } from "expo-router";

export default function Groups() {
  return (
    <View style={styles.container}>
      <Text>Groups</Text>
      <Link asChild href="/(group)/group1">
        <Pressable style={styles.button}>
            <Text>Go to group group1</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
  }
});
