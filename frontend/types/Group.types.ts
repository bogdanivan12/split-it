import { UserSummary, UserSummaryApiResponse } from "./User.types";

export type CreateGroupParams = {
  name: string;
  description: string;
};

export type UpdateGroupParams = {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_ids: string[];
  bill_ids: string[];
};

export type GroupApiResponse = {
  _id: string;
  name: string;
  description?: string;
  owner_id: string;
  members: UserSummaryApiResponse[];
  bill_ids: string[];
  join_code: string;
};

export type GroupSummaryApiResponse = {
  _id: string;
  name: string;
};

export class GroupSummary {
  id!: string;
  name!: string;

  constructor(g: GroupSummaryApiResponse) {
    return {
      id: g._id,
      name: g.name,
    };
  }
}

export class Group {
  id!: string;
  name!: string;
  description!: string;
  owner!: UserSummary;
  members!: UserSummary[];
  joinCode!: string;

  constructor(res: GroupApiResponse) {
    const owner = res.members.find((m) => m._id === res.owner_id)!;
    return {
      id: res._id,
      description: res.description || "",
      members: res.members
        .filter((m) => m._id !== res.owner_id)
        .map((m) => ({
          fullName: m.full_name,
          id: m._id,
          username: m.username,
        })),
      name: res.name,
      owner: {
        fullName: owner.full_name,
        id: res.owner_id,
        username: owner.username,
      },
      joinCode: res.join_code,
    };
  }
}

export type ShortGroup = {
  id: string;
  name: string;
};
