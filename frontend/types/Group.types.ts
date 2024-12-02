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
  member_ids: string[];
  bill_ids: string[];
  join_code: string;
};

export type GroupSummaryApiResponse = {
  _id: string;
  name: string;
};

export type UserSummaryApiResponse = {
  _id: string;
  full_name: string;
  username: string;
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

export class UserSummary {
  id!: string;
  fullName!: string;
  username!: string;

  constructor(us: UserSummaryApiResponse) {
    return {
      username: us.username,
      fullName: us.full_name,
      id: us._id,
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

  constructor(res: GroupApiResponse, members: UserSummaryApiResponse[]) {
    const owner = members.find((m) => m._id === res.owner_id)!;
    return {
      id: res._id,
      description: res.description || "",
      members: members
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
