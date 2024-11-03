import React from 'react'
import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name='groups'
        options={{
          title: 'My groups'
        }}
      />
      <Tabs.Screen
        name='index'
        options={{
          title: 'Account'
        }}
      />
    </Tabs>
  )
}