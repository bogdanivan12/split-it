import React from "react";
import { Tabs } from "expo-router";
import { StyledTabs } from "@/constants/ThemedComponents";
import { Entypo, FontAwesome } from "@expo/vector-icons";

export default function Layout() {
  return (
    <StyledTabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color }) => <Entypo size={28} style={{ marginBottom: -3 }} name="lock-open" color={color} />
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: "Register",
          tabBarIcon: ({ color }) => <FontAwesome size={28} style={{ marginBottom: -3 }} name="sign-in" color={color} />
        }}
      />
    </StyledTabs>
  );
}
