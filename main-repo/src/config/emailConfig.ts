import validatedEnv from "./environmentVariables";

export const emailConfig = {
  pool: true,
  port: Number(validatedEnv.MAIL_PORT),
  secure: true,
  host: validatedEnv.MAIL_HOST,
  auth: {
    user: validatedEnv.MAIL_USERNAME,
    pass: validatedEnv.MAIL_PASSWORD,
  },
};
