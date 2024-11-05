import { Colors } from "./Theme";
import { StyleSheet } from "react-native";

export const signUpStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: Colors.theme1.background2,
    },
    logoContainer: {
      position: "absolute",
      top: "5%",
      right: 0,
      left: 0,
      alignItems: "center",
      zIndex: 100,
    },
    registerBox: {
      backgroundColor: Colors.theme1.background1,
      padding: 20,
      borderRadius: 10,
      marginHorizontal: 20,
      shadowColor: Colors.theme1.tint,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
      alignItems: "center",
    },
    headerText: {
      fontFamily: "AlegreyaBold",
      fontSize: 24,
      color: Colors.theme1.text,
      marginBottom: 20,
      textAlign: "center",
    },
    input: {
      fontFamily: "AlegreyaRegular",
      height: 40,
      width: "90%",
      backgroundColor: Colors.theme1.inputBackground,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 15,
      color: Colors.theme1.inputText,
    },
    logo: {
      width: 100,
      height: 100,
      alignSelf: "center",
    },
    button: {
      backgroundColor: Colors.theme1.button,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 10,
      width: "45%",
    },
    buttonText: {
      color: Colors.theme1.text,
      fontSize: 16,
      fontFamily: "AlegreyaMedium",
    },
  });
  