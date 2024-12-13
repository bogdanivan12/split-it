import { Payer } from "@/types/Bill.types";
import { useEffect, useState } from "react";
import CenteredModal from "./CenteredModal";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { generalStyles, modalStyles } from "@/constants/SharedStyles";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Colors } from "@/constants/Theme";

export const AssignedPayersModal = ({
  open,
  onClose,
  payers,
  productName,
  save,
  canEdit,
}: {
  open: boolean;
  onClose: () => void;
  payers: Payer[];
  productName: string;
  save: (payers: Payer[]) => void;
  canEdit?: boolean;
}) => {
  const [editedPayers, setEditedPayers] = useState(payers);
  useEffect(() => {
    setEditedPayers(payers);
  }, [payers]);
  return (
    <CenteredModal onClose={onClose} visible={open}>
      <View style={billModalStyles.container}>
        <Text style={modalStyles.modalTitle}>
          Who should pay for this product?{"\n"}
          {productName}
        </Text>
        <ScrollView
          contentContainerStyle={{
            ...generalStyles.scrollContainer,
            marginTop: 20,
          }}
        >
          <View style={billModalStyles.payersContainer}>
            {editedPayers.map((payer, idx) => (
              <View
                key={payer.user.id}
                style={billModalStyles.payer}
                onStartShouldSetResponder={() => true}
              >
                <Text style={billModalStyles.payerText}>
                  {payer.user.username}
                </Text>
                <View style={billModalStyles.checkboxContainer}>
                  <BouncyCheckbox
                    isChecked={payer.assigned}
                    useBuiltInState={false}
                    onPress={() => {
                      if (!canEdit) return;
                      const updated = editedPayers.map((p, i) =>
                        i === idx ? { ...p, assigned: !p.assigned } : p
                      );
                      setEditedPayers(updated);
                    }}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => {
                save(editedPayers);
                onClose();
              }}
            >
              <View style={billModalStyles.saveButton}>
                <Text
                  style={{
                    ...billModalStyles.payerText,
                    color: Colors.theme1.text1,
                  }}
                >
                  Save
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </CenteredModal>
  );
};

export const InitialPayersModal = ({
  open,
  onClose,
  payers,
  save,
  canEdit,
}: {
  open: boolean;
  onClose: () => void;
  save: (payers: Payer[]) => void;
  payers: Payer[];
  canEdit?: boolean;
}) => {
  const [editedPayers, setEditedPayers] = useState(payers);
  useEffect(() => {
    setEditedPayers(payers);
  }, [payers]);
  return (
    <CenteredModal onClose={onClose} visible={open}>
      <View style={billModalStyles.container}>
        <Text style={modalStyles.modalTitle}>Who pays this bill?</Text>
        <ScrollView
          contentContainerStyle={{
            ...generalStyles.scrollContainer,
            marginTop: 20,
          }}
        >
          <View
            style={billModalStyles.payersContainer}
            onStartShouldSetResponder={() => true}
          >
            {editedPayers.map((payer, idx) => (
              <View key={payer.user.id} style={billModalStyles.payer}>
                <Text style={billModalStyles.payerText}>
                  {payer.user.username}
                </Text>
                <View style={billModalStyles.checkboxContainer}>
                  <BouncyCheckbox
                    isChecked={payer.assigned}
                    useBuiltInState={false}
                    onPress={() => {
                      if (!canEdit) return;
                      const updated = editedPayers.map((p, i) =>
                        i === idx ? { ...p, assigned: !p.assigned } : p
                      );
                      setEditedPayers(updated);
                    }}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => {
                save(editedPayers);
                onClose();
              }}
            >
              <View style={billModalStyles.saveButton}>
                <Text
                  style={{
                    ...billModalStyles.payerText,
                    color: Colors.theme1.text1,
                  }}
                >
                  Save
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </CenteredModal>
  );
};

const billModalStyles = StyleSheet.create({
  container: {
    maxHeight: Dimensions.get("screen").height * 0.5,
    width: "90%",
    backgroundColor: Colors.theme1.background1,
    padding: 20,
    borderRadius: 20,
  },
  payer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  payerText: {
    fontFamily: "AlegreyaMedium",
    color: "white",
  },
  saveButton: {
    backgroundColor: Colors.theme1.button2,
    padding: 10,
    borderRadius: 10,
  },
  payersContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  checkboxContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  smallText: {
    fontFamily: "AlegreyaMedium",
    fontSize: 14,
  },
});
