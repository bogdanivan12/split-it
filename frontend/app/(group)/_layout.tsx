import React, { useEffect } from "react";
import { router, Tabs, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function GroupId() {
  // const { id } = useLocalSearchParams();
  // console.log(id);
  // useEffect(() => {
  //   router.replace({ pathname: "/(bill)", params: { id: id } });
  // }, []);
  // return <View></View>;
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Group info",
        }}
      />
      <Tabs.Screen
        name="receive"
        options={{
          title: "To receive",
        }}
      />
      <Tabs.Screen
        name="pay"
        options={{
          title: "To pay",
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: "Bills",
        }}
      />
    </Tabs>
  );
}
