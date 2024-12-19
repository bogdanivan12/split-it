import { useState } from "react";
import { fetcher } from "../fetcher";
import { ApiError } from "@/types/ApiError.types";
import { Bill } from "@/types/Bill.types";

const dummyBills: Bill[] = [
  {
    owner: {
      fullName: "",
      id: "",
      username: "vlandero",
    },
    id: "1",
    name: "Electricity",
    amount: 120,
    dateCreated: "2023-12-01",
    initialPayers: [],
    products: [],
  },
  {
    owner: {
      fullName: "",
      id: "",
      username: "vlandero",
    },
    id: "2",
    name: "Water",
    amount: 45,
    dateCreated: "2023-12-05",
    initialPayers: [],
    products: [],
  },
  {
    owner: {
      fullName: "",
      id: "",
      username: "baloo",
    },
    id: "4",
    name: "Internet",
    amount: 80,
    dateCreated: "2023-12-10",
    initialPayers: [],
    products: [],
  },
];

export const useBill = () => {
  const [loading, setLoading] = useState(false);

  const getAll = async (groupId: string, token: string): Promise<Bill[]> => {
    if (!token) return [];
    try {
      setLoading(true);
      return dummyBills;
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get bills");
    } finally {
      setLoading(false);
    }
  };

  const get = async (billId: string, token: string): Promise<Bill> => {
    try {
      setLoading(true);
      return dummyBills[0];
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get bill");
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {};
  const del = async () => {};

  return {
    loading,
    getAll,
    create,
    get,
    del,
  };
};
