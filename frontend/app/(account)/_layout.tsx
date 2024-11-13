import React from 'react'
import { Tabs } from 'expo-router'
import { StyledTabs } from '@/components/StyledTabs'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'

export default function Layout() {
  return (
    <StyledTabs>
      <Tabs.Screen
        name='index'
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <MaterialIcons size={36} style={{ marginBottom: -3 }} name="account-box" color={color} />
        }}
      />
      <Tabs.Screen
        name='groups'
        options={{
          title: 'My groups',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={36} style={{ marginBottom: -3 }} name="account-group-outline" color={color} />
        }}
      />
    </StyledTabs>
  )
}