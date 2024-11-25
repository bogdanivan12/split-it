import { ApiError } from "@/types/ApiError.types";
import { fetcher } from "../fetcher";
import { useState } from "react";
import { Group } from "@/types/Group.types";

type CreateGroupParams = {
  name: string;
  description: string;
};

type UpdateGroupParams = {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_ids: string[];
  bill_ids: string[];
};

type GroupApiResponse = {
  _id: string;
  name: string;
  description: string;
  owner_id: string;
  member_ids: string[];
  bill_ids: string[];
  join_code: string;
};

type GroupUsersApiResponse = {
  _id: string;
  full_name: string;
  username: string;
};

const groupMapper = (
  res: GroupApiResponse,
  usersRes: GroupUsersApiResponse[]
): Group => {
  const owner = usersRes.find((m) => m._id === res.owner_id)!;
  return {
    id: res._id,
    description: res.description,
    members: usersRes
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
    pendingMembers: [],
  };
};

export const useGroup = () => {
  const [loading, setLoading] = useState(false);

  const getUsersInGroup = async (id: string, token: string) => {
    return await fetcher<GroupUsersApiResponse[]>({
      endpoint: `/api/v1/groups/${id}/users`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const get = async (id: string, token: string) => {
    try {
      setLoading(true);
      const res = await fetcher<GroupApiResponse>({
        endpoint: `/api/v1/groups/${id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const usersRes = await getUsersInGroup(id, token);

      return groupMapper(res, usersRes);
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get group");
    } finally {
      setLoading(false);
    }
  };

  const getAll = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetcher<GroupApiResponse[]>({
        endpoint: `/api/v1/groups/`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.map((g) => ({ id: g._id, name: g.name }));
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get groups");
    } finally {
      setLoading(false);
    }
  };

  const update = async (data: UpdateGroupParams, token: string) => {
    try {
      setLoading(true);
      const res = await fetcher<GroupApiResponse>({
        endpoint: `/api/v1/groups/${data._id}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      const usersRes = await getUsersInGroup(data._id, token);
      return groupMapper(res, usersRes);
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not update group");
    } finally {
      setLoading(false);
    }
  };

  const create = async (data: CreateGroupParams, token: string) => {
    try {
      setLoading(true);
      const res = await fetcher<GroupApiResponse>({
        endpoint: "/api/v1/groups/",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      return res._id;
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not create group");
    } finally {
      setLoading(false);
    }
  };

  return {
    get,
    getAll,
    update,
    create,
    loading,
  };
};
