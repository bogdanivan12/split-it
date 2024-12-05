import { GroupSummary, GroupSummaryApiResponse } from "./Group.types";
import { UserSummary, UserSummaryApiResponse } from "./User.types";

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
  group: GroupSummaryApiResponse;
  sender: UserSummaryApiResponse;
  recipient: UserSummaryApiResponse;
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
  | {
      sent: RequestApiResponse[];
      received: RequestApiResponse[];
    }
  | undefined
>;

export class Request {
  id!: string;
  group!: GroupSummary;
  sender!: UserSummary;
  recipient!: UserSummary;
  date!: string;
  type!: RequestType;
  status!: string;

  constructor(res: RequestApiResponse) {
    return {
      date: res.date,
      group: new GroupSummary(res.group),
      id: res._id,
      recipient: new UserSummary(res.recipient),
      sender: new UserSummary(res.sender),
      status: res.status,
      type: res.type,
    };
  }
}

export type Requests = {
  sent: Request[];
  received: Request[];
};
