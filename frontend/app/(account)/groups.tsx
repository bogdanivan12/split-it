import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Theme";

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
  const [groupName, setGroupName] = useState<string>("");
  const [groupDescription, setGroupDescription] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [selectedInvites, setSelectedInvites] = useState<string[]>([]);

  const toggleModal = () => setModalVisible(!modalVisible);

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
    setGroupName("");
    setGroupDescription("");
    setSelectedInvites([]);
    toggleModal();
  };

  // Handle toggling invite selection
  const handleInviteToggle = (username: string) => {
    if (selectedInvites.includes(username)) {
      setSelectedInvites(selectedInvites.filter((u) => u !== username));
    } else {
      setSelectedInvites([...selectedInvites, username]);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.container}>
          <Text style={styles.header}>Groups</Text>
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Link asChild href={{pathname: `/(group)`, params: {id: item.name.toLowerCase()}}}>
                <Pressable style={styles.button}>
                  <Text style={styles.text}>{`Go to ${item.name}`}</Text>
                </Pressable>
              </Link>
            )}
            style={styles.groupList}
          />

          <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
            <View style={styles.addButtonContent}>
              <FontAwesome name="plus" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Group</Text>
            </View>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={toggleModal}
          >
            <TouchableWithoutFeedback onPress={toggleModal}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Create New Group</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Group Name (required)"
                  value={groupName}
                  onChangeText={setGroupName}
                />

                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="Group Description (optional)"
                  value={groupDescription}
                  onChangeText={setGroupDescription}
                  multiline
                />

                <TextInput
                  style={styles.input}
                  placeholder="Search users to invite..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalButtonCancel} onPress={toggleModal}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButtonCreate} onPress={addGroup}>
                    <Text style={styles.modalButtonText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Groups;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.theme1.background2,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
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
    marginVertical: 5,
    borderRadius: 5,
  },
  text: {
    color: Colors.theme1.text2,
    textAlign: "center",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Colors.theme1.button3,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    width: "60%",
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    position: "absolute",
    top: "20%",
    left: "5%",
    right: "5%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalContent: {
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.theme1.text,
  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: Colors.theme1.tint,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    color: Colors.theme1.inputText,
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
  },
  modalButtonCancel: {
    backgroundColor: Colors.theme1.button,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  modalButtonCreate: {
    backgroundColor: Colors.theme1.button,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
