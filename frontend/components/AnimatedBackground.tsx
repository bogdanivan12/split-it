import { Colors } from "@/constants/Theme";
import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Easing } from "react-native";

export const AnimatedBackground = () => {
  const borderRadiusAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence(
          [0, 1, 2, 3, 4, 4, 3, 2, 1, 0].map((nr) => {
            return Animated.timing(borderRadiusAnim, {
              toValue: nr,
              duration: 500,
              easing: Easing.linear,
              useNativeDriver: true,
            });
          })
        )
      ).start();

      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimation();
  }, [borderRadiusAnim, rotationAnim, colorAnim]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.theme1.background1, Colors.theme1.background2],
  });

  const borderRadius = borderRadiusAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [
      "0",
      "20",
      "100",
      "20",
      "0",
    ],
  });

  const rotate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.animatedView,
          {
            backgroundColor,
            borderRadius,
            transform: [{ rotate }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  animatedView: {
    width: 200,
    height: 200,
    position: "absolute",
    top: "50%",
    left: "20%",
  },
});
