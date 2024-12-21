import { createHmac, randomBytes } from "crypto";
export const gethashedPass = (salt: string, password: string) => {
  const hashedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  return hashedPassword;
};
