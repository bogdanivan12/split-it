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
  TextInput,
} from "react-native";
import { modalStyles } from "@/constants/SharedStyles";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Colors } from "@/constants/Theme";

export const PayersModal = ({
  open,
  onClose,
  payers,
  save,
  canEdit,
  type,
  productName,
}: {
  open: boolean;
  onClose: () => void;
  save: (payers: Payer[]) => void;
  payers: Payer[];
  canEdit?: boolean;
  productName?: string;
  type: "initial" | "assigned";
}) => {
  const [editedPayers, setEditedPayers] = useState<
    (Payer & { editedAmount?: string })[]
  >(payers.map((p) => ({ ...p, editedAmount: p.amount?.toString() })));
  useEffect(() => {
    setEditedPayers(
      payers.map((p) => ({ ...p, editedAmount: p.amount?.toString() }))
    );
  }, [payers]);
  return (
    <CenteredModal
      onClose={() => {
        onClose();
        setEditedPayers(
          payers.map((p) => ({ ...p, editedAmount: p.amount?.toString() }))
        );
      }}
      visible={open}
    >
      <View style={billModalStyles.container}>
        <Text style={modalStyles.modalTitle}>
          {type === "initial"
            ? "Who pays this bill?"
            : `Who should pay for this product\n${productName || ""}`}
        </Text>
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
                    disableText
                    isChecked={payer.assigned}
                    useBuiltInState={false}
                    onPress={() => {
                      if (!canEdit) return;
                      const updated = editedPayers.map((p, i) =>
                        i === idx ? { user: p.user, assigned: !p.assigned } : p
                      );
                      setEditedPayers(updated);
                    }}
                  />
                </View>
                <View style={billModalStyles.cellStyle}>
                  {payer.assigned && (
                    <BouncyCheckbox
                      disableText
                      isChecked={payer.amount !== undefined}
                      useBuiltInState={false}
                      onPress={() => {
                        if (!canEdit) return;
                        const updated = editedPayers.map((p, i) => {
                          if (i === idx) {
                            const upd: Payer = {
                              user: p.user,
                              assigned: p.assigned,
                            };
                            if (p.amount === undefined) {
                              upd.amount = 0;
                            }
                            return upd;
                          }
                          return p;
                        });
                        setEditedPayers(updated);
                      }}
                    />
                  )}
                  {payer.amount !== undefined && (
                    <TextInput
                      style={{
                        backgroundColor: "white",
                        width: 40,
                        borderRadius: 10,
                        padding: 5,
                      }}
                      value={payer.editedAmount || ""}
                      keyboardType="numeric"
                      onChangeText={(text) => {
                        const updated = editedPayers.map((p, i) =>
                          i === idx
                            ? {
                                ...p,
                                editedAmount: text.replace(",", ".") || "",
                                amount: parseFloat(text.replace(",", ".")) || 0,
                              }
                            : p
                        );
                        setEditedPayers(updated);
                      }}
                    />
                  )}
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
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  rowStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cellStyle: {
    flex: 1,
    margin: 5,
    gap: 5,
    flexDirection: "row",
    textAlign: "center",
    justifyContent: "center",
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
