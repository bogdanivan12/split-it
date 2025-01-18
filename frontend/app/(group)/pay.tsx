import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Theme";
import { Paymentt } from "@/types/Payment.types";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import CenteredModal from "@/components/modals/CenteredModal";
import { modalStyles } from "@/constants/SharedStyles";
import { Message } from "@/components/Message";
import { useBill } from "@/utils/hooks/useBill";
import { useAuth } from "@/context/AuthContext";

const Payment = ({
  userTo,
  amount,
  status,
  onClick,
}: Paymentt & { onClick: () => void }) => {
  return (
    <View style={styles.payment}>
      <View style={styles.paymentLeft}>
        <Text style={{ ...styles.paymentText, fontSize: 20 }}>
          {userTo.username}
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
          To pay: {amount}
        </Text>
        {status === "NOT_STARTED" && (
          <TouchableOpacity onPress={onClick}>
            <FontAwesome name="money" size={20} color={Colors.theme1.text2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const PayModal = ({
  onClose,
  open,
  payment,
}: {
  onClose: () => void;
  open: boolean;
  payment: Paymentt;
}) => {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <CenteredModal
      onClose={() => {
        onClose();
        setMessage(null);
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
          Do a payment to {payment.userTo.username}
        </Text>
        <Text style={{ ...styles.paymentText, alignSelf: "center" }}>
          You have to pay {payment.amount}
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ ...styles.paymentText }}>Pay with Revolut</Text>
          <TouchableOpacity
            onPress={async () => {
              if(!payment.userTo.revolut){
                setMessage("User did not set up revolut!")
                return;
              }
              const url = `googlechrome://revolut.me/${payment.userTo.revolut}/${payment.amount}ron`;
              const supported = await Linking.canOpenURL(url);
              console.log(supported);
              await Linking.openURL(url);
            }}
          >
            <MaterialIcons
              name="payment"
              size={20}
              color={Colors.theme1.text2}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            // full payment
            // call sendPaymentsNotifications
          }}
        >
          <View style={styles.payButton}>
            <Text style={{ ...styles.paymentText }}>
              Let them know that you paid
            </Text>
          </View>
        </TouchableOpacity>
        {message !== null && (
          <Message
            containerStyle={{ alignSelf: "center", marginTop: 10 }}
            text={message}
          />
        )}
      </View>
    </CenteredModal>
  );
};

export default function Pay() {
  const { id } = useLocalSearchParams();
  const { getPayments } = useBill();
  const [selectedPayment, setSelectedPayment] = useState<Paymentt | null>(null);
  const { refreshUser, token, user } = useAuth();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [payments, setPayments] = useState<Paymentt[]>([]);

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
        const p = await getPayments();
        setPayments(p);
      } catch (error: any) {}
    };
    f();
  });
  return (
    <View style={styles.container}>
      <View style={styles.paymentsContainer}>
        {payments
          .filter((p) => p.status === "NOT_STARTED")
          .map((p) => (
            <Payment
              key={`${p.userTo.username} to ${p.userFrom.username}`}
              userTo={p.userTo}
              userFrom={p.userFrom}
              amount={p.amount}
              onClick={() => setSelectedPayment(p)}
              status={p.status}
            />
          ))}
      </View>
      {selectedPayment && (
        <PayModal
          payment={selectedPayment}
          open={modalOpen}
          onClose={() => setSelectedPayment(null)}
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
    width: "70%",
    padding: 10,
    backgroundColor: Colors.theme1.button2,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    alignSelf: "center",
    borderRadius: 20,
    marginTop: 18,
  },
});
