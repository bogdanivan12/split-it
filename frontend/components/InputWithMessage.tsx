import { View, TextInput, TextStyle, ViewStyle } from "react-native";
import React, { ReactNode } from "react";
import { generalStyles } from "@/constants/SharedStyles";
import { Colors } from "@/constants/Theme";
import { Message } from "./Message";

export type InputErrorMessage = {
  text: string;
  color?: string;
  icon?: ReactNode;
  style?: TextStyle;
};

export function InputWithMessage({
  id,
  style,
  containerStyle,
  value,
  onChangeText,
  placeholder = "",
  errorMessages = [],
  password = false,
  onFocus,
  onBlur,
}: {
  id: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
  onChangeText: (text: string) => void;
  value: string;
  placeholder?: string;
  password?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  errorMessages?: InputErrorMessage[];
}) {
  return (
    <View style={containerStyle}>
      <TextInput
        secureTextEntry={password}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          ...generalStyles.input,
          ...(errorMessages.length > 0 && { marginBottom: 2 }),
          ...style,
        }}
        placeholder={placeholder}
        placeholderTextColor={Colors.theme1.inputPlaceholder}
        value={value}
        onChangeText={onChangeText}
      />
      {errorMessages.map((msg) => {
        return (
          <Message
            key={`${id}${msg.text}`}
            text={msg.text}
            color={msg.color}
            icon={msg.icon}
            style={msg.style}
          />
        );
      })}
    </View>
  );
}
