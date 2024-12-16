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

export const PayersModal = ({
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
  productName?: string;
  type: "initial" | "assigned";
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
            marginTop: 20,
          }}
        >
          <View
            style={billModalStyles.gridContainer}
            onStartShouldSetResponder={() => true}
          >
            <View style={billModalStyles.rowStyle}>
              <Text
                style={{
                  ...billModalStyles.payerText,
                  ...billModalStyles.cellStyle,
                  color: Colors.theme1.text1,
                }}
              >
                Username
              </Text>
              <Text
                style={{
                  ...billModalStyles.payerText,
                  ...billModalStyles.cellStyle,
                  color: Colors.theme1.text1,
                }}
              >
                Pays
              </Text>
              <Text
                style={{
                  ...billModalStyles.payerText,
                  ...billModalStyles.cellStyle,
                  color: Colors.theme1.text1,
                }}
              >
                Fixed pay
              </Text>
            </View>
            {editedPayers.map((payer, idx) => (
              <View key={payer.user.id} style={billModalStyles.rowStyle}>
                <Text
                  style={{
                    ...billModalStyles.payerText,
                    ...billModalStyles.cellStyle,
                  }}
                >
                  {payer.user.username}
                </Text>
                <View style={billModalStyles.cellStyle}>
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
                <View>
                  <View style={billModalStyles.cellStyle}>
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
  gridContainer: {
    width: "100%",
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  cellStyle: {
    flex: 1,
    margin: 10,
    // borderColor: 'black',
    // borderWidth: 2
  },
  container: {
    maxHeight: Dimensions.get("screen").height * 0.5,
    width: "90%",
    backgroundColor: Colors.theme1.background1,
    padding: 20,
    borderRadius: 20,
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
});
