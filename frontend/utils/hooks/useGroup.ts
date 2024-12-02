import { ApiError } from "@/types/ApiError.types";
import { fetcher } from "../fetcher";
import { useState } from "react";
import {
  CreateGroupParams,
  UserSummaryApiResponse,
  Group,
  GroupApiResponse,
  GroupSummary,
  GroupSummaryApiResponse,
  UpdateGroupParams,
} from "@/types/Group.types";

export const useGroup = () => {
  const [loading, setLoading] = useState(false);

  const getMembers = async (id: string, token: string) => {
    try {
      return await fetcher<UserSummaryApiResponse[]>({
        endpoint: `/api/v1/groups/${id}/users`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get group");
    }
  };

  const get = async (id: string, token: string): Promise<Group> => {
    try {
      setLoading(true);
      const res = await fetcher<GroupApiResponse>({
        endpoint: `/api/v1/groups/${id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const members = await getMembers(id, token);
      return new Group(res, members);
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get group. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const getGroups = async (
    ids: string[],
    token?: string
  ): Promise<GroupSummary[]> => {
    try {
      if (!token) return [];
      if (ids.length === 0) return [];
      setLoading(true);
      const res = await fetcher<GroupSummaryApiResponse[]>({
        endpoint: `/api/v1/groups/get_groups`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: ids,
      });
      return res.map((g) => new GroupSummary(g));
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAll = async (token: string) => {
    try {
      if (!token) return [];
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
      await fetcher<GroupApiResponse>({
        endpoint: `/api/v1/groups/${data._id}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
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

  const join = async (groupCode: string, token: string) => {
    try {
      setLoading(true);
      await fetcher({
        endpoint: `/api/v1/groups/join/${groupCode}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const err = error as ApiError;
      if (err.code === 404) throw Error("Invalid join code");
      if (err.code === 409) throw Error(err.body.detail);
      throw Error("Could not join group");
    } finally {
      setLoading(false);
    }
  };

  return {
    get,
    getGroups,
    getAll,
    update,
    create,
    join,
    loading,
  };
};
