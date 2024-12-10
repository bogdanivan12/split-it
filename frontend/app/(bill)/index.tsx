import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/Theme";
import { router, useGlobalSearchParams } from "expo-router";
import { Payer, Product } from "@/types/Bill.types";
import { UserSummary } from "@/types/User.types";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useGroup } from "@/utils/hooks/useGroup";
import { useAuth } from "@/context/AuthContext";
import { Group } from "@/types/Group.types";
import CenteredModal from "@/components/modals/CenteredModal";
import { CenteredLogoLoadingComponent } from "@/components/LogoLoadingComponent";
import { generalStyles } from "@/constants/SharedStyles";

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

const AssignedPayersModal = ({
  open,
  onClose,
  payers,
}: {
  open: boolean;
  onClose: () => void;
  payers: Payer[];
}) => {
  return (
    <CenteredModal onClose={onClose} visible={open}>
      <View></View>
    </CenteredModal>
  );
};

const InitialPayersModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <CenteredModal onClose={onClose} visible={open}>
      <View></View>
    </CenteredModal>
  );
};

export default function Layout() {
  const { billId, groupId } = useGlobalSearchParams();
  const [title, setTitle] = useState("");
  const [products, setProducts] = useState<Product[]>([
    {
      assignedPayers: [],
      name: "Something",
      quantity: 3,
      totalPrice: 30,
    },
  ]);
  const [initialPayers, setInitialPayers] = useState<UserSummary[]>([]);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [assignedPayersModalOpen, setAssignedPayersModalOpen] = useState(false);
  const [initialPayersModalOpen, setInitialPayersModalOpen] = useState(false);
  const [groupDetails, setGroupDetails] = useState<Group | null>(null);

  const { get: getGroup, loading: groupLoading } = useGroup();
  const { token } = useAuth();

  const addProduct = () => {};

  const isLoading = () => {
    return groupLoading;
  };

  useEffect(() => {
    if (!groupId) {
      return;
    }
    const f = async () => {
      try {
        const gr = await getGroup(groupId as string, token!);
        setGroupDetails(gr);
      } catch (err) {
        router.back();
      }
    };
    f();
  }, []);

  if (billId) return null;
  if (isLoading()) return <CenteredLogoLoadingComponent />;
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
      <View>
        {products.map((p, index) => (
          <View style={styles.product} key={`${p.name}`}>
            <TextInput
              style={styles.productInput}
              onChangeText={(text) => {
                const updatedProducts = products.map((product, i) =>
                  i === index ? { ...product, name: text } : product
                );
                setProducts(updatedProducts);
              }}
              value={p.name}
              placeholder="Name..."
              placeholderTextColor={Colors.theme1.inputPlaceholder}
            />
            <Text style={styles.productNameText}>{p.name}</Text>
            <View style={styles.productData}>
              <View style={styles.productInputContainer}>
                <TextInput
                  style={styles.productInput}
                  value={p.quantity.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const updatedProducts = products.map((product, i) =>
                      i === index
                        ? { ...product, quantity: parseInt(text) }
                        : product
                    );
                    setProducts(updatedProducts);
                  }}
                  placeholder="..."
                  placeholderTextColor={Colors.theme1.inputPlaceholder}
                />
                <Text style={styles.productInputText}>Quantity</Text>
              </View>
              <View style={styles.productInputContainer}>
                <TextInput
                  style={styles.productInput}
                  value={p.totalPrice.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const updatedProducts = products.map((product, i) =>
                      i === index
                        ? { ...product, totalPrice: parseInt(text) }
                        : product
                    );
                    setProducts(updatedProducts);
                  }}
                  placeholder="..."
                  placeholderTextColor={Colors.theme1.inputPlaceholder}
                />
                <Text style={styles.productInputText}>Total price</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAssignedPayersModalOpen(true)}
              >
                <Entypo name="info" size={20} color={Colors.theme1.text1} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      <AssignedPayersModal
        onClose={() => setAssignedPayersModalOpen(false)}
        open={assignedPayersModalOpen}
      />
      <InitialPayersModal
        onClose={() => setInitialPayersModalOpen(false)}
        open={initialPayersModalOpen}
      />
      <View style={styles.addButtonsContainer}>
        <TouchableOpacity>
          <View style={styles.addProductButton}>
            <Ionicons
              name="bag-add-outline"
              size={20}
              color={Colors.theme1.text2}
            />
            <Text style={styles.addProductText}>Add product</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <View style={styles.addProductButton}>
            <Ionicons
              name="bag-add-outline"
              size={20}
              color={Colors.theme1.text2}
            />
            <Text style={styles.addProductText}>
              Split product from the existing
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const modalStyles = StyleSheet.create({});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.theme1.background2,
    gap: 20,
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
  productInput: {
    fontWeight: "bold",
    fontFamily: "AlegreyaMedium",
    color: Colors.theme1.text,
    backgroundColor: Colors.theme1.button5,
    borderWidth: 0,
    padding: 5,
  },
  product: {
    alignSelf: "center",
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.theme1.button5,
    borderRadius: 20,
  },
  productName: {},
  productNameText: {
    fontFamily: "AlegreyaMedium",
  },
  addProductText: {
    fontFamily: "AlegreyaMedium",
  },
  productData: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  productInputContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  productInputText: {
    fontFamily: "AlegreyaMedium",
    fontSize: 10,
  },
  products: {},
  addProductButton: {
    backgroundColor: Colors.theme1.button3,
    alignSelf: "center",
    flexDirection: "row",
    gap: 10,
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});
