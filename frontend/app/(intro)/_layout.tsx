import React from 'react'
import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home'
        }}
      />
      <Tabs.Screen
        name='login'
        options={{
          title: 'Login'
        }}
      />
      <Tabs.Screen
        name='register'
        options={{
          title: 'Register'
        }}
      />
    </Tabs>
  )
}