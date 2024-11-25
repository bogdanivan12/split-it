import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { FontAwesome, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { Colors } from "@/constants/Theme";
import { generalStyles, modalStyles } from "@/constants/SharedStyles";
import CenteredModal from "@/components/modals/CenteredModal";
import { useAuth } from "@/context/AuthContext";
import { useGroup } from "@/utils/hooks/useGroup";
import { Message } from "@/components/Message";
import { ErrorIcon, SuccessIcon } from "@/components/Icons";
import { useIsFocused } from "@react-navigation/native";

interface Group {
  id: string;
  name: string;
}

const Groups: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [joinModalVisible, setJoinModalVisible] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [groupCode, setGroupCode] = useState<string>("");
  const [groupDescription, setGroupDescription] = useState<string>("");

  const [message, setMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);

  const isFocused = useIsFocused();
  const { token, user, refreshUser } = useAuth();
  const { create, loading } = useGroup();

  useEffect(() => {
    setMessage(null);
  }, [isFocused]);

  const toggleModal = () => {
    setGroupDescription("");
    setGroupName("");
    setModalVisible((prev) => !prev);
  };
  const toggleJoinModal = () => {
    setGroupCode("");
    setJoinModalVisible((prev) => !prev);
  };

  const addGroup = async () => {
    if (groupName.trim() === "") {
      Alert.alert("Required", "The name is required to create a group", [
        {
          text: "OK",
          onPress: () => {},
          style: "cancel",
        },
      ]);
      return;
    }
    try {
      await create(
        {
          name: groupName,
          description: groupDescription,
        },
        token!
      );
      setMessage({ error: false, text: "Group created successfully." });
      refreshUser().catch((err) =>
        setMessage({ error: true, text: err.message })
      );
    } catch (err: any) {
      setMessage({ error: true, text: err.message });
    }
    toggleModal();
  };

  const joinGroup = () => {
    if (groupCode.trim() === "") {
      Alert.alert("Required", "Please fill in the group code", [
        {
          text: "OK",
          onPress: () => {},
          style: "cancel",
        },
      ]);
      return;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View
        style={{
          ...generalStyles.scrollContainer,
          backgroundColor: styles.container.backgroundColor,
        }}
      >
        <ScrollView contentContainerStyle={generalStyles.scrollContainer}>
          <View onStartShouldSetResponder={() => true} style={styles.container}>
            <View style={styles.absoluteFill} />
            <Text style={styles.header}>
              Which group are you tricking today?
            </Text>
            <FlatList
              data={user!.groupIds}
              scrollEnabled={false}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Link
                  asChild
                  href={{
                    pathname: `/(group)`,
                    params: { id: item.toLowerCase() },
                  }}
                >
                  <Pressable style={styles.button}>
                    <FontAwesome5
                      name="crown"
                      size={20}
                      color={Colors.theme1.text3}
                    />
                    <Text style={styles.text}>{`${item}`}</Text>
                  </Pressable>
                </Link>
              )}
              style={styles.groupList}
            />

            <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
              <View style={styles.addButtonContent}>
                <FontAwesome
                  name="plus-square"
                  size={20}
                  color={Colors.theme1.text2}
                />
                <Text style={styles.addButtonText}>Create Group</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={toggleJoinModal}
            >
              <View style={styles.addButtonContent}>
                <FontAwesome6
                  name="archway"
                  size={20}
                  color={Colors.theme1.text2}
                />
                <Text style={styles.addButtonText}>Join Group</Text>
              </View>
            </TouchableOpacity>
            <CenteredModal onClose={toggleModal} visible={modalVisible}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>Create New Group</Text>
                <ScrollView
                  contentContainerStyle={{
                    ...generalStyles.scrollContainer,
                    justifyContent: "flex-start",
                  }}
                >
                  <View
                    style={{ marginTop: 10 }}
                    onStartShouldSetResponder={() => true}
                  >
                    <TextInput
                      style={modalStyles.input}
                      placeholder="Group Name (required)"
                      value={groupName}
                      onChangeText={setGroupName}
                      placeholderTextColor={Colors.theme1.inputPlaceholder}
                    />

                    <TextInput
                      style={[modalStyles.input, modalStyles.descriptionInput]}
                      placeholder="Group Description (optional)"
                      value={groupDescription}
                      onChangeText={setGroupDescription}
                      placeholderTextColor={Colors.theme1.inputPlaceholder}
                      multiline
                    />
                  </View>

                  <View style={modalStyles.modalActions}>
                    <TouchableOpacity
                      style={modalStyles.modalButton}
                      onPress={toggleModal}
                    >
                      <Text style={modalStyles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={modalStyles.modalButton}
                      onPress={addGroup}
                    >
                      <Text style={modalStyles.modalButtonText}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </CenteredModal>
            <CenteredModal onClose={toggleJoinModal} visible={joinModalVisible}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>Join Group</Text>
                <ScrollView
                  contentContainerStyle={{
                    ...generalStyles.scrollContainer,
                    justifyContent: "flex-start",
                  }}
                >
                  <View
                    style={{ marginTop: 10 }}
                    onStartShouldSetResponder={() => true}
                  >
                    <TextInput
                      style={modalStyles.input}
                      placeholder="Group Code"
                      value={groupCode}
                      onChangeText={setGroupCode}
                      placeholderTextColor={Colors.theme1.inputPlaceholder}
                    />
                  </View>

                  <View style={modalStyles.modalActions}>
                    <TouchableOpacity
                      style={modalStyles.modalButton}
                      onPress={toggleJoinModal}
                    >
                      <Text style={modalStyles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={modalStyles.modalButton}
                      onPress={joinGroup}
                    >
                      <Text style={modalStyles.modalButtonText}>
                        Send request
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </CenteredModal>
          </View>
        </ScrollView>
        {message && (
          <Message
            containerStyle={{ alignSelf: "center" }}
            style={{ textAlign: "center" }}
            text={message.text}
            color={
              message.error
                ? Colors.theme1.textReject
                : Colors.theme1.textAccept
            }
            icon={message.error ? ErrorIcon : SuccessIcon}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Groups;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: Colors.theme1.background2,
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 10,
    fontFamily: "AlegreyaBold",
    textAlign: "center",
    color: Colors.theme1.text,
  },
  groupList: {
    flexGrow: 0,
    width: "100%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.theme1.button,
    padding: 10,
    alignSelf: "center",
    minWidth: "55%",
    marginVertical: 5,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  text: {
    color: Colors.theme1.text3,
    fontFamily: "AlegreyaBold",
    textAlign: "center",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Colors.theme1.button3,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "AlegreyaBold",
    fontWeight: "bold",
  },

  absoluteFill: {
    borderRadius:
      Math.round(
        Dimensions.get("window").width + Dimensions.get("window").height
      ) / 2,
    width: Dimensions.get("window").width * 0.8,
    height: Dimensions.get("window").width * 0.8,
    backgroundColor: Colors.theme1.background1,
    position: "absolute",
    top: "10%",
    right: "-25%",
    zIndex: -1,
  },
});
