import { ApiError } from "@/types/ApiError.types";
import { fetcher } from "../fetcher";
import { useState } from "react";
import { Group } from "@/types/Group.types";

type CreateGroupParams = {
  name: string;
  description: string;
};

type UpdateGroupParams = {
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

const groupMapper = (res: GroupApiResponse): Group => {
  return {
    id: res._id,
    description: res.description,
    members: res.member_ids.map((m) => ({
      fullName: "",
      id: m,
      username: "",
    })),
    name: res.name,
    owner: {
      fullName: "",
      id: res.owner_id,
      username: "",
    },
    pendingMembers: [],
  };
};

export const useGroup = () => {
  const [loading, setLoading] = useState(false);

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
      return groupMapper(res);
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get group");
    } finally {
      setLoading(true);
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
      return res.map(groupMapper);
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get groups");
    } finally {
      setLoading(true);
    }
  };

  const update = async (data: UpdateGroupParams, token: string) => {
    try {
      setLoading(true);
      const res = await fetcher<GroupApiResponse>({
        endpoint: "/api/v1/groups/",
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      return groupMapper(res);
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not update group");
    } finally {
      setLoading(true);
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
      setLoading(true);
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
