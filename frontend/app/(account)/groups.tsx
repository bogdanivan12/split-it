import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link } from "expo-router";
import { FontAwesome, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { Colors } from "@/constants/Theme";
import { generalStyles, modalStyles } from "@/constants/SharedStyles";
import CenteredModal from "@/components/modals/CenteredModal";
import { useAuth } from "@/context/AuthContext";
import { useGroup } from "@/utils/hooks/useGroup";
import { Message } from "@/components/Message";
import { ErrorIcon, SuccessIcon } from "@/components/Icons";
import { useIsFocused } from "@react-navigation/native";
import { CenteredLogoLoadingComponent } from "@/components/LogoLoadingComponent";
import { ShortGroup } from "@/types/Group.types";
import {
  InputErrorMessage,
  InputWithMessage,
} from "@/components/InputWithMessage";

const Groups: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [joinModalVisible, setJoinModalVisible] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [groupDescription, setGroupDescription] = useState<string>("");
  const [createErrorMessages, setCreateErrorMessages] = useState<
    InputErrorMessage[]
  >([]);
  const [groupCode, setGroupCode] = useState<string>("");
  const [joinErrorMessages, setJoinErrorMessages] = useState<
    InputErrorMessage[]
  >([]);
  const [groups, setGroups] = useState<ShortGroup[]>([]);

  const [message, setMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);

  const isFocused = useIsFocused();
  const { token, user, refreshUser } = useAuth();
  const { create, loading, getAll, join } = useGroup();

  useEffect(() => {
    setMessage(null);
  }, [isFocused]);

  useEffect(() => {
    const f = async () => {
      try {
        const groups = await getAll(token!);
        setGroups(groups);
      } catch (err: any) {
        setMessage({ error: true, text: err.message });
      }
    };
    f();
  }, [user]);

  const toggleModal = () => {
    setGroupDescription("");
    setGroupName("");
    setCreateErrorMessages([]);
    setModalVisible((prev) => !prev);
  };
  const toggleJoinModal = () => {
    setGroupCode("");
    setJoinErrorMessages([]);
    setJoinModalVisible((prev) => !prev);
  };

  const addGroup = async () => {
    if (groupName.trim() === "") {
      setCreateErrorMessages([{ text: "Required", icon: ErrorIcon }]);
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
      await refreshUser();
    } catch (err: any) {
      setMessage({ error: true, text: err.message });
    }
    toggleModal();
  };

  const joinGroup = async () => {
    if (groupCode.trim() === "") {
      setJoinErrorMessages([{ text: "Required", icon: ErrorIcon }]);
      setGroupCode("");
      return;
    }
    try {
      await join(groupCode, token!);
      setMessage({ error: false, text: "Successfully sent join request" });
      await refreshUser();
    } catch (err: any) {
      setMessage({ error: true, text: err.message });
    }
    toggleJoinModal();
  };

  if (!user) return null;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View
        style={{
          backgroundColor: styles.container.backgroundColor,
          ...generalStyles.scrollContainer,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            ...generalStyles.scrollContainer,
            paddingBottom: 100,
          }}
        >
          <View onStartShouldSetResponder={() => true} style={styles.container}>
            <View style={styles.absoluteFill} />
            <Text style={styles.header}>
              Which group are you tricking today?
            </Text>
            <View style={styles.groupList}>
              {groups.map((grp) => (
                <Link
                  key={grp.id}
                  asChild
                  href={{
                    pathname: `/(group)`,
                    params: { id: grp.id.toLowerCase() },
                  }}
                >
                  <Pressable style={styles.button}>
                    <FontAwesome5
                      name="crown"
                      size={20}
                      color={Colors.theme1.text3}
                    />
                    <Text style={styles.text}>{`${grp.name}`}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
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
            {message && (
              <Message
                containerStyle={{ alignSelf: "center", marginTop: 10 }}
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
            <CenteredModal onClose={toggleModal} visible={modalVisible}>
              <View style={modalStyles.modalContainer}>
                <Text style={modalStyles.modalTitle}>Create New Group</Text>
                {loading ? (
                  <CenteredLogoLoadingComponent
                    backgroundColor={Colors.theme1.background1}
                  />
                ) : (
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
                      <InputWithMessage
                        placeholder="Group Name (required)"
                        value={groupName}
                        onChangeText={(t) => {
                          setGroupName(t);
                          setCreateErrorMessages([]);
                        }}
                        errorMessages={createErrorMessages}
                        id="create"
                      />

                      <TextInput
                        style={[
                          modalStyles.input,
                          modalStyles.descriptionInput,
                        ]}
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
                )}
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
                    <InputWithMessage
                      placeholder="Group Code"
                      value={groupCode}
                      onChangeText={(t) => {
                        setGroupCode(t);
                        setJoinErrorMessages([]);
                      }}
                      errorMessages={joinErrorMessages}
                      id="join"
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
