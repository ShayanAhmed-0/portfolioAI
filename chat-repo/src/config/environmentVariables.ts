import { z } from "zod";
import findConfig from "find-config";
import dotenv from "dotenv";

const envFilePath = findConfig(".env");
if (envFilePath) {
  dotenv.config({ path: envFilePath });
} else {
  console.warn("No .env file found. ");
}
// Define schema using Zod
const schema = z.object({
  ENVIRONMENT: z.string(),
  GOOGLE_MAPS_API_KEY: z.string(),
  LIVE_URl: z.string(),
  REDIS_OTP_TIME: z.string().transform((str) => parseInt(str, 10)),
  LINK: z.string(),
  PORT: z.string().transform((str) => parseInt(str, 10)),
  HOST: z.string(),
  SERVER_HOST: z.string(),
  USER_AUTH_JWT_SECRET: z.string(),
  USER_FORGOT_PASS_JWT_SECRET: z.string(),
  USER_FORGOT_PASS_OTP_JWT_SECRET: z.string(),
  VENDOR_FORGOT_PASS_JWT_SECRET: z.string(),
  VENDOR_FORGOT_PASS_OTP_JWT_SECRET: z.string(),
  VENDOR_AUTH_JWT_SECRET: z.string(),
  EMPLOYEE_SECRET: z.string(),
  EMPLOYEE_SECRET_OTP: z.string(),
  EMPLOYEE_FORGOT_PASS_JWT_SECRET: z.string(),
  EMPLOYEE_FORGOT_PASS_OTP_JWT_SECRET: z.string(),
  USER_JWT_SECRET: z.string(),
  VENDOR_JWT_SECRET: z.string(),
  MAIL_PORT: z.string().transform((str) => parseInt(str, 10)),
  MAIL_HOST: z.string(),
  MAIL_USERNAME: z.string(),
  MAIL_PASSWORD: z.string(),
  JWT_TIME: z.string(),
  SCHEME: z.string(),
});

const validatedEnv = schema.parse(process.env);

export default validatedEnv;
