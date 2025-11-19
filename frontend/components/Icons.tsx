import { Colors } from "@/constants/Theme";
import { Feather, MaterialIcons } from "@expo/vector-icons";

export const ErrorIcon = (
  <MaterialIcons size={20} color={Colors.theme1.textReject} name="error" />
);

export const SuccessIcon = (
  <Feather name="check-circle" color={Colors.theme1.textAccept} size={20} />
);
