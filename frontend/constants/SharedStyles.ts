import { Colors } from "./Theme";
import { StyleSheet } from "react-native";

export const generalStyles = StyleSheet.create({
  input: {
    fontFamily: "AlegreyaRegular",
    height: 40,
    width: "100%",
    backgroundColor: Colors.theme1.inputBackground,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: Colors.theme1.inputText,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignContent: "center",
  },
});

export const modalStyles = StyleSheet.create({
  modalContainer: {
    width: "90%",
    backgroundColor: Colors.theme1.background1,
    padding: 20,
    elevation: 5,
    borderRadius: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontFamily: "AlegreyaBold",
    fontWeight: "bold",
    marginBottom: 5,
    color: Colors.theme1.text,
  },
  input: {
    ...generalStyles.input,
    width: "99%",
  },
  descriptionInput: {
    height: 60,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    gap: 15,
  },
  modalButton: {
    backgroundColor: Colors.theme1.button3,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  modalButtonText: {
    color: Colors.theme1.text,
    fontFamily: "AlegreyaBold",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export const signUpStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.theme1.background2,
  },
  logoContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    alignItems: "center",
    zIndex: 100,
  },
  registerBox: {
    backgroundColor: Colors.theme1.background1,
    padding: 20,
    borderRadius: 60,
    marginHorizontal: 20,
    shadowColor: Colors.theme1.tint,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: "60%",
  },
  boxWrapper: {
    // marginBottom: 100,
    flex: 1,
    justifyContent: "center",
    gap: 10
  },
  headerText: {
    fontFamily: "AlegreyaBold",
    fontSize: 24,
    color: Colors.theme1.text1,
    marginBottom: 20,
    textAlign: "center",
  },
  input: generalStyles.input,
  scrollContainer: { ...generalStyles.scrollContainer, paddingBottom: 20 },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  button: {
    backgroundColor: Colors.theme1.button2,
    paddingVertical: 12,
    borderRadius: 15,
    borderColor: "black",
    borderWidth: 1,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
    width: "65%",
  },
  buttonText: {
    color: Colors.theme1.button4,
    fontSize: 16,
    fontFamily: "AlegreyaMedium",
  },
});
