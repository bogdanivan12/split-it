import { GroupSummaryApiResponse } from "./Group.types";
import { UserSummary, UserSummaryApiResponse } from "./User.types";

export class Product {
  name!: string;
  quantity!: number;
  totalPrice!: number;
  assignedPayers!: Payer[];
  constructor(p: ProductApiResponse){
    return {
      assignedPayers: p.assigned_payers_info.map(a => new Payer(a)),
      name: p.name,
      quantity: p.quantity,
      totalPrice: p.total_price
    }
  }
};

export type ProductApiResponse = {
  name: string;
  total_price: number;
  quantity: number;
  assigned_payers_info: PayerApiResponse[]
};
export class Payer {
  user!: UserSummary;
  assigned!: boolean;
  amount?: number;
  constructor(p: PayerApiResponse) {
    return {
      user: new UserSummary(p.user),
      assigned: true,
      amount: p.amount
    }
  }
}
export type PayerApiResponse = {
  user: UserSummaryApiResponse;
  amount: number
};
export class Bill {
  owner!: UserSummary;
  id!: string;
  name!: string;
  amount!: number;
  dateCreated?: string;
  initialPayers!: Payer[];
  products!: Product[];

  constructor(b: BillApiResponse) {
    return {
      owner: new UserSummary(b.owner),
      amount: b.total,
      id: b.id,
      initialPayers: b.initial_payers_info.map(p => new Payer(p)),
      name: b.name,
      products: b.products_info.map(p => new Product(p)),
      dateCreated: b.date
    };
  }
}

export type BillApiResponse = {
  id: string;
  name: string;
  description: string;
  date: string
  owner: UserSummaryApiResponse;
  group: GroupSummaryApiResponse;
  initial_payers_info: PayerApiResponse[];
  payers_info: PayerApiResponse[];
  products_info: ProductApiResponse[];
  total: number;
};
