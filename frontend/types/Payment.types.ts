import { UserSummary } from "./User.types"

export type Paymentt = {
    amount: number,
    userFrom: UserSummary,
    userTo: UserSummary & {revolut: string},
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
}