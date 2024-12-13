import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ViewStyle,
  TextStyle,
} from "react-native";
import React, { ComponentProps, ReactNode, useEffect, useState } from "react";
import { Colors } from "@/constants/Theme";
import { router, useGlobalSearchParams } from "expo-router";
import { Bill, Payer, Product } from "@/types/Bill.types";
import {
  FontAwesome6,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useGroup } from "@/utils/hooks/useGroup";
import { useAuth } from "@/context/AuthContext";
import { Group } from "@/types/Group.types";
import { CenteredLogoLoadingComponent } from "@/components/LogoLoadingComponent";
import {
  AssignedPayersModal,
  InitialPayersModal,
} from "@/components/modals/PayersModal";
import Tooltip from "react-native-walkthrough-tooltip";
import { UserSummary } from "@/types/User.types";
import { useBill } from "@/utils/hooks/useBill";

const ButtonWithTooltip = ({
  onPress,
  text,
  icon,
  tooltipText,
  viewStyle = styles.addProductButton,
  textStyle = styles.addProductText,
}: {
  onPress: () => void;
  icon?: ReactNode;
  text: string;
  tooltipText: string;
  viewStyle?: ViewStyle;
  textStyle?: TextStyle;
}) => {
  const [tooltipActive, setTooltipActive] = useState(false);
  return (
    <View style={{ position: "relative" }}>
      <TouchableOpacity onPress={onPress}>
        <View style={viewStyle}>
          {icon}
          <Text style={textStyle}>{text}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.tooltipButton}>
        <Tooltip
          onClose={() => setTooltipActive(false)}
          isVisible={tooltipActive}
          contentStyle={{ backgroundColor: Colors.theme1.button5 }}
          tooltipStyle={{ maxWidth: "60%" }}
          content={
            <View>
              <Text style={{ fontFamily: "AlegreyaMedium" }}>
                {tooltipText}
              </Text>
            </View>
          }
        >
          <TouchableOpacity onPress={() => setTooltipActive(true)}>
            <MaterialCommunityIcons
              size={20}
              name="information-variant"
              color={Colors.theme1.text}
            />
          </TouchableOpacity>
        </Tooltip>
      </View>
    </View>
  );
};

const SavePrice = ({
  save,
  cancel,
}: {
  save: () => void;
  cancel: () => void;
}) => {
  return (
    <View style={styles.saveProductPriceButtonContainer}>
      <TouchableOpacity onPress={cancel}>
        <View style={styles.saveProductPriceButton}>
          <Text style={styles.productNameText}>Cancel</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={save}>
        <View style={styles.saveProductPriceButton}>
          <Text style={styles.productNameText}>Save</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const DeleteProduct = ({
  addToRest,
  remove,
  cancel,
}: {
  addToRest: () => void;
  remove: () => void;
  cancel: () => void;
}) => {
  return (
    <View
      style={{ ...styles.saveProductPriceButtonContainer, alignSelf: "center" }}
    >
      <TouchableOpacity onPress={cancel}>
        <View style={styles.saveProductPriceButton}>
          <Text style={styles.productNameText}>Cancel</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={addToRest}>
        <View style={styles.saveProductPriceButton}>
          <Text style={styles.productNameText}>Add to rest</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={remove}>
        <View style={styles.saveProductPriceButton}>
          <Text style={styles.productNameText}>Remove from bill</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const EditableInput = ({
  canEdit,
  textInputProps,
}: {
  canEdit: boolean;
  textInputProps: ComponentProps<typeof TextInput>;
}) => {
  return (
    <>
      {canEdit ? (
        <TextInput {...textInputProps} />
      ) : (
        <Text style={textInputProps.style}>{textInputProps.value}</Text>
      )}
    </>
  );
};

export default function Layout() {
  const { billId, groupId } = useGlobalSearchParams();
  const [bill, setBill] = useState<Bill | null>(null);
  const [title, setTitle] = useState("");
  const [products, setProducts] = useState<
    (Product & { editedPrice: string; isNew: boolean; split: boolean })[]
  >([]);
  const [initialPayers, setInitialPayers] = useState<Payer[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [assignedPayersModalOpen, setAssignedPayersModalOpen] = useState(false);
  const [initialPayersModalOpen, setInitialPayersModalOpen] = useState(false);
  const [groupDetails, setGroupDetails] = useState<Group | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);
  const [restOfTheProductsPrice, setRestOfTheProductsPrice] = useState(0);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null
  );
  const [deletingFieldIndex, setDeletingFieldIndex] = useState<number | null>(
    null
  );
  const [editedTotalPrice, setEditedTotalPrice] = useState("0");
  const [editedRestOfTheProductsPrice, setEditedRestOfTheProductsPrice] =
    useState("0");

  const { get: getGroup, loading: groupLoading } = useGroup();
  const { get: getBill, loading: billLoading } = useBill();
  const { token, user } = useAuth();
  const [isBillOwner, setIsBillOwner] = useState(true);

  useEffect(() => {
    if (!groupId) {
      router.back();
    }
    const f = async () => {
      try {
        const gr = await getGroup(groupId as string, token!);
        if (billId) {
          const b = await getBill(billId as string, token!);
          setBill(b);
          mapFromBill(b, gr);
        } else {
          setInitialPayers(
            gr.members.concat(gr.owner).map((member) => {
              return {
                assigned: member.id === user?.id,
                user: member,
              };
            })
          );
        }
        setGroupDetails(gr);
      } catch (err) {
        router.back();
      }
    };
    f();
  }, []);

  const mapToBill = (): Bill => {
    // if I need to call this, then the owner is the current user
    // if id is empty, then call the new api
    return {
      amount: totalPrice,
      dateCreated: bill?.dateCreated || "",
      id: bill?.id || "",
      initialPayers: initialPayers.filter((p) => p.assigned).map((p) => p.user),
      name: title,
      owner: {
        id: user!.id,
        fullName: user!.fullName,
        username: user!.username,
      },
      products,
    };
  };

  const mapFromBill = (bill: Bill, group: Group) => {
    setIsBillOwner(bill.owner.id === user!.id);
    setTotalPrice(bill.amount);
    const initialPayersIds = bill.initialPayers.map((p) => p.id);
    setInitialPayers(
      group.members.concat(group.owner).map((member) => {
        return {
          assigned: initialPayersIds.includes(member.id),
          user: member,
        };
      })
    );
    setProducts(
      bill.products.map((p) => ({
        ...p,
        isNew: false,
        split: false,
        editedPrice: p.totalPrice.toString(),
      }))
    );
    setRestOfTheProductsPrice(
      bill.amount -
        bill.products
          .map((p) => p.totalPrice)
          .reduce((acc, crt) => acc + crt, 0)
    );
  };

  const extractProduct = () => {
    if (!groupDetails) return;
    if (products.find((p) => p.isNew)) return;
    const defaultAssignedPayers: Payer[] = groupDetails.members
      .concat(groupDetails.owner)
      .map((m) => ({
        user: m,
        assigned: true,
      }));
    setProducts((prev) => [
      ...prev,
      {
        assignedPayers: defaultAssignedPayers,
        name: "",
        quantity: 0,
        totalPrice: 0,
        editedPrice: "0",
        isEditing: false,
        isNew: true,
        split: true,
      },
    ]);
  };

  const addNewProduct = () => {
    if (!groupDetails) return;
    if (products.find((p) => p.isNew)) return;
    const defaultAssignedPayers: Payer[] = groupDetails.members
      .concat(groupDetails.owner)
      .map((m) => ({
        user: m,
        assigned: true,
      }));
    setProducts((prev) => [
      ...prev,
      {
        assignedPayers: defaultAssignedPayers,
        name: "",
        quantity: 0,
        totalPrice: 0,
        editedPrice: "0",
        isEditing: false,
        isNew: true,
        split: false,
      },
    ]);
  };

  const resetProductsPrice = () => {
    setProducts((prev) =>
      prev.map((p) => ({ ...p, editedPrice: p.totalPrice.toString() }))
    );
    setEditedRestOfTheProductsPrice(restOfTheProductsPrice.toString());
    setEditedTotalPrice(totalPrice.toString());
  };

  const deleteProduct = (index: number) => {
    setTotalPrice((prev) => {
      return prev - products[index].totalPrice;
    });
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const addToRest = (index: number) => {
    setRestOfTheProductsPrice((prev) => {
      return prev + products[index].totalPrice;
    });
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const isLoading = () => {
    return groupLoading || billLoading;
  };

  const getAllProductsPriceSum = () => {
    return products.map((p) => p.totalPrice).reduce((acc, crt) => acc + crt, 0);
  };

  useEffect(() => {
    setEditedRestOfTheProductsPrice(restOfTheProductsPrice.toString());
  }, [restOfTheProductsPrice]);

  useEffect(() => {
    setEditedTotalPrice(totalPrice.toString());
  }, [totalPrice]);

  if (isLoading()) return <CenteredLogoLoadingComponent />;
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <EditableInput
          canEdit={isBillOwner}
          textInputProps={{
            style: styles.titleInput,
            placeholder: "Enter a bill title...",
            placeholderTextColor: Colors.theme1.inputPlaceholder,
            underlineColorAndroid: "transparent",
            value: title,
            onChangeText: (text) => setTitle(text),
          }}
        />
        <ScrollView contentContainerStyle={styles.scrollProducts}>
          <View style={styles.products} onStartShouldSetResponder={() => true}>
            {products.map((p, index) => (
              <View style={{ gap: 7 }} key={index}>
                <View style={styles.product}>
                  <EditableInput
                    canEdit={isBillOwner}
                    textInputProps={{
                      style: styles.productInput,
                      placeholder: "Name...",
                      placeholderTextColor: Colors.theme1.inputPlaceholder,
                      underlineColorAndroid: "transparent",
                      value: p.name,
                      onChangeText: (text) => {
                        const updatedProducts = products.map((product, i) =>
                          i === index ? { ...product, name: text } : product
                        );
                        setProducts(updatedProducts);
                      },
                    }}
                  />
                  <View style={styles.productData}>
                    <View style={styles.productInputContainer}>
                      <EditableInput
                        canEdit={isBillOwner}
                        textInputProps={{
                          style: styles.productInput,
                          placeholder: "...",
                          keyboardType: "numeric",
                          placeholderTextColor: Colors.theme1.inputPlaceholder,
                          underlineColorAndroid: "transparent",
                          value: p.quantity.toString(),
                          onChangeText: (text) => {
                            const updatedProducts = products.map((product, i) =>
                              i === index
                                ? { ...product, quantity: parseInt(text) }
                                : product
                            );
                            setProducts(updatedProducts);
                          },
                        }}
                      />
                      <Text style={styles.productInputText}>Quantity</Text>
                    </View>
                    <View
                      style={{
                        ...styles.productInputContainer,
                        position: "relative",
                      }}
                    >
                      <EditableInput
                        canEdit={isBillOwner}
                        textInputProps={{
                          style: styles.productInput,
                          keyboardType: "numeric",
                          placeholderTextColor: Colors.theme1.inputPlaceholder,
                          underlineColorAndroid: "transparent",
                          value: p.editedPrice,
                          onFocus: () => {
                            resetProductsPrice();
                            setDeletingFieldIndex(null);
                            setEditingFieldIndex(index);
                          },
                          onChangeText: (text) => {
                            setProducts((prev) =>
                              prev.map((p, i) =>
                                i === index
                                  ? {
                                      ...p,
                                      editedPrice: text.replace(",", "."),
                                    }
                                  : p
                              )
                            );
                          },
                        }}
                      />
                      <Text style={styles.productInputText}>Total price</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setAssignedPayersModalOpen(true);
                        setSelectedProductIndex(index);
                      }}
                    >
                      <MaterialIcons
                        name="payments"
                        size={20}
                        color={Colors.theme1.text1}
                      />
                    </TouchableOpacity>
                    {isBillOwner && (
                      <TouchableOpacity
                        onPress={() => {
                          if (p.isNew) {
                            deleteProduct(index);
                            return;
                          }
                          setDeletingFieldIndex(index);
                          setEditingFieldIndex(null);
                        }}
                      >
                        <Fontisto
                          name="shopping-basket-remove"
                          size={20}
                          color={Colors.theme1.text1}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {index === editingFieldIndex && (
                  <SavePrice
                    cancel={() => {
                      setEditingFieldIndex(null);
                      setProducts((prev) =>
                        prev.map((p, i) =>
                          i === index
                            ? { ...p, editedPrice: p.totalPrice.toString() }
                            : p
                        )
                      );
                    }}
                    save={() => {
                      const updatedProducts = products.map((product, i) =>
                        i === index
                          ? {
                              ...product,
                              totalPrice: parseFloat(p.editedPrice),
                            }
                          : product
                      );
                      const diff =
                        updatedProducts[index].totalPrice -
                        products[index].totalPrice;
                      if (p.split) {
                        if (restOfTheProductsPrice - diff < 0) return;
                        setRestOfTheProductsPrice((prev) => prev - diff);
                      } else {
                        setTotalPrice((prev) => {
                          return prev + diff;
                        });
                      }
                      setProducts(
                        updatedProducts.map((p, i) =>
                          i === index
                            ? {
                                ...p,
                                isNew: false,
                                split: false,
                                editedPrice: p.totalPrice.toString(),
                              }
                            : p
                        )
                      );
                      setEditingFieldIndex(null);
                    }}
                  />
                )}
                {index === deletingFieldIndex && (
                  <DeleteProduct
                    addToRest={() => {
                      addToRest(index);
                      setDeletingFieldIndex(null);
                    }}
                    cancel={() => {
                      setDeletingFieldIndex(null);
                    }}
                    remove={() => {
                      deleteProduct(index);
                      setDeletingFieldIndex(null);
                    }}
                  />
                )}
              </View>
            ))}
            {products.length > 0 && (
              <>
                <View style={styles.product}>
                  <Text style={styles.productNameText}>
                    Rest of the products
                  </Text>
                  <View style={styles.productData}>
                    <View style={styles.productInputContainer}>
                      <EditableInput
                        canEdit={isBillOwner}
                        textInputProps={{
                          style: styles.productInput,
                          placeholder: "...",
                          keyboardType: "numeric",
                          placeholderTextColor: Colors.theme1.inputPlaceholder,
                          underlineColorAndroid: "transparent",
                          value: editedRestOfTheProductsPrice,
                          onChangeText: (text) => {
                            setEditedRestOfTheProductsPrice(
                              text.replace(",", ".")
                            );
                          },
                          onFocus: () => {
                            resetProductsPrice();
                            setDeletingFieldIndex(null);
                            setEditingFieldIndex(-2);
                          },
                        }}
                      />
                      <Text style={styles.productInputText}>Total price</Text>
                    </View>
                  </View>
                </View>
                {editingFieldIndex === -2 && (
                  <SavePrice
                    save={() => {
                      const newPrice = parseFloat(editedRestOfTheProductsPrice);
                      const priceDiff = newPrice - restOfTheProductsPrice;
                      setTotalPrice((prev) => {
                        return prev + priceDiff;
                      });
                      setRestOfTheProductsPrice(
                        parseFloat(editedRestOfTheProductsPrice)
                      );
                      setEditingFieldIndex(null);
                    }}
                    cancel={() => {
                      setEditedRestOfTheProductsPrice(totalPrice.toString());
                      setEditingFieldIndex(null);
                    }}
                  />
                )}
              </>
            )}
            <View
              style={{
                borderBottomColor: Colors.theme1.button,
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
            {totalPrice === 0 && isBillOwner && (
              <View
                style={{
                  alignSelf:
                    totalPrice <= 0 && isBillOwner ? "center" : "flex-end",
                }}
              >
                <Text
                  style={{
                    ...styles.enterPriceText,
                    fontSize: totalPrice <= 0 && isBillOwner ? 20 : 14,
                  }}
                >
                  Enter the total price of the bill below
                </Text>
              </View>
            )}
            <View
              style={{
                ...styles.totalInputWrapper,
                alignSelf:
                  totalPrice <= 0 && isBillOwner ? "center" : "flex-end",
              }}
            >
              <View style={styles.totalInput}>
                <Text
                  style={{
                    ...styles.totalText,
                    fontSize: totalPrice <= 0 && isBillOwner ? 20 : 14,
                  }}
                >
                  Total:
                </Text>
                <EditableInput
                  canEdit={isBillOwner}
                  textInputProps={{
                    style: {
                      ...styles.productInput,
                      backgroundColor: Colors.theme1.background2,
                      color: Colors.theme1.text2,
                      fontSize: totalPrice <= 0 && isBillOwner ? 20 : 14,
                    },
                    placeholder: "...",
                    keyboardType: "numeric",
                    placeholderTextColor: Colors.theme1.inputPlaceholder,
                    underlineColorAndroid: "transparent",
                    value: editedTotalPrice,
                    onChangeText: (text) => {
                      setEditedTotalPrice(text.replace(",", "."));
                    },
                    onFocus: () => {
                      resetProductsPrice();
                      setDeletingFieldIndex(null);
                      setEditingFieldIndex(-1);
                    },
                  }}
                />
              </View>
              {/* button - or upload a picture of the receipt */}
              {editingFieldIndex === -1 && (
                <SavePrice
                  save={() => {
                    const newPrice = parseFloat(editedTotalPrice);
                    const productsPrice = getAllProductsPriceSum();
                    if (newPrice < productsPrice) {
                      setEditedTotalPrice(totalPrice.toString());
                      return;
                    }
                    const priceDiff = newPrice - totalPrice;
                    const newRestOfTheProductsPrice =
                      restOfTheProductsPrice + priceDiff;
                    if (newRestOfTheProductsPrice < 0) return;
                    setTotalPrice(newPrice);
                    setRestOfTheProductsPrice(newRestOfTheProductsPrice);
                    setEditingFieldIndex(null);
                  }}
                  cancel={() => {
                    setEditedTotalPrice(totalPrice.toString());
                    setEditingFieldIndex(null);
                  }}
                />
              )}
            </View>
          </View>
          {totalPrice > 0 && isBillOwner && (
            <View style={styles.buttonsContainer}>
              <ButtonWithTooltip
                onPress={extractProduct}
                icon={
                  <Ionicons
                    name="bag-add-outline"
                    size={20}
                    color={Colors.theme1.text2}
                  />
                }
                text="Split product"
                tooltipText="Extracts a product that is already part of the total price (not added to the total)"
              />
              <ButtonWithTooltip
                onPress={addNewProduct}
                icon={
                  <Ionicons
                    name="bag-add-outline"
                    size={20}
                    color={Colors.theme1.text2}
                  />
                }
                text="Add new product"
                tooltipText="Adds a new product that is not part of the total price (added to the total)"
              />
              <ButtonWithTooltip
                onPress={() => setInitialPayersModalOpen(true)}
                icon={
                  <FontAwesome6
                    name="people-roof"
                    size={20}
                    color={Colors.theme1.text2}
                  />
                }
                text="Who paid?"
                tooltipText="Set the group members that initially paid/will pay for this bill"
              />
            </View>
          )}
        </ScrollView>
        <AssignedPayersModal
          onClose={() => {
            setAssignedPayersModalOpen(false);
            setSelectedProductIndex(null);
          }}
          canEdit={isBillOwner}
          open={assignedPayersModalOpen}
          payers={
            selectedProductIndex !== null
              ? products[selectedProductIndex].assignedPayers
              : []
          }
          save={(payers) => {
            const newProducts = products.map((p, i) =>
              i === selectedProductIndex ? { ...p, assignedPayers: payers } : p
            );
            setProducts(newProducts);
            setSelectedProductIndex(null);
          }}
          productName={
            selectedProductIndex !== null
              ? products[selectedProductIndex].name
              : ""
          }
        />
        <InitialPayersModal
          onClose={() => setInitialPayersModalOpen(false)}
          canEdit={isBillOwner}
          open={initialPayersModalOpen}
          payers={initialPayers}
          save={(payers) => setInitialPayers(payers)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

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
    color: Colors.theme1.text1,
    backgroundColor: Colors.theme1.button,
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
    backgroundColor: Colors.theme1.button,
    borderRadius: 20,
  },
  productName: {},
  productNameText: {
    fontFamily: "AlegreyaMedium",
  },
  enterPriceText: {
    fontFamily: "AlegreyaMedium",
    fontSize: 14,
    color: Colors.theme1.text,
  },
  saveProductPriceButton: {
    padding: 15,
    backgroundColor: Colors.theme1.button2,
    borderRadius: 10,
  },
  saveProductPriceButtonContainer: {
    alignSelf: "flex-end",
    padding: 2,
    flexDirection: "row",
    alignItems: "center",
    // width: 90,
    gap: 2,
  },
  addProductText: {
    fontFamily: "AlegreyaMedium",
    color: Colors.theme1.text2,
  },
  productData: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
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
  totalText: {
    fontFamily: "AlegreyaMedium",
    fontSize: 14,
    color: Colors.theme1.text2,
  },
  products: {
    gap: 15,
  },
  scrollProducts: {
    gap: 15,
    paddingBottom: 100,
  },
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
  totalInput: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  totalInputWrapper: {
    alignSelf: "flex-end",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
  },
  buttonsContainer: {
    alignItems: "center",
    flexDirection: "column",
    gap: 10,
  },
  tooltipButton: {
    position: "absolute",
    right: -20,
    bottom: 0,
    top: 0,
    justifyContent: "center",
  },
});
