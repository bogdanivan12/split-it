import { fetcher } from "../fetcher";
import { createApiHook } from "./utils/createApiHook";

export type RegisterParams = {
  email: string;
  username: string;
  password: string;
};

export const register = async ({ email, username, password }: RegisterParams) => {
  await fetcher({
    endpoint: "/register",
    body: { email, username, password },
  });
};

export const useRegister = createApiHook({
  apiCall: register,
  errorMessage: "Registration failed. Please try again.",
  successMessage: "Registration successful!",
});