import { View, TextInput, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/Theme";
import { useGlobalSearchParams } from "expo-router";

// TODO: ce se intampla daca un user iese din grup in timp ce creezi un bill?

// by default, all products are under the rest of the products (RP) ca sa nu trebuiasca sa manevrezi fiecare produs daca nu este necesar
// buton de set initial payers, unde by default e selectat doar creatorul
// buton de add product
// button de add products from receipt
// Product: name, price per 1, quantity, payers (asta se deschide intr un modal unde by default sunt selectati tot userii din group)
// lista de Product[] (scroll prin aceasta lista)
// RestProducts (RP) (the rest of the products): price
// total: number
// bagi total -> se creeaza "produsul" RP, unde valoarea e pretul total
// exista doua butoane, add new product to bill (pune pretul la total) si split product from RP (taie din pretul RP).
// cand dai remove product, dai fie remove din bill (se ia din total), fie add in RP (se adauga in RP). se poate face fie dintr-un alert, fie 2 butoane separate
// cand schimbi totalul, se scade/adauga diferenta la RP
// apar erori daca balantele sunt pe minus

export default function Layout() {
  const { billId } = useGlobalSearchParams();
  const [title, setTitle] = useState("");
  if (billId) return null;
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder="Enter a bill title..."
        placeholderTextColor={Colors.theme1.inputPlaceholder}
        underlineColorAndroid="transparent"
        value={title}
        onChangeText={(text) => setTitle(text)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.theme1.background2,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "AlegreyaMedium",
    marginBottom: 10,
    color: Colors.theme1.text,
    backgroundColor: Colors.theme1.background2,
    borderWidth: 0,
    padding: 5,
  },
});
