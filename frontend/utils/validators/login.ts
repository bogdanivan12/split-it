export type ValidateLoginReturn = {
  username: string[];
  password: string[];
};

export const EMPTY_VALIDATE_LOGIN_RETURN = {
  username: [],
  password: [],
};

const validatePassword = (password: string) => {
  const errors: string[] = [];
  if (password.trim().length < 6) errors.push("Invalid password");
  return errors;
};

const validateUsername = (username: string) => {
  const errors: string[] = [];
  if (username.trim().length === 0) errors.push("Invalid username");
  return errors;
};

export const validateLogin = ({
  password,
  username,
}: {
  username: string;
  password: string;
}): ValidateLoginReturn => {
  return {
    username: validateUsername(username),
    password: validatePassword(password),
  };
};
