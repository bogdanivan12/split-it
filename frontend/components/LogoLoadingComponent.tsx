import { View, Text, Animated, Easing } from "react-native";
import React, { useEffect, useState } from "react";

export default function LogoLoadingComponent({ size = 100 }: { size?: number }) {
  const [rotateAnim] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.elastic(6),
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 8000,
          easing: Easing.elastic(6),
          useNativeDriver: true,
        }),
      ])
    ).start();
  })

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  return (
    <Animated.Image
      source={require("@/assets/images/Logo2.png")}
      style={[
        { width: size, height: size, alignSelf: "center" },
        { transform: [{ rotate: spin }] },
      ]}
    />
  );
}
