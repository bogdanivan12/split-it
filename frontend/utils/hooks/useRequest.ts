import { useState } from "react";
import { fetcher } from "../fetcher";
import { RequestsApiResponse } from "@/types/Request.types";
import { ApiError } from "@/types/ApiError.types";

export const useRequest = () => {
  const [loading, setLoading] = useState(false);

  const getAll = async (token: string) => {
    try {
      return await fetcher<RequestsApiResponse>({
        endpoint: `/api/v1/requests`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get requests");
    }
  };
  const getByGroup = async (groupId: string, token: string) => {
    try {
      setLoading(true);
      const allRequests = await getAll(token);
      return allRequests[groupId] || [];
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get requests");
    } finally {
      setLoading(false);
    }
  };
  return {
    loading,
    getByGroup,
  };
};
