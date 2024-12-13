import { UserSummary } from "./User.types";

export type Product = {
  name: string;
  quantity: number;
  totalPrice: number;
  assignedPayers: Payer[];
};
export type Payer = { user: UserSummary; assigned: boolean };

export type Bill = {
  owner: UserSummary;
  id: string;
  name: string;
  amount: number;
  dateCreated: string;
  initialPayers: UserSummary[];
  products: Product[];
};
