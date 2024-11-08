import { Tabs as DTabs } from "expo-router";
import type { ComponentProps } from "react";
import { Colors } from "../constants/Theme";

export const StyledTabs = (props: ComponentProps<typeof DTabs>) => {
  return (
    <DTabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.theme1.tabBackgroundNormal },
        headerTitleStyle: { color: Colors.theme1.tabText },
        tabBarActiveTintColor: Colors.theme1.tabIconSelected,
        tabBarInactiveTintColor: Colors.theme1.tabIconNormal,
        tabBarStyle: { backgroundColor: Colors.theme1.tabBackgroundNormal },
      }}
      {...props}
    />
  );
};
