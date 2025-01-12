import { useState } from "react";
import { fetcher } from "../fetcher";
import { ApiError } from "@/types/ApiError.types";
import { Bill, BillApiResponse, Payer } from "@/types/Bill.types";

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

function distributeAmounts(payers: Payer[], totalAmount: number) {
  const assignedPayers = payers.filter(
    (payer) => payer.assigned && payer.amount !== undefined && payer.amount > 0
  );
  const assignedPayersWithNoAmount = payers.filter(
    (payer) =>
      payer.assigned && (payer.amount === undefined || payer.amount === 0)
  );

  const assignedTotal = assignedPayers.reduce(
    (sum, payer) => sum + (payer.amount || 0),
    0
  );
  const remainingAmount = totalAmount - assignedTotal;

  if (remainingAmount < 0) {
    throw new Error("Assigned amounts exceed the total amount");
  }

  const equalShare = remainingAmount / assignedPayersWithNoAmount.length;

  return payers.map((payer) => ({
    user: payer.user,
    amount:
      payer.assigned && payer.amount !== undefined && payer.amount > 0
        ? payer.amount || 0
        : equalShare,
  }));
}

export const useBill = () => {
  const [loading, setLoading] = useState(false);

  const getAll = async (groupId: string, token: string): Promise<Bill[]> => {
    if (!token) return [];
    try {
      setLoading(true);
      const bills = await fetcher<BillApiResponse[]>({
        endpoint: "/api/v1/bills/",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(JSON.stringify(bills));
      return bills.map(b => new Bill(b));
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
      const bill = await fetcher<BillApiResponse>({
        endpoint: "/api/v1/bills/",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return new Bill(bill);
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get bill");
    } finally {
      setLoading(false);
    }
  };

  const create = async (bill: Bill, groupId: string, token: string) => {
    try {
      setLoading(true);

      const req = {
        group_id: groupId,
        name: bill.name,
        description: "",
        initial_payers: distributeAmounts(bill.initialPayers, bill.amount),
        payer_ids: [],
        bill_type: "SPLIT_BY_PRODUCTS",
        products: bill.products.map((p) => ({
          name: p.name,
          assigned_payers: distributeAmounts(p.assignedPayers, p.totalPrice),
          quantity: p.quantity,
          total_price: p.totalPrice,
        })),
      };
      console.log(JSON.stringify(req));
      const x = await fetcher({
        endpoint: "/api/v1/bills/",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: req,
      });
      console.log(JSON.stringify(x));
    } catch (error) {
      throw Error("Could not create bill");
    } finally {
      setLoading(false);
    }
  };
  const del = async () => {};
  const update = async (bill: Bill, groupId: string, token: string) => {

  };

  return {
    loading,
    getAll,
    create,
    get,
    del,
    update
  };
};
