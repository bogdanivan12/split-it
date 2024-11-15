import { Tabs as DTabs } from "expo-router";
import type { ComponentProps } from "react";
import { Colors } from "../constants/Theme";

export const StyledTabs = (props: ComponentProps<typeof DTabs>) => {
  return (
    <DTabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Colors.theme1.background2 },
        headerTitleStyle: {
          color: Colors.black ,
          fontFamily: "AlegreyaBold",
          fontSize: 24,
        },
        tabBarActiveTintColor: Colors.theme1.tabIconSelected,
        tabBarInactiveTintColor: Colors.theme1.tabIconNormal,
        tabBarStyle: {
          borderTopWidth: 0,
          borderRadius: 100,
          bottom: 30,
          left: 'auto',
          right: 'auto',
          width: "90%",
          alignSelf: "center",
          justifyContent: "center",
          position: 'absolute',
          backgroundColor: Colors.theme1.tabBackgroundNormal,
        },
        tabBarItemStyle: {
          top: 10,
          alignSelf: "center",
          justifyContent: "center", // Center content within each tab
          alignItems: "center", // Horizontal centering
        },
        tabBarShowLabel: false,
      }}
      {...props}
    />
  );
};
