import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import LogoLoadingComponent from '@/components/LogoLoadingComponent';

export default function Home() {
  return (
    <View style={styles.container}>
      <LogoLoadingComponent />
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