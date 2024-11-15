import React from "react";
import { Tabs } from "expo-router";
import { StyledTabs } from "@/components/StyledTabs";
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
          tabBarIcon: ({ color }) => <FontAwesome size={36} style={{ marginBottom: -3 }} name="sign-in" color={color} />,
          
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: "Register",
          tabBarIcon: ({ color }) => <Entypo size={36} style={{ marginBottom: -3 }} name="lock-open" color={color} />
        }}
      />
    </StyledTabs>
  );
}
