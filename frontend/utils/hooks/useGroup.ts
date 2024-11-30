import { ApiError } from "@/types/ApiError.types";
import { fetcher } from "../fetcher";
import { useState } from "react";
import {
  CreateGroupParams,
  Group,
  GroupApiResponse,
  UpdateGroupParams,
} from "@/types/Group.types";

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
      return new Group(res);
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
    getAll,
    update,
    create,
    join,
    loading,
  };
};
