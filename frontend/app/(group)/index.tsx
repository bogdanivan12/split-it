import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { Colors } from "@/constants/Theme";
import { Group as GroupType } from "@/types/Group.types";

const groupDetails: GroupType = {
  id: "1",
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
};

const Group: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{groupDetails.name}</Text>
      <Text style={styles.description}>{groupDetails.description}</Text>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View>
          <Text style={styles.sectionHeader}>Group Master</Text>
          <View key={groupDetails.owner.id} style={{...styles.memberContainer, marginLeft: 2}}>
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
  header: {
    fontSize: 27,
    fontFamily: "AlegreyaMedium",
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.theme1.text,
  },
  description: {
    fontSize: 17,
    fontFamily: "AlegreyaMedium",
    color: Colors.theme1.text3,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 24,
    fontFamily: "AlegreyaMedium",
    fontWeight: "bold",
    color: Colors.black,
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
    width: "44%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 8,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
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
    color: Colors.theme1.text,
    fontStyle: "italic",
    textAlign: "center",
  },
});
