import React from "react";
import { Tabs } from "expo-router";
import { StyledTabs } from "@/components/StyledTabs";
import { FontAwesome6, Fontisto, MaterialIcons } from "@expo/vector-icons";

export default function GroupId() {
  return (
    <StyledTabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Group info",
          tabBarIcon: ({ color }) => <Fontisto size={36} style={{ marginBottom: -3 }} name="persons" color={color} />
        }}
      />
      <Tabs.Screen
        name="receive"
        options={{
          title: "To receive",
          tabBarIcon: ({ color }) => <FontAwesome6 size={36} style={{ marginBottom: -3 }} name="money-bill-trend-up" color={color} />
        }}
      />
      <Tabs.Screen
        name="pay"
        options={{
          title: "To pay",
          tabBarIcon: ({ color }) => <FontAwesome6 size={36} style={{ marginBottom: -3 }} name="money-bill-transfer" color={color} />
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: "Bills",
          tabBarIcon: ({ color }) => <MaterialIcons size={36} style={{ marginBottom: -3 }} name="attach-money" color={color} />
        }}
      />
    </StyledTabs>
  );
}
