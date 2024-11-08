import React from 'react'
import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Group info'
        }}
      />
      <Tabs.Screen
        name='receive'
        options={{
          title: 'To receive'
        }}
      />
      <Tabs.Screen
        name='pay'
        options={{
          title: 'To pay'
        }}
      />
      <Tabs.Screen
        name='bills'
        options={{
          title: 'Bills'
        }}
      />
    </Tabs>
  )
}