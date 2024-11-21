import { ApiError } from "@/types/ApiError.types";
import { fetcher } from "../fetcher";
import { validateRegister, ValidateRegisterReturn } from "../validators";
import { createApiHook } from "./utils/createApiHook";

export type RegisterParams = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export const register = async (
  input: RegisterParams
): Promise<{ validationErrors?: ValidateRegisterReturn; ok: boolean }> => {
  const validationErrors = validateRegister(input);
  if (Object.values(validationErrors).flat().length > 0)
    return { validationErrors, ok: false };
  const { email, password, username } = input;
  try {
    await fetcher({
      endpoint: "/api/v1/users/",
      method: "POST",
      contentType: "multipart/form-data",
      body: { email, username, password, grant_type: "password" },
    });
    return { ok: true };
  } catch (error) {
    const err = error as ApiError;
    throw Error(
      err.code === 409 ? "Username or email already exists" : "Could not create the account. Please try again."
    );
  }
};

export const useRegister = createApiHook(register);
