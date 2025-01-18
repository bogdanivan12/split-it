import { UserSummary } from "./User.types"

export type Paymentt = {
    amount: number,
    userFrom: UserSummary,
    userTo: UserSummary
}