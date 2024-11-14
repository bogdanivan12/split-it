import { Tabs as DTabs } from "expo-router";
import type { ComponentProps } from "react";
import { Colors } from "../constants/Theme";

export const StyledTabs = (props: ComponentProps<typeof DTabs>) => {
  return (
    <DTabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Colors.theme1.background2 },
        headerTitleStyle: { color: Colors.theme1.tabText, fontFamily: 'AlegreyaBold', fontSize: 24 },
        tabBarActiveTintColor: Colors.theme1.tabIconSelected,
        tabBarInactiveTintColor: Colors.theme1.tabIconNormal,
        tabBarStyle: {
          backgroundColor: Colors.theme1.background2,
          borderTopWidth: 0,
        },
        tabBarShowLabel: false
      }}
      {...props}
    />
  );
};
