// API response types

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
  members: FullUsersApiResponse[];
  bill_ids: string[];
  join_code: string;
};

export type FullUsersApiResponse = {
  _id: string;
  full_name: string;
  username: string;
};

// frontend types

export type UserInGroup = {
  id: string;
  fullName: string;
  username: string;
};

export class Group {
  id!: string;
  name!: string;
  description!: string;
  owner!: UserInGroup;
  members!: UserInGroup[];
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
