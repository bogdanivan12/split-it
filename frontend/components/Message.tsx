import { View, Text, TextStyle, StyleSheet, ViewStyle } from "react-native";
import React, { ReactNode } from "react";
import { Colors } from "@/constants/Theme";

export function Message({
  icon,
  color,
  style,
  text,
  containerStyle
}: {
  icon?: ReactNode;
  color?: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  text: string;
}) {
  return (
    <View style={{...styles.containerView, ...containerStyle}}>
      {icon}
      <Text
        style={{
          color: color || Colors.theme1.textReject,
          ...styles.text,
          ...style,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  containerView: {
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 4,
    gap: 5,
  },
  text: {
    fontSize: 16,
    fontFamily: "AlegreyaMedium",
  },
});
