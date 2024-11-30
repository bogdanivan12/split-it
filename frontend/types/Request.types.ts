import { FullUsersApiResponse, UserInGroup } from "./Group.types";

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
  sender: FullUsersApiResponse;
  recipient: FullUsersApiResponse;
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
  }
>;

export class Request {
  id!: string;
  groupId!: string;
  sender!: UserInGroup;
  recipient!: UserInGroup;
  date!: string;
  type!: RequestType;
  status!: string;

  constructor(res: RequestApiResponse) {
    return {
      date: res.date,
      groupId: res.group_id,
      id: res._id,
      recipient: {
        fullName: res.recipient.full_name,
        id: res.recipient._id,
        username: res.recipient.username,
      },
      sender: {
        fullName: res.sender.full_name,
        id: res.sender._id,
        username: res.sender.username,
      },
      status: res.status,
      type: res.type,
    };
  }
}

export type Requests = {
  sent: Request[];
  received: Request[];
};
