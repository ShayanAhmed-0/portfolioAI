import { createHmac, randomBytes } from "crypto";

export const generateSalt = () => {
  return randomBytes(32).toString("hex");
};
