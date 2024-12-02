import { UpdateAccountParams, User, UserApiResponse, UserSummary, UserSummaryApiResponse } from "@/types/User.types";
import { useState } from "react";
import { fetcher } from "../fetcher";
import { ApiError } from "@/types/ApiError.types";

export const useUser = () => {
  const [loading, setLoading] = useState(false);

  const update = async (data: Partial<UpdateAccountParams>, token: string) => {
    try {
      if (Object.keys(data).length === 0) return;
      setLoading(true);
      await fetcher<UserApiResponse>({
        endpoint: `/api/v1/users/me`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not update account");
    } finally {
      setLoading(false);
    }
  };

  const get = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetcher<UserApiResponse>({
        endpoint: `/api/v1/users/me`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return new User(res);
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get account");
    } finally {
      setLoading(false);
    }
  };

  const getByUsernames = async (usernames: string[], token: string) => {
    try {
      if (usernames.length === 0) return [];
      setLoading(true);
      if (usernames.length === 0) return [];
      const res = await fetcher<UserSummaryApiResponse[]>({
        endpoint: `/api/v1/users/get_by_usernames`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: usernames,
      });
      return res.map((u) => new UserSummary(u));
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get users");
    } finally {
      setLoading(false);
    }
  };

  const getByIds = async (ids: string[], token: string) => {
    try {
      if (ids.length === 0) return [];
      setLoading(true);
      if (ids.length === 0) return [];
      const res = await fetcher<UserSummaryApiResponse[]>({
        endpoint: `/api/v1/users/get_by_ids`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: ids,
      });
      return res.map((u) => new UserSummary(u));
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get users");
    } finally {
      setLoading(false);
    }
  };

  const del = async (token: string) => {
    try {
      setLoading(true);
      await fetcher({
        endpoint: `/api/v1/users/me`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return;
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not delete account");
    } finally {
      setLoading(false);
    }
  };

  return {
    update,
    del,
    get,
    getByIds,
    getByUsernames,
    loading,
  };
};
