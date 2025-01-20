import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useGlobalSearchParams } from "expo-router";
import { Colors } from "@/constants/Theme";
import { Paymentt } from "@/types/Payment.types";
import { AntDesign } from "@expo/vector-icons";
import CenteredModal from "@/components/modals/CenteredModal";
import { modalStyles } from "@/constants/SharedStyles";
import { useBill } from "@/utils/hooks/useBill";
import { useAuth } from "@/context/AuthContext";

const Payment = ({
  userFrom,
  amount,
  status,
  onClick,
}: Paymentt & { onClick: () => void }) => {
  return (
    <View style={styles.payment}>
      <View style={styles.paymentLeft}>
        <Text style={{ ...styles.paymentText, fontSize: 20 }}>
          {userFrom.username}
        </Text>
      </View>
      <View style={styles.paymentRight}>
        <Text
          style={{
            ...styles.paymentText,
            fontSize: 15,
            alignSelf: "center",
            color: Colors.theme1.text2,
          }}
        >
          Has to pay: {amount}
        </Text>
        {status === "IN_PROGRESS" && (
          <TouchableOpacity onPress={onClick}>
            <AntDesign
              name="exclamation"
              size={20}
              color={Colors.theme1.textReject}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ConfirmModal = ({
  onClose,
  open,
  payment,
  onAccept,
  onReject,
}: {
  onClose: () => void;
  open: boolean;
  payment: Paymentt;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}) => {
  return (
    <CenteredModal
      onClose={() => {
        onClose();
      }}
      visible={open}
    >
      <View
        style={{
          ...modalStyles.modalContainer,
          maxHeight: Dimensions.get("screen").height * 0.5,
        }}
      >
        <Text style={modalStyles.modalTitle}>
          Did {payment.userFrom.username} pay you?
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={async () => {
              await onReject();
              onClose();
            }}
          >
            <View style={styles.payButton}>
              <Text style={{ ...styles.paymentText }}>No</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await onAccept();
              onClose();
            }}
          >
            <View style={styles.payButton}>
              <Text style={{ ...styles.paymentText }}>Yes</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </CenteredModal>
  );
};

export default function Receive() {
  const { id } = useGlobalSearchParams();
  const { getPayments, acceptPayment, rejectPayment } = useBill();
  const [selectedPayment, setSelectedPayment] = useState<Paymentt | null>(null);
  const { refreshUser, token, user } = useAuth();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [payments, setPayments] = useState<Paymentt[]>([]);
  const [groupId] = useState(id as string);
  useEffect(() => {
    if (selectedPayment === null) {
      setModalOpen(false);
      return;
    }
    setModalOpen(true);
  }, [selectedPayment]);

  useEffect(() => {
    const f = async () => {
      try {
        const p = await getPayments(groupId, token!);
        setPayments(
          p.filter(
            (pm) => pm.userTo.id === user?.id && pm.status !== "COMPLETED"
          )
        );
      } catch (error: any) {}
    };
    f();
  }, [user]);
  return (
    <View style={styles.container}>
      <View style={styles.paymentsContainer}>
        {payments.map((p) => (
          <Payment
            {...p}
            key={`${p.userTo.username} to ${p.userFrom.username}`}
            onClick={() => setSelectedPayment(p)}
          />
        ))}
      </View>
      {selectedPayment && (
        <ConfirmModal
          payment={selectedPayment}
          open={modalOpen}
          onClose={() => {
            setSelectedPayment(null);
            setModalOpen(false);
          }}
          onAccept={async () => {
            await acceptPayment(selectedPayment.id, token!);
            refreshUser();
          }}
          onReject={async () => {
            await rejectPayment(selectedPayment.id, token!);
            refreshUser();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.theme1.background2,
  },
  paymentsContainer: {
    gap: 15,
    marginTop: 15,
  },
  payment: {
    backgroundColor: Colors.theme1.background1,
    width: "89%",
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    paddingHorizontal: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentRight: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 5,
    gap: 10,
  },
  paymentLeft: {},
  paymentText: {
    fontFamily: "AlegreyaMedium",
    color: Colors.theme1.text1,
  },
  payButton: {
    padding: 10,
    backgroundColor: Colors.theme1.button2,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    alignSelf: "center",
    borderRadius: 20,
  },
});
