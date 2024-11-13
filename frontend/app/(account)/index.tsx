import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Animated,
  Easing,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { User } from "@/types/User.types";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Theme";
import { generalStyles } from "@/constants/SharedStyles";
import { router } from "expo-router";

const hardcodedUser: User = {
  id: "1",
  fullName: "Vlad Rosu",
  groupIds: ["Group1", "Group2"],
  phoneNumber: "123456",
  username: "vlandero",
  email: "vlad@vlad.ro",
};

const ProfileField = ({
  isEditing,
  name,
  value,
  onChange,
  editable = true,
}: {
  isEditing: boolean;
  name: string;
  value: string;
  onChange: (text: string) => void;
  editable?: boolean;
}) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{name}:</Text>
      {isEditing && editable ? (
        <TextInput style={styles.input} value={value} onChangeText={onChange} />
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  );
};

export default function Profile() {
  const [user, setUser] = useState<User>(hardcodedUser);
  const [editedUser, setEditedUser] = useState(hardcodedUser);
  const [isEditing, setIsEditing] = useState(false);
  const [actionsBlocked, setActionsBlocked] = useState(false);

  const [animPlay, setAnimPlay] = useState(false);

  const [scaleAnim] = useState(new Animated.Value(1));
  const timeToFlip = 700;

  useEffect(() => {
    if (!animPlay) return;
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: timeToFlip / 2,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: timeToFlip / 2,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animPlay]);

  const playAnimationTimeout = (f: () => void) => {
    setAnimPlay(true);
    setActionsBlocked(true);
    setTimeout(() => {
      f();
      setTimeout(() => {
        setActionsBlocked(false);
        setAnimPlay(false);
      }, timeToFlip / 2);
    }, timeToFlip / 2);
  };

  const handleEditToggle = () => {
    if (actionsBlocked) return;
    playAnimationTimeout(() => {
      setIsEditing((prev) => {
        if (!prev) setEditedUser(user);
        return !prev;
      });
    });
  };

  const handleSave = () => {
    if (actionsBlocked) return;
    playAnimationTimeout(() => {
      setUser(editedUser);
      setIsEditing(false);
    });
  };

  const cancelEdit = () => {
    if (actionsBlocked) return;
    playAnimationTimeout(() => {
      setEditedUser(user);
      setIsEditing(false);
    });
  };

  const logout = () => {
    if (actionsBlocked) return;
    router.replace("/(intro)");
  };

  const deleteAccount = () => {
    router.replace("/(intro)");
  };

  const deleteAccountClick = () => {
    if (actionsBlocked) return;
    Alert.alert(
      "Delete account",
      "Are you sure you want to delete your account? You will be removed from all groups.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        { text: "YES, DELETE MY ACCOUNT", onPress: () => deleteAccount() },
      ]
    );
  };

  const flip = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (Keyboard.isVisible()) Keyboard.dismiss();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Animated.View
          style={[styles.profileBox, { transform: [{ scaleX: flip }] }]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            {!isEditing && (
              <TouchableOpacity onPress={handleEditToggle}>
                <FontAwesome
                  name="pencil"
                  size={24}
                  color={Colors.black}
                />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            contentContainerStyle={generalStyles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View onStartShouldSetResponder={() => true}>
              <ProfileField
                isEditing={isEditing}
                name="Username"
                editable={false}
                onChange={(text) =>
                  !actionsBlocked &&
                  setEditedUser({ ...editedUser, username: text })
                }
                value={editedUser.username}
              />

              <ProfileField
                isEditing={isEditing}
                name="Email"
                editable={false}
                onChange={(text) =>
                  !actionsBlocked &&
                  setEditedUser({ ...editedUser, email: text })
                }
                value={editedUser.email}
              />

              <ProfileField
                isEditing={isEditing}
                name="Full Name"
                onChange={(text) =>
                  !actionsBlocked &&
                  setEditedUser({ ...editedUser, fullName: text })
                }
                value={editedUser.fullName}
              />

              <ProfileField
                isEditing={isEditing}
                name="Phone Number"
                onChange={(text) =>
                  !actionsBlocked &&
                  setEditedUser(
                    {
                      ...editedUser,
                      phoneNumber: text,
                    }
                    // verify phone number mechanism
                  )
                }
                value={editedUser.phoneNumber}
              />

              {isEditing && (
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={cancelEdit}
                  >
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={{ ...styles.buttonText, color: Colors.theme1.text2 }}>
            Logout
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={deleteAccountClick}>
          <Text
            style={{
              ...styles.buttonText,
              fontFamily: "AlegreyaBold",
              color: Colors.theme1.text2,
            }}
          >
            Delete Account
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.theme1.background2,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 0,
  },
  profileBox: {
    width: "90%",
    padding: 20,
    backgroundColor: Colors.theme1.background1,
    borderRadius: 10,
    shadowColor: Colors.theme1.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: "AlegreyaBold",
    fontSize: 24,
    fontWeight: "bold",
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontFamily: "AlegreyaMedium",
    fontSize: 16,
    color: Colors.theme1.text,
  },
  value: {
    fontFamily: "AlegreyaRegular",
    fontSize: 18,
    color: Colors.theme1.inputText,
    marginTop: 5,
  },
  input: {
    ...generalStyles.input,
    width: "99%"
  },
  saveButton: {
    backgroundColor: Colors.theme1.button2,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    width: "40%",
  },
  backButton: {
    backgroundColor: Colors.theme1.button,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    width: "40%",
  },
  logoutButton: {
    backgroundColor: Colors.theme1.button3,
    padding: 12,
    width: "50%",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontFamily: "AlegreyaRegular",
    color: Colors.black,
    fontSize: 16,
    fontWeight: "bold",
  },
});
