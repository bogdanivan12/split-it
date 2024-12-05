export type UserApiResponse = {
  _id: string;
  username: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  revolut_id?: string;
  group_ids: string[];
};

export type UpdateAccountParams = {
  email: string;
  full_name?: string;
  phone_number?: string;
  revolut_id?: string;
};

export type UserSummaryApiResponse = {
  _id: string;
  full_name: string;
  username: string;
};

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

export class User {
  id!: string;
  username!: string;
  fullName!: string;
  groupIds!: string[];
  phoneNumber!: string;
  email!: string;

  constructor(res: UserApiResponse) {
    return {
      email: res.email,
      id: res._id,
      fullName: res.full_name || "",
      groupIds: res.group_ids,
      phoneNumber: res.phone_number || "",
      username: res.username,
    };
  }
}
