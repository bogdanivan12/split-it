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
  Dimensions,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
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
  const [groupName, setGroupName] = useState<string>("");
  const [groupDescription, setGroupDescription] = useState<string>("");

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
    toggleModal();
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
            <Text style={styles.header}>Which group are you tricking today?</Text>
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
                <Text style={styles.addButtonText}>Add Group</Text>
              </View>
            </TouchableOpacity>

            <Modal
              animationType="fade"
              visible={modalVisible}
              transparent={true}
              onRequestClose={toggleModal}
            >
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
                        style={styles.modalButtonCancel}
                        onPress={toggleModal}
                      >
                        <Text style={styles.modalButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalButtonCreate}
                        onPress={addGroup}
                      >
                        <Text style={styles.modalButtonText}>Create</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
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
    color: Colors.black,
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
  },
  text: {
    color: Colors.black,
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
    alignItems: "flex-start",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "AlegreyaBold",
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    position: "absolute",
    top: "30%",
    left: "5%",
    right: "5%",
    backgroundColor: Colors.theme1.background1,
    padding: 20,
    elevation: 5,
    borderRadius: 20
  },
  modalContent: {
    alignItems: "center",
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
