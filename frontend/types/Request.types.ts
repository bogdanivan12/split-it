import { UserSummaryApiResponse, UserSummary } from "./Group.types";

export type InviteParams = {
  usernames: string[];
  groupId: string;
};

export type CheckIfUserExistsParams = {
  groupId: string;
  username: string;
};

export type MemberInGroup = {
  in_group: boolean;
  has_request: boolean;
};

export type RequestApiResponse = {
  _id: string;
  group_id: string;
  sender_id: string;
  recipient_id: string;
  date: string;
  type: RequestType;
  status: RequestStatus;
};

export type RequestType =
  | "JOIN_GROUP"
  | "INVITE_TO_GROUP"
  | "JOIN_MINIGAME"
  | "INVITE_TO_MINIGAME";

export type RequestStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export type RequestsApiResponse = Record<
  RequestType,
  {
    sent: RequestApiResponse[];
    received: RequestApiResponse[];
  } | undefined
>;

export class Request {
  id!: string;
  groupId!: string;
  sender!: UserSummary;
  recipient!: UserSummary;
  date!: string;
  type!: RequestType;
  status!: string;

  constructor(res: RequestApiResponse, users: UserSummary[]) {
    const usersRecord: Record<string, UserSummary> = {};
    users.forEach((u) => (usersRecord[u.id] = u));
    return {
      date: res.date,
      groupId: res.group_id,
      id: res._id,
      recipient: usersRecord[res.recipient_id],
      sender: usersRecord[res.sender_id],
      status: res.status,
      type: res.type,
    };
  }
}

export type Requests = {
  sent: Request[];
  received: Request[];
};
