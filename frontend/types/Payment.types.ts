import { UserSummary, UserSummaryApiResponse } from "./User.types";

export type PaymentStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export class Paymentt {
  id!: string;
  amount!: number;
  userFrom!: UserSummary;
  userTo!: UserSummary & { revolut: string };
  status!: PaymentStatus;
  constructor(p: PaymentApiResponse) {
    return {
      id: p._id,
      amount: p.amount,
      status: p.status,
      userFrom: new UserSummary(p.sender),
      userTo: {
        ...new UserSummary(p.recipient),
        revolut: p.recipient.revolut_id,
      },
    };
  }
}

export type PaymentApiResponse = {
  _id: string;
  bill_id: string;
  sender: UserSummaryApiResponse & { revolut_id: string };
  recipient: UserSummaryApiResponse & { revolut_id: string };
  status: PaymentStatus;
  amount: number;
};
