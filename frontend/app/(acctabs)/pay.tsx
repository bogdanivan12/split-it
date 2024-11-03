import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";

export default function Pay() {
  const { id } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pay {id}</Text>
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
    color: 'white'
  },
});
