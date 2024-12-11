import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, useGlobalSearchParams } from "expo-router";
import { Colors } from "@/constants/Theme";
import { Bill } from "@/types/Bill.types";
import { useAuth } from "@/context/AuthContext";
import { useBill } from "@/utils/hooks/useBill";
import { useIsFocused } from "@react-navigation/native";
import { Feather, FontAwesome } from "@expo/vector-icons";

const Bills: React.FC = () => {
  const { token, user } = useAuth();
  const { getAll } = useBill();

  const isFocused = useIsFocused();
  const { id } = useGlobalSearchParams();
  const [groupId] = useState(id as string);

  const [bills, setBills] = useState<Bill[]>([]);

  const editBill = () => {};
  const removeBill = () => {};

  const isAdmin = (ownerId: string) => {
    return true;
    return ownerId === user?.id;
  };

  useEffect(() => {
    const f = async () => {
      const bills = await getAll(groupId, token!);
      setBills(bills);
    };
    f();
  }, [user]);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>What has been paid?</Text>
      <Text style={styles.subHeader}>
        Navigate through the bills that are split in this group.
      </Text>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 200,
        }}
      >
        {bills.map((item) => {
          return (
            <Link
              key={item.id}
              asChild
              href={{
                pathname: `/(bill)`,
                params: { billId: item.id },
              }}
            >
              <TouchableOpacity style={styles.billContainer}>
                <View style={styles.billDetailsContainer}>
                  <Text style={styles.billName}>{item.name}</Text>
                  <Text style={styles.billDetails}>
                    {item.amount} - Created by: {item.owner.username}
                  </Text>
                  <Text style={styles.billDetails}>on: {item.dateCreated}</Text>
                </View>
                {isAdmin(item.owner.id) && (
                  <View style={styles.billDetailsButtons}>
                    <TouchableOpacity onPress={editBill}>
                      <FontAwesome
                        name="pencil"
                        size={22}
                        color={Colors.theme1.text1}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={removeBill}>
                      <FontAwesome
                        name="remove"
                        size={22}
                        color={Colors.theme1.text1}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </Link>
          );
        })}
        <Link
          asChild
          href={{
            pathname: `/(bill)`,
            params: {
              groupId,
            },
          }}
        >
          <TouchableOpacity style={styles.addBillContainer}>
            <Feather name="plus-circle" size={20} />
            <Text style={styles.billName}>Add bill</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </View>
  );
};

export default Bills;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.theme1.background2,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "AlegreyaMedium",
    marginBottom: 10,
    color: Colors.theme1.text,
  },
  subHeader: {
    fontSize: 14,
    fontFamily: "AlegreyaMedium",
    marginBottom: 20,
    color: Colors.theme1.text4,
  },
  billsContainer: {
    flexDirection: "column",
  },
  billDetailsContainer: {
    maxWidth: "75%",
  },
  billDetailsButtons: {
    gap: 5,
    justifyContent: "center",
  },
  billContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: Colors.theme1.button5,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    width: "95%",
    alignSelf: "center",
  },
  addBillContainer: {
    backgroundColor: Colors.theme1.button5,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    width: "50%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    alignItems: "center",
  },
  billName: {
    fontSize: 18,
    fontFamily: "AlegreyaMedium",
    fontWeight: "bold",
    color: Colors.theme1.text1,
  },
  billDetails: {
    fontSize: 14,
    fontFamily: "AlegreyaMedium",
    color: Colors.theme1.text1,
  },
  billList: {
    marginTop: 10,
  },
});
