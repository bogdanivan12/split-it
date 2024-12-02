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
import { useGroup } from "./useGroup";
import { useUser } from "./useUser";

export const useRequest = () => {
  const [loading, setLoading] = useState(false);

  const { getGroups } = useGroup();
  const { getByIds } = useUser();

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
      const sentRequests = allRequests.JOIN_GROUP
        ? allRequests.JOIN_GROUP.sent.filter(
            (r) => r.group_id === groupId && r.status === "PENDING"
          )
        : [];
      const receivedRequests = allRequests.JOIN_GROUP
        ? allRequests.JOIN_GROUP.received.filter(
            (r) => r.group_id === groupId && r.status === "PENDING"
          )
        : [];
      const ids = sentRequests
        .map((r) => r.recipient_id)
        .concat(receivedRequests.map((r) => r.sender_id));
      const allUsers = await getByIds(ids, token);
      return allRequests && allRequests.JOIN_GROUP
        ? {
            sent: allRequests.JOIN_GROUP.sent
              .filter((r) => r.group_id === groupId && r.status === "PENDING")
              .map((r) => new Req(r, allUsers)),
            received: allRequests.JOIN_GROUP.received
              .filter((r) => r.group_id === groupId && r.status === "PENDING")
              .map((r) => new Req(r, allUsers)),
          }
        : { sent: [], received: [] };
    } catch (error) {
      const err = error as ApiError;
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
              (r) => r.recipient_id === userId && r.status === "PENDING"
            )
          : [];
      if (inviteRequests.length === 0) return [];
      const groupNames: Record<string, string> = {};
      const groupSummaries = await getGroups(
        inviteRequests.map((r) => r.group_id),
        token
      );
      groupSummaries.forEach((g) => (groupNames[g.id] = g.name));
      const userSummaries = await getByIds(
        inviteRequests.map((r) => r.sender_id),
        token
      );
      const userNames: Record<string, string> = {};
      userSummaries.forEach((u) => (userNames[u.id] = u.username));
      return inviteRequests.map((i) => ({
        groupName: groupNames[i.group_id],
        requestId: i._id,
        sender: userNames[i.sender_id],
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
        endpoint: `/api/v1/users/member_in_group/${body.username}/${body.groupId}`,
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
