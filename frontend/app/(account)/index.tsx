import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
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
import { useAccount } from "@/utils/hooks/useAccount";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/types/ApiError.types";
import {
  CenteredLogoLoadingComponent,
  LogoLoadingComponent,
} from "@/components/LogoLoadingComponent";

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
  const { logout: logoutUser, token, user, refreshUser } = useAuth();
  const [editedUser, setEditedUser] = useState(user!);
  const [isEditing, setIsEditing] = useState(false);
  const [actionsBlocked, setActionsBlocked] = useState(false);

  const [animPlay, setAnimPlay] = useState(false);

  const [scaleAnim] = useState(new Animated.Value(1));

  const { del, update, loading } = useAccount();
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

  useEffect(() => {
    if (!(user && token)) {
      router.replace("/(intro)");
      return;
    }
  }, [user, token]);

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
        if (!prev) setEditedUser(user!);
        return !prev;
      });
    });
  };

  const handleSave = () => {
    if (actionsBlocked) return;
    playAnimationTimeout(() => {
      update(
        {
          email: editedUser.email,
          full_name: editedUser.fullName,
          phone_number: editedUser.phoneNumber,
        },
        token!
      )
        .then(() => refreshUser())
        .catch((error) => {
          const err = error as ApiError;
          console.log(`error when handling save ${JSON.stringify(err)}`);
        });
      // some loading icon near, instead of the pen, display the edit while the update is loading
      setIsEditing(false);
    });
  };

  const cancelEdit = () => {
    if (actionsBlocked) return;
    playAnimationTimeout(() => {
      setEditedUser(user!);
      setIsEditing(false);
    });
  };

  const logout = () => {
    if (actionsBlocked) return;
    logoutUser();
  };

  const deleteAccount = async () => {
    if (actionsBlocked) return;
    await del(token!);
    logoutUser();
  };

  const deleteAccountClick = async () => {
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
        {
          text: "YES, DELETE MY ACCOUNT",
          onPress: async () => await deleteAccount(),
        },
      ]
    );
  };

  const flip = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  if (!(user && token)) return <CenteredLogoLoadingComponent />;

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (Keyboard.isVisible()) Keyboard.dismiss();
      }}
    >
      <KeyboardAvoidingView
        onStartShouldSetResponder={() => true}
        style={styles.container}
      >
        <Animated.View
          style={[styles.profileBox, { transform: [{ scaleX: flip }] }]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            {!isEditing && !loading && (
              <TouchableOpacity onPress={handleEditToggle}>
                <FontAwesome
                  name="pencil"
                  size={24}
                  color={Colors.theme1.text3}
                />
              </TouchableOpacity>
            )}
            {!isEditing && loading && <LogoLoadingComponent size={24} />}
          </View>
          <ScrollView
            contentContainerStyle={generalStyles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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
                !actionsBlocked && setEditedUser({ ...editedUser, email: text })
              }
              value={editedUser.email}
            />

            <ProfileField
              isEditing={isEditing}
              name="Full Name"
              onChange={(text) =>
                !actionsBlocked &&
                setEditedUser({
                  ...editedUser,
                  ...(text.trim().length > 0 && { fullName: text }),
                })
              }
              value={editedUser.fullName || ""}
            />

            <ProfileField
              isEditing={isEditing}
              name="Phone Number"
              onChange={(text) =>
                !actionsBlocked &&
                setEditedUser(
                  {
                    ...editedUser,
                    ...(text.trim().length > 0 && { phoneNumber: text }),
                  }
                  // verify phone number mechanism
                )
              }
              value={editedUser.phoneNumber || ""}
            />

            {isEditing && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={{
                    ...styles.editButton,
                    backgroundColor: Colors.theme1.button3,
                  }}
                  onPress={cancelEdit}
                >
                  <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleSave}
                >
                  <Text
                    style={{
                      ...styles.buttonText,
                      color: Colors.theme1.text1,
                    }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={{ ...styles.buttonText, color: Colors.theme1.text2 }}>
            Logout
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ ...styles.logoutButton, marginBottom: "30%" }}
          onPress={deleteAccountClick}
        >
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
    maxHeight: "65%",
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
    marginBottom: 10,
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
    color: Colors.theme1.text3,
  },
  value: {
    fontFamily: "AlegreyaRegular",
    fontSize: 16,
    color: Colors.theme1.inputText,
    marginTop: 5,
  },
  input: {
    ...generalStyles.input,
    width: "99%",
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: Colors.theme1.button2,
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
    color: Colors.theme1.text,
    fontSize: 16,
    fontWeight: "bold",
  },
});
