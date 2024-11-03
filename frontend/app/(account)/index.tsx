import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Account index</Text>
    </View>
  );
  // logout button
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
