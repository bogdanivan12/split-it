import { User, UserApiResponse } from "@/types/User.types";
import { useState } from "react";
import { fetcher } from "../fetcher";
import { ApiError } from "@/types/ApiError.types";

type UpdateAccountParams = {
  email: string;
  full_name?: string;
  phone_number?: string;
  revolut_id?: string;
};

export const useAccount = () => {
  const [loading, setLoading] = useState(false);

  const update = async (data: UpdateAccountParams, token: string) => {
    try {
      setLoading(true);
      const res = await fetcher<UserApiResponse>({
        endpoint: `/api/v1/users/me`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      return res;
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
      return res;
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get account");
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
    loading,
  };
};
