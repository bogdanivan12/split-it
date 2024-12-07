import { UserSummary } from "./User.types";

export type Bill = {
    owner: UserSummary;
    id: string;
    name: string;
    amount: string;
    dateCreated: string;
}