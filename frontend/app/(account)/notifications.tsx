import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/Theme";

type NotificationType = "groupInvite" | "joinRequest" | "informative";

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  seen: boolean;
}

const notificationsData: NotificationProps[] = [
  {
    id: "1",
    type: "groupInvite",
    title: "Group Invite",
    content: "You have been invited to join 'React Devs'",
    seen: false,
  },
  {
    id: "2",
    type: "joinRequest",
    title: "Join Request",
    content: "John Doe requested to join 'React Devs'",
    seen: false,
  },
  {
    id: "3",
    type: "informative",
    title: "Invite Response",
    content: "Jane Doe accepted your invite to 'React Devs'",
    seen: false,
  },
];

const Notification = ({
  notification,
  onAction,
}: {
  notification: NotificationProps;
  onAction: (id: string, action: string) => void;
}) => {
  return (
    <View style={notificationStyles.container}>
      {!notification.seen && <View style={notificationStyles.unreadBubble} />}
      <View style={notificationStyles.textContainer}>
        <Text style={notificationStyles.title}>{notification.title}</Text>
        <Text style={notificationStyles.content}>{notification.content}</Text>
        {notification.type === "groupInvite" && (
          <View style={notificationStyles.actionButtons}>
            <TouchableOpacity
              style={notificationStyles.acceptButton}
              onPress={() => onAction(notification.id, "accept")}
            >
              <Text style={notificationStyles.actionText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={notificationStyles.rejectButton}
              onPress={() => onAction(notification.id, "reject")}
            >
              <Text style={notificationStyles.actionText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {notification.type === "joinRequest" && (
          <View style={notificationStyles.actionButtons}>
            <TouchableOpacity
              style={notificationStyles.acceptButton}
              onPress={() => onAction(notification.id, "accept")}
            >
              <Text style={notificationStyles.actionText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={notificationStyles.rejectButton}
              onPress={() => onAction(notification.id, "reject")}
            >
              <Text style={notificationStyles.actionText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={notificationStyles.goToGroupButton}
              onPress={() => onAction(notification.id, "goToGroup")}
            >
              <Text style={notificationStyles.actionText}>Go to Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(notificationsData);

  const handleAction = (id: string, action: string) => {
    if (action === "accept" || action === "reject") {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } else if (action === "goToGroup") {
      console.log(`Go to group action for notification ID: ${id}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        renderItem={({ item }) => (
          <Notification notification={item} onAction={handleAction} />
        )}
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
