import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { Link } from "expo-router";
import { Colors } from "@/constants/Theme";
import { Bill } from "@/types/Bill.types";
import { generalStyles } from "@/constants/SharedStyles";

const billsData: Bill[] = [
  { id: "1", name: "Electricity", amount: "$120", dateCreated: "2023-12-01" },
  { id: "2", name: "Water", amount: "$45", dateCreated: "2023-12-05" },
  { id: "4", name: "Internet", amount: "$80", dateCreated: "2023-12-10" },
];

const Bills: React.FC = () => {
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
        {billsData.map((item) => {
          return (
            <Link
              key={item.id}
              asChild
              href={{
                pathname: `/(bills)`,
                params: { id: item.id },
              }}
            >
              <TouchableOpacity style={styles.billContainer}>
                <Text style={styles.billName}>{item.name}</Text>
                <Text style={styles.billDetails}>
                  {item.amount} - Created on: {item.dateCreated}
                </Text>
              </TouchableOpacity>
            </Link>
          );
        })}
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
  billContainer: {
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
