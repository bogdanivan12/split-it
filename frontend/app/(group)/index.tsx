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
import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/Theme";
import { Group as GroupType } from "@/types/Group.types";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import CenteredModal from "@/components/modals/CenteredModal";
import { generalStyles, modalStyles } from "@/constants/SharedStyles";
import { InviteModal } from "@/components/modals/InviteModal";
import { useAuth } from "@/context/AuthContext";
import { useGroup } from "@/utils/hooks/useGroup";
import { router, useGlobalSearchParams } from "expo-router";
import { CenteredLogoLoadingComponent } from "@/components/LogoLoadingComponent";
import { useRequest } from "@/utils/hooks/useRequest";
import { Requests } from "@/types/Request.types";
import { Message } from "@/components/Message";
import { ErrorIcon, SuccessIcon } from "@/components/Icons";
import { useIsFocused } from "@react-navigation/native";

const Group: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const { get, loading: groupLoading, update } = useGroup();
  const {
    acceptJoin,
    decline,
    getByGroup,
    checkIfUserExists,
    invite,
    loading: requestLoading,
  } = useRequest();
  const [shouldNotDisplayLoading, setShouldNotDisplayLoading] = useState(false);
  const { id } = useGlobalSearchParams();
  const [groupId] = useState(id as string);
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const isFocused = useIsFocused();
  const [groupDetails, setGroupDetails] = useState<GroupType>({
    description: "",
    joinCode: "",
    id: "",
    members: [],
    name: "",
    owner: { fullName: "", id: "", username: "" },
  });
  const [requests, setRequests] = useState<Requests>({
    sent: [],
    received: [],
  });
  const [editedDetails, setEditedDetails] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    setMessage(null);
    setSuccessMessage(null);
  }, [isFocused]);

  const accept = async (req_id: string) => {
    try {
      setShouldNotDisplayLoading(true);
      await acceptJoin(req_id, token!);
      setRequests({
        sent: [],
        received: [],
      });
      await refreshUser();
      setShouldNotDisplayLoading(false);
    } catch (err: any) {
      setMessage(err.message);
    }
  };
  const reject = async (req_id: string) => {
    try {
      await decline(req_id, token!);
      await refreshUser();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const userExistsCheck = async (username: string) => {
    const groupId = groupDetails.id;
    return await checkIfUserExists({ groupId, username }, token!);
  };
  const inviteUsers = async (usernames: string[]) => {
    const groupId = groupDetails.id;
    await invite({ groupId, usernames }, token!);
    setSuccessMessage("User invited");
  };

  const openModal = () => {
    setEditedDetails({
      name: groupDetails.name,
      description: groupDetails.description,
    });
    setEditModalOpen(true);
  };

  const isLoading = () => groupLoading || requestLoading;
  const save = async () => {
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
    try {
      await update(
        {
          _id: groupDetails.id,
          bill_ids: [],
          description: editedDetails.description,
          member_ids: groupDetails.members
            .map((m) => m.id)
            .concat(groupDetails.owner.id),
          name: editedDetails.name,
          owner_id: groupDetails.owner.id,
        },
        token!
      );
      await refreshUser();
      setEditModalOpen(false);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    if (!groupId) {
      router.replace("/(account)");
      return;
    }
    const f = async () => {
      try {
        const gr = await get(groupId, token!);
        setIsAdmin(gr.owner.id === user!.id);
        setGroupDetails(gr);
      } catch (err) {
        setMessage(
          "Failed to refresh group info. Please log out and try again."
        );
      }
    };
    f();
  }, [user]);

  useEffect(() => {
    const f = async () => {
      try{
        if (!isAdmin) return;
        if (groupDetails.id === "") return;
        setShouldNotDisplayLoading(true);
        const reqs = await getByGroup(groupDetails.id, token!);
        setShouldNotDisplayLoading(false);
        setRequests(reqs);
      }catch(error: any){
        setMessage("Could not get requests")
      }
    };
    f();
  }, [isAdmin, groupDetails]);

  useEffect(() => {
    if (groupDetails)
      setEditedDetails({
        name: groupDetails.name,
        description: groupDetails.description,
      });
  }, [groupDetails]);
  const discard = () => {
    setEditModalOpen(false);
  };
  if (
    isLoading() &&
    !editModalOpen &&
    !inviteModalOpen &&
    !shouldNotDisplayLoading
  )
    return <CenteredLogoLoadingComponent />;
  return (
    <View style={styles.container}>
      {isAdmin && (
        <CenteredModal
          onClose={() => setEditModalOpen(false)}
          visible={editModalOpen}
        >
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Edit group information</Text>
            {editModalOpen && isLoading() ? (
              <CenteredLogoLoadingComponent />
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
            )}
          </View>
        </CenteredModal>
      )}
      {isAdmin && (
        <InviteModal
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          checkIfUserExists={userExistsCheck}
          invite={inviteUsers}
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

      {message && <Message text={message} icon={ErrorIcon} />}
      {successMessage && (
        <Message
          text={successMessage}
          color={Colors.theme1.textAccept}
          icon={SuccessIcon}
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
      >
        <View>
          <Text style={styles.joinCodeHeader}>
            Join code: {groupDetails.joinCode}
          </Text>
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
              requests.received.map((req) => (
                <View key={req.id} style={styles.memberContainer}>
                  <Text style={styles.memberTextFullName}>
                    {req.sender.fullName}
                  </Text>
                  <Text style={styles.memberText}>{req.sender.username}</Text>
                  <View style={styles.groupRequestButtons}>
                    <TouchableOpacity onPress={() => reject(req.id)}>
                      <Entypo
                        size={36}
                        name="cross"
                        color={Colors.theme1.textReject}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => accept(req.id)}>
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
  joinCodeHeader: {
    fontSize: 20,
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
