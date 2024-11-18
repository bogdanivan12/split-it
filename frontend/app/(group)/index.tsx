import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/Theme";
import { Group as GroupType } from "@/types/Group.types";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import CenteredModal from "@/components/modals/CenteredModal";
import { generalStyles, modalStyles } from "@/constants/SharedStyles";
import { InviteModal } from "@/components/modals/InviteModal";

const gd: GroupType = {
  id: "group1",
  name: "Group1",
  description: "This is a description for Group1.",
  owner: {
    fullName: "Vlad Rosu",
    id: "1",
    username: "vlandero",
  },
  members: [
    {
      fullName: "Anelis",
      id: "2",
      username: "anelis123",
    },
    {
      fullName: "Bogdan",
      id: "3",
      username: "scrum_master",
    },
    {
      fullName: "Octavian",
      id: "4",
      username: "nitoiu",
    },
  ],
  pendingMembers: [
    {
      fullName: "Octavian2",
      id: "5",
      username: "nitoiu2",
    },
  ],
};

const Group: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [groupDetails, setGroupDetails] = useState(gd);
  const [editedDetails, setEditedDetails] = useState({
    name: gd.name,
    description: gd.description,
  });
  const accept = (member: string) => {};
  const reject = (member: string) => {};
  const openModal = () => {
    setEditedDetails({
      name: groupDetails.name,
      description: groupDetails.description,
    });
    setEditModalOpen(true);
  };
  const save = () => {
    if (editedDetails.name.trim() === "") {
      Alert.alert("Required", "The name is required for a group", [
        {
          text: "OK",
          onPress: () => {},
          style: "cancel",
        },
      ]);
      return;
    }
    setEditModalOpen(false);
    setGroupDetails((prev) => ({
      ...prev,
      description: editedDetails.description,
      name: editedDetails.name,
    }));
  };
  const discard = () => {
    setEditModalOpen(false);
  };
  return (
    <View style={styles.container}>
      {isAdmin && (
        <CenteredModal
          onClose={() => setEditModalOpen(false)}
          visible={editModalOpen}
        >
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Edit group information</Text>
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
                  style={generalStyles.input}
                  placeholder="Group Name (required)"
                  value={editedDetails.name}
                  onChangeText={(i) =>
                    setEditedDetails((prev) => ({ ...prev, name: i }))
                  }
                  placeholderTextColor={Colors.theme1.inputPlaceholder}
                />

                <TextInput
                  style={[modalStyles.input, modalStyles.descriptionInput]}
                  placeholder="Group Description (optional)"
                  value={editedDetails.description}
                  onChangeText={(i) =>
                    setEditedDetails((prev) => ({ ...prev, description: i }))
                  }
                  placeholderTextColor={Colors.theme1.inputPlaceholder}
                  multiline
                />
              </View>

              <View style={modalStyles.modalActions}>
                <TouchableOpacity
                  style={modalStyles.modalButton}
                  onPress={discard}
                >
                  <Text style={modalStyles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={modalStyles.modalButton}
                  onPress={save}
                >
                  <Text style={modalStyles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </CenteredModal>
      )}
      {isAdmin && (
        <InviteModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
        />
      )}
      <View style={styles.headerWrapper}>
        <Text style={styles.header}>{groupDetails.name}</Text>
        {isAdmin && (
          <TouchableOpacity onPress={openModal}>
            <FontAwesome name="pencil" size={30} color={Colors.theme1.text} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.description}>{groupDetails.description}</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
      >
        <View>
          <Text style={styles.sectionHeader}>Group Master</Text>
          <View
            key={groupDetails.owner.id}
            style={{ ...styles.memberContainer, marginLeft: 2 }}
          >
            <Text style={styles.memberTextFullName}>
              {groupDetails.owner.fullName}
            </Text>
            <Text style={styles.memberText}>{groupDetails.owner.username}</Text>
          </View>

          <Text style={styles.sectionHeader}>Members</Text>
          <View style={styles.membersContainer}>
            {groupDetails.members.map((member) => (
              <View key={member.id} style={styles.memberContainer}>
                <Text style={styles.memberTextFullName}>{member.fullName}</Text>
                <Text style={styles.memberText}>{member.username}</Text>
              </View>
            ))}
            {isAdmin &&
              groupDetails.pendingMembers.map((member) => (
                <View key={member.id} style={styles.memberContainer}>
                  <Text style={styles.memberTextFullName}>
                    {member.fullName}
                  </Text>
                  <Text style={styles.memberText}>{member.username}</Text>
                  <View style={styles.groupRequestButtons}>
                    <TouchableOpacity onPress={() => reject(member.username)}>
                      <Entypo
                        size={36}
                        name="cross"
                        color={Colors.theme1.textReject}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => accept(member.username)}>
                      <Entypo
                        size={36}
                        name="check"
                        color={Colors.theme1.textAccept}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            {isAdmin && (
              <TouchableOpacity onPress={() => setInviteModalOpen(true)}>
                <View style={styles.memberContainer}>
                  <FontAwesome
                    name="plus-square"
                    size={80}
                    color={Colors.theme1.text2}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Group;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.theme1.background2,
  },
  headerWrapper: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    fontSize: 27,
    fontFamily: "AlegreyaMedium",
    fontWeight: "bold",
    color: Colors.theme1.text,
  },
  description: {
    fontSize: 17,
    fontFamily: "AlegreyaMedium",
    color: Colors.theme1.text4,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 24,
    fontFamily: "AlegreyaMedium",
    fontWeight: "bold",
    color: Colors.theme1.text,
    marginTop: 10,
    marginBottom: 5,
  },
  membersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  memberContainer: {
    backgroundColor: Colors.theme1.background1,
    width: Dimensions.get("window").width * 0.4,
    height: Dimensions.get("window").width * 0.4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 8,
  },
  memberText: {
    fontFamily: "AlegreyaItalic",
    fontSize: 16,
    color: Colors.theme1.text3,
    textAlign: "center",
  },
  memberTextFullName: {
    fontFamily: "AlegreyaMedium",
    fontSize: 16,
    color: Colors.theme1.text1,
    fontStyle: "italic",
    textAlign: "center",
  },
  groupRequestButtons: {
    width: "100%",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});
