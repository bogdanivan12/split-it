import { UserSummary } from "./User.types";

export type Bill = {
  owner: UserSummary;
  id: string;
  name: string;
  amount: string;
  dateCreated: string;
  initialPayers: UserSummary[];
};

export type Product = {
  name: string;
  quantity: number;
  totalPrice: number;
  assignedPayers: Payer[];
};
export type Payer = { user: UserSummary; assigned: boolean };
