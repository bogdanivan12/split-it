import { Tabs as DTabs } from "expo-router";
import type { ComponentProps } from "react";
import { Colors } from "../constants/Theme";
import { Dimensions } from "react-native";

export const StyledTabs = (props: ComponentProps<typeof DTabs>) => {
  return (
    <DTabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.theme1.background2,
        },
        headerTitleStyle: {
          color: Colors.theme1.text,
          fontFamily: "AlegreyaBold",
          fontSize: 24,
        },
        tabBarActiveTintColor: Colors.theme1.tabIconSelected,
        tabBarInactiveTintColor: Colors.theme1.tabIconNormal,
        tabBarStyle: {
          borderTopWidth: 0,
          borderRadius: 100,
          bottom: 30,
          left: Dimensions.get("window").width * 0.05,
          width: "90%",
          alignSelf: "center",
          justifyContent: "center",
          position: "absolute",
          backgroundColor: Colors.theme1.tabBackgroundNormal,
        },
        tabBarItemStyle: {
          top: 10,
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarShowLabel: false,
      }}
      {...props}
    />
  );
};
