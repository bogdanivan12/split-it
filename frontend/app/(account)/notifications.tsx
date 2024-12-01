import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/Theme";
import { GroupInvitation } from "@/types/Notification.types";
import { useAuth } from "@/context/AuthContext";

const notificationsData: GroupInvitation[] = [
  {
    sender: "string",
    requestId: "string",
    groupId: "string",
    groupName: "string",
  },
];

const Invitation = ({ invitation }: { invitation: GroupInvitation }) => {
  const accept = () => {};
  const decline = () => {};
  return (
    <View style={notificationStyles.container}>
      <View style={notificationStyles.textContainer}>
        <Text style={notificationStyles.title}>Group invite</Text>
        <Text style={notificationStyles.content}>
          {invitation.sender} has invited you to join {invitation.groupName}
        </Text>

        <View style={notificationStyles.actionButtons}>
          <TouchableOpacity
            style={notificationStyles.acceptButton}
            onPress={accept}
          >
            <Text style={notificationStyles.actionText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={notificationStyles.rejectButton}
            onPress={decline}
          >
            <Text style={notificationStyles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function Notifications() {
  const [invitations, setInvitations] = useState(notificationsData);
  const { user } = useAuth();

  useEffect(() => {
    
  }, [user])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={invitations}
        keyExtractor={(item) => item.requestId}
        contentContainerStyle={styles.notificationsList}
        renderItem={({ item }) => <Invitation invitation={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.theme1.background2,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.theme1.text,
  },
  notificationsList: {
    alignItems: "center",
  },
});

const notificationStyles = StyleSheet.create({
  container: {
    minWidth: "94%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    position: "relative",
    backgroundColor: Colors.theme1.background1,
  },
  unreadBubble: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    backgroundColor: "red",
    borderRadius: 6,
  },
  textContainer: {
    flexDirection: "column",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: Colors.theme1.text,
  },
  content: {
    fontSize: 14,
    marginBottom: 10,
    color: Colors.theme1.text2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  acceptButton: {
    backgroundColor: Colors.theme1.background1,
    padding: 8,
    borderRadius: 5,
  },
  rejectButton: {
    backgroundColor: Colors.theme1.background1,
    padding: 8,
    borderRadius: 5,
  },
  goToGroupButton: {
    backgroundColor: Colors.theme1.background3,
    padding: 8,
    borderRadius: 5,
  },
  actionText: {
    color: Colors.theme1.text,
    fontSize: 14,
    fontWeight: "bold",
  },
});
