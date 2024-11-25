export type ValidateRegisterReturn = {
  email: string[];
  username: string[];
  password: string[];
  confirmPassword: string[];
};

export const EMPTY_VALIDATE_REGISTER_RETURN = {
  email: [],
  username: [],
  password: [],
  confirmPassword: [],
};

const validatePassword = (password: string) => {
  const errors: string[] = [];
  if (password.length < 6)
    errors.push("Password length should be higher than 6");
  return errors;
};

const validateConfirmPassword = (confirmPassword: string, password: string) => {
  const errors: string[] = [];
  if (password !== confirmPassword) errors.push("Passwords mush match");
  return errors;
};

const validateUsername = (username: string) => {
  const errors: string[] = [];
  if (username.length < 6)
    errors.push("Username length should be higher than 6");
  return errors;
};

const validateEmail = (email: string) => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    errors.push("Invalid email address");
  }

  return errors;
};

export const validateRegister = ({
  email,
  confirmPassword,
  password,
  username,
}: {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}): ValidateRegisterReturn => {
  return {
    email: validateEmail(email),
    username: validateUsername(username),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(confirmPassword, password),
  };
};
