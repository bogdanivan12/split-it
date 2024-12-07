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
import { GroupInvitation } from "@/types/Notification.types";

export const useRequest = () => {
  const [loading, setLoading] = useState(false);

  const getAll = async (token: string) => {
    try {
      return await fetcher<RequestsApiResponse>({
        endpoint: "/api/v1/requests/",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const err = error as ApiError;
      console.log(err.message)
      throw Error("Could not get requests");
    }
  };
  const getByGroup = async (
    groupId: string,
    token?: string
  ): Promise<{ sent: Req[]; received: Req[] }> => {
    try {
      setLoading(true);
      if (!token) return { sent: [], received: [] };
      const allRequests = await getAll(token);
      return allRequests && allRequests.JOIN_GROUP
        ? {
            sent: allRequests.JOIN_GROUP.sent
              .filter((r) => r.group._id === groupId && r.status === "PENDING")
              .map((r) => new Req(r)),
            received: allRequests.JOIN_GROUP.received
              .filter((r) => r.group._id === groupId && r.status === "PENDING")
              .map((r) => new Req(r)),
          }
        : { sent: [], received: [] };
    } catch (error) {
      const err = error as ApiError;
      console.log(err.message)
      throw Error("Could not get requests");
    } finally {
      setLoading(false);
    }
  };

  const getInvites = async (
    userId?: string,
    token?: string
  ): Promise<GroupInvitation[]> => {
    if (!(userId && token)) return [];
    try {
      setLoading(true);
      const allRequests = await getAll(token);
      const inviteRequests =
        allRequests && allRequests.INVITE_TO_GROUP
          ? allRequests.INVITE_TO_GROUP.received.filter(
              (r) => r.recipient._id === userId && r.status === "PENDING"
            )
          : [];
      if (inviteRequests.length === 0) return [];
      return inviteRequests.map((i) => ({
        groupName: i.group.name,
        requestId: i._id,
        sender: i.sender.username,
      }));
    } catch (error: any) {
      console.log(error.message);
      throw Error("Could not get invites");
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
          usernames: body.usernames,
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
        endpoint: `/api/v1/groups/${body.groupId}/member/${body.username}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const err = error as ApiError;
      if (err.code === 404) throw Error("User not found");
      throw Error("Could not add user");
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

  const decline = async (requestId: string, token: string) => {
    try {
      setLoading(true);
      await fetcher({
        endpoint: `/api/v1/requests/${requestId}/decline`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const err = error as ApiError;
      throw Error("Could not decline invite");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getByGroup,
    invite,
    acceptInvite,
    acceptJoin,
    decline,
    getInvites,
    checkIfUserExists,
  };
};
