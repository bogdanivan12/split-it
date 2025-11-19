import { ApiError } from "@/types/ApiError.types";
import { fetcher } from "../fetcher";
import { createApiHook } from "./helpers/createApiHook";
import { validateLogin, ValidateLoginReturn } from "../validators/login";

export type LoginParams = {
  username: string;
  password: string;
};

export const login = async (
  input: LoginParams
): Promise<{ validationErrors?: ValidateLoginReturn; token: string }> => {
  const validationErrors = validateLogin(input);
  if (Object.values(validationErrors).flat().length > 0)
    return { validationErrors, token: "" };
  const { password, username } = input;
  try {
    const res = await fetcher<{ access_token: string; token_type: string }>({
      endpoint: "/api/v1/auth/token",
      method: "POST",
      contentType: "multipart/form-data",
      body: { username, password, grant_type: "password" },
    });
    return { token: res.access_token };
  } catch (error) {
    const err = error as ApiError;
    throw Error(
      err.code === 401
        ? "Invalid username or password"
        : "Could not login. Please try again."
    );
  }
};

export const useLogin = createApiHook(login);
