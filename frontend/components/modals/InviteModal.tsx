import { useState } from "react";
import CenteredModal from "./CenteredModal";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { generalStyles, modalStyles } from "@/constants/SharedStyles";
import { Colors } from "@/constants/Theme";
import { Entypo } from "@expo/vector-icons";
import { ApiError } from "@/types/ApiError.types";
import { MemberInGroup } from "@/types/Request.types";

const InvitedUser = ({
  username,
  remove,
}: {
  username: string;
  remove: () => void;
}) => {
  return (
    <View onStartShouldSetResponder={() => true} style={styles.userWrapper}>
      <Text style={styles.userText}>{username}</Text>
      <TouchableOpacity onPress={remove}>
        <Entypo size={36} name="cross" color={Colors.theme1.textReject} />
      </TouchableOpacity>
    </View>
  );
};

export const InviteModal = ({
  open,
  onClose,
  checkIfUserExists,
  invite,
}: {
  open: boolean;
  onClose: () => void;
  checkIfUserExists: (username: string) => Promise<MemberInGroup>;
  invite: (usernames: string[]) => Promise<void>;
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const cancel = () => {
    setSearchValue("");
    setInvitedUsers([]);
    onClose();
  };
  const inviteAction = async () => {
    try {
      await invite(invitedUsers);
      setSearchValue("");
      setInvitedUsers([]);
      onClose();
    } catch (err: any) {
      const error = err as ApiError;
      setMessage(error.message);
    }
  };
  const add = async () => {
    if (searchValue.trim() === "") {
      setSearchValue("");
      return;
    }
    if (invitedUsers.includes(searchValue)) return;
    let errorMessage: string | null = null;
    try {
      const userExists = await checkIfUserExists(searchValue);
      if (userExists.in_group) {
        errorMessage = "User is already in group.";
      } else if (userExists.has_request) {
        errorMessage = "User already has a pending request in this group.";
      }
    } catch (err) {
      const error = err as ApiError;
      if (error.code === 404) {
        errorMessage = "User not found.";
      }
    }
    console.log(errorMessage)
    if (errorMessage !== null) {
      setMessage(errorMessage);
      setSearchValue("");
      return;
    }
    setSearchValue("");
    setInvitedUsers((prev) => [...prev, searchValue]);
  };
  const remove = (user: string) => {
    setInvitedUsers((prev) => prev.filter((x) => x !== user));
  };
  return (
    <CenteredModal onClose={cancel} visible={open}>
      <View
        style={{
          ...modalStyles.modalContainer,
          maxHeight: Dimensions.get("screen").height * 0.5,
        }}
      >
        <Text style={modalStyles.modalTitle}>Search people to invite</Text>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 10,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            onStartShouldSetResponder={() => true}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.input}
              placeholder="Search..."
              value={searchValue}
              onChangeText={(i) => setSearchValue(i)}
              placeholderTextColor={Colors.theme1.inputPlaceholder}
            />
            <TouchableOpacity onPress={add} style={styles.addButton}>
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </View>
          {invitedUsers.map((user) => (
            <InvitedUser
              remove={() => remove(user)}
              username={user}
              key={user}
            />
          ))}

          <View style={modalStyles.modalActions}>
            <TouchableOpacity style={modalStyles.modalButton} onPress={cancel}>
              <Text style={modalStyles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.modalButton}
              onPress={inviteAction}
            >
              <Text style={modalStyles.modalButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </CenteredModal>
  );
};

const styles = StyleSheet.create({
  userWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  userText: {
    color: Colors.theme1.text3,
    fontFamily: "AlegreyaBold",
    textAlign: "center",
    fontSize: 16,
  },
  addText: {
    fontFamily: "Alegreya",
  },
  addButton: {
    width: "30%",
    backgroundColor: Colors.theme1.button2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    height: 40,
  },
  invitedUsersContainer: {},
  inputContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  input: {
    ...generalStyles.input,
    marginBottom: 0,
    width: "60%",
  },
});
