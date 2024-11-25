export type UserInGroup = {
  id: string;
  fullName: string;
  username: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  owner: UserInGroup;
  members: UserInGroup[];
  pendingMembers: UserInGroup[];
};

export type ShortGroup = {
  id: string;
  name: string;
};
