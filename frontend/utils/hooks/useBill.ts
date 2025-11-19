import { useState } from "react";
import { fetcher } from "../fetcher";
import { ApiError } from "@/types/ApiError.types";
import { Bill, BillApiResponse, Payer } from "@/types/Bill.types";
import { useGroup } from "./useGroup";
import {
  PaymentApiResponse,
  PaymentStatus,
  Paymentt,
} from "@/types/Payment.types";

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
    user_id: payer.user.id,
    amount: !payer.assigned ? 0 : payer.amount || equalShare,
  }));
}

export const useBill = () => {
  const OTHER_PRODUCTS_NAME = "_____otherproducts";
  const [loading, setLoading] = useState(false);

  const { get: getGroup } = useGroup();

  const getAll = async (groupId: string, token: string): Promise<Bill[]> => {
    if (!token) return [];
    try {
      setLoading(true);
      const group = await getGroup(groupId, token);
      const bills = (
        await fetcher<BillApiResponse[]>({
          endpoint: "/api/v1/bills/",
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ).filter((b) => b.group._id === groupId);
      const members = group.members.concat(group.owner);
      return bills.map(
        (b) =>
          new Bill(
            b,
            members.map((m) => ({
              _id: m.id,
              full_name: m.fullName,
              username: m.username,
            }))
          )
      );
    } catch (error) {
      const err = error as ApiError;
      console.log(err.message);
      throw Error("Could not get bills");
    } finally {
      setLoading(false);
    }
  };

  const get = async (
    billId: string,
    groupId: string,
    token: string
  ): Promise<Bill> => {
    try {
      setLoading(true);
      const group = await getGroup(groupId, token);
      const bill = await fetcher<BillApiResponse>({
        endpoint: `/api/v1/bills/${billId}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const b = new Bill(
        bill,
        [...group.members, group.owner].map((m) => ({
          _id: m.id,
          full_name: m.fullName,
          username: m.username,
        }))
      );
      return b;
    } catch (error) {
      const err = error as ApiError;
      console.log(err.message);
      throw Error("Could not get bill");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    paymentId: string,
    status: PaymentStatus,
    token: string
  ) => {
    await fetcher<BillApiResponse>({
      endpoint: `/api/v1/payments/${paymentId}/status?payment_status=${status}`,
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const sendPaymentNotification = async (paymentId: string, token: string) => {
    try {
      setLoading(true);
      await updateStatus(paymentId, "IN_PROGRESS", token);
    } catch (error) {
      const err = error as ApiError;
      console.log(err.body);
      throw Error("Could not send payment notification");
    } finally {
      setLoading(false);
    }
  };

  const acceptPayment = async (paymentId: string, token: string) => {
    try {
      setLoading(true);
      await updateStatus(paymentId, "COMPLETED", token);
    } catch (error) {
      const err = error as ApiError;
      console.log(err.message);
      throw Error("Could not send payment notification");
    } finally {
      setLoading(false);
    }
  };

  const rejectPayment = async (paymentId: string, token: string) => {
    try {
      setLoading(true);
      await updateStatus(paymentId, "NOT_STARTED", token);
    } catch (error) {
      const err = error as ApiError;
      console.log(err.message);
      throw Error("Could not send payment notification");
    } finally {
      setLoading(false);
    }
  };

  const getPayments = async (groupId: string, token: string) => {
    try {
      setLoading(true);
      const payments = await fetcher<PaymentApiResponse[]>({
        endpoint: `/api/v1/groups/${groupId}/payments`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const p = payments.map((payment) => new Paymentt(payment));
      return p;
    } catch (error) {
      const err = error as ApiError;
      console.log(err.body);
      console.log(err.message);
      throw Error("Could not get payments");
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
        initial_payers: distributeAmounts(
          bill.initialPayers,
          bill.amount
        ).filter((p) => p.amount > 0),
        payer_ids: [],
        bill_type: "SPLIT_BY_PRODUCTS",
        products: bill.products.map((p) => ({
          name: p.name,
          assigned_payers: distributeAmounts(
            p.assignedPayers,
            p.totalPrice
          ).filter((p) => p.amount > 0),
          quantity: 1,
          total_price: p.totalPrice,
        })),
        amount: bill.amount,
      };
      const x = await fetcher({
        endpoint: "/api/v1/bills/",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: req,
      });
    } catch (error: any) {
      console.log(JSON.stringify(error.body));
      throw Error("Could not create bill");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getAll,
    create,
    get,
    getPayments,
    acceptPayment,
    rejectPayment,
    sendPaymentNotification,
    OTHER_PRODUCTS_NAME,
  };
};
