import { useState } from "react";
import { fetcher } from "../fetcher";
import {
  CheckIfUserExistsParams,
  InviteParams,
  MemberInGroup,
  Request as Req,
  RequestsApiResponse,
} from "@/types/Request.types";
import { ApiError } from "@/types/ApiError.types";

export const useRequest = () => {
  const [loading, setLoading] = useState(false);

  const getAll = async (token: string) => {
    try {
      console.log(`token: ${token}`);
      return await fetcher<RequestsApiResponse>({
        endpoint: "/api/v1/requests/",
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
      return allRequests
        ? {
            sent: allRequests.JOIN_GROUP.sent
              .filter((r) => r.group_id === groupId && r.status === "PENDING")
              .map((r) => new Req(r)),
            received: allRequests.JOIN_GROUP.received
              .filter((r) => r.group_id === groupId && r.status === "PENDING")
              .map((r) => new Req(r)),
          }
        : { sent: [], received: [] };
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not get requests");
    } finally {
      setLoading(false);
    }
  };

  const invite = async (body: InviteParams, token: string) => {
    try {
      setLoading(true);
      await fetcher({
        endpoint: `/api/v1/requests/invite`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          username: body.usernames,
          group_id: body.groupId,
        },
      });
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not invite");
    } finally {
      setLoading(false);
    }
  };

  const checkIfUserExists = async (
    body: CheckIfUserExistsParams,
    token: string
  ) => {
    try {
      setLoading(true);
      return await fetcher<MemberInGroup>({
        endpoint: `/api/v1/users/member_in_group/${body.username}/${body.groupId}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not check if user exists");
    } finally {
      setLoading(false);
    }
  };

  const acceptJoin = async (requestId: string, token: string) => {
    try {
      setLoading(true);
      await fetcher({
        endpoint: `/api/v1/requests/join-group/${requestId}/accept`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not accept join");
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (requestId: string, token: string) => {
    try {
      setLoading(true);
      await fetcher({
        endpoint: `/api/v1/requests/invite/${requestId}/accept`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not accept invite");
    } finally {
      setLoading(false);
    }
  };

  const decline = async (requestId: string, token: string) => {};

  return {
    loading,
    getByGroup,
    invite,
    acceptInvite,
    acceptJoin,
    decline,
    checkIfUserExists,
  };
};
