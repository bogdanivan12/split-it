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
} from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";
import { FontAwesome, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { Colors } from "@/constants/Theme";
import { generalStyles } from "@/constants/SharedStyles";

interface Group {
  id: string;
  name: string;
}

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([
    { id: "1", name: "Group1" },
    { id: "2", name: "Group2" },
  ]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [joinModalVisible, setJoinModalVisible] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [groupCode, setGroupCode] = useState<string>("");
  const [groupDescription, setGroupDescription] = useState<string>("");

  const toggleModal = () => {
    setGroupDescription("");
    setGroupName("");
    setModalVisible((prev) => !prev);
  };
  const toggleJoinModal = () => {
    setGroupCode("");
    setJoinModalVisible((prev) => !prev);
  };

  const addGroup = () => {
    if (groupName.trim() === "") {
      alert("Group name is required.");
      return;
    }

    const newGroup: Group = {
      id: `${groups.length + 1}`,
      name: groupName.trim(),
    };

    setGroups([...groups, newGroup]);
    toggleModal();
  };

  const joinGroup = () => {
    if (groupCode.trim() === "") {
      alert("Please fill in the group code");
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
              data={groups}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Link
                  asChild
                  href={{
                    pathname: `/(group)`,
                    params: { id: item.name.toLowerCase() },
                  }}
                >
                  <Pressable style={styles.button}>
                    <FontAwesome5
                      name="crown"
                      size={20}
                      color={Colors.theme1.text3}
                    />
                    <Text style={styles.text}>{`${item.name}`}</Text>
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

            <Modal
              animationType="fade"
              visible={modalVisible}
              transparent={true}
              onRequestClose={toggleModal}
            >
              <View style={styles.modal}>
                <TouchableWithoutFeedback onPress={toggleModal}>
                  <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                  onPress={() => {
                    Keyboard.dismiss();
                  }}
                >
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Create New Group</Text>
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
                          style={styles.input}
                          placeholder="Group Name (required)"
                          value={groupName}
                          onChangeText={setGroupName}
                          placeholderTextColor={Colors.theme1.inputPlaceholder}
                        />

                        <TextInput
                          style={[styles.input, styles.descriptionInput]}
                          placeholder="Group Description (optional)"
                          value={groupDescription}
                          onChangeText={setGroupDescription}
                          placeholderTextColor={Colors.theme1.inputPlaceholder}
                          multiline
                        />
                      </View>

                      <View style={styles.modalActions}>
                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={toggleModal}
                        >
                          <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={addGroup}
                        >
                          <Text style={styles.modalButtonText}>Create</Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </Modal>

            <Modal
              animationType="fade"
              visible={joinModalVisible}
              transparent={true}
              onRequestClose={toggleJoinModal}
            >
              <View style={styles.modal}>
                <TouchableWithoutFeedback onPress={toggleJoinModal}>
                  <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                  onPress={() => {
                    Keyboard.dismiss();
                  }}
                >
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Join Group</Text>
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
                          style={styles.input}
                          placeholder="Group Code"
                          value={groupCode}
                          onChangeText={setGroupCode}
                          placeholderTextColor={Colors.theme1.inputPlaceholder}
                        />
                      </View>

                      <View style={styles.modalActions}>
                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={toggleJoinModal}
                        >
                          <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.modalButton}
                          onPress={joinGroup}
                        >
                          <Text style={styles.modalButtonText}>
                            Send request
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </Modal>
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
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
