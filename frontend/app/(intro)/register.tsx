import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function Register() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello this is the register component</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white'
  }
});