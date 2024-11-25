export type User = {
  id: string;
  username: string;
  fullName?: string;
  groupIds: string[];
  phoneNumber?: string;
  email: string;
};

export type UserApiResponse = {
  _id: string;
  username: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  revolut_id?: string;
  group_ids: string[];
};
