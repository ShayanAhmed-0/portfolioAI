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
  // GOOGLE_MAPS_API_KEY: z.string(),
  // STRIPE_KEY: z.string(),
  ENVIRONMENT: z.string(),
  LIVE_URl: z.string(),
  REDIS_OTP_TIME: z.string().transform((str) => parseInt(str, 10)),
  LINK: z.string(),
  PORT: z.string().transform((str) => parseInt(str, 10)),
  HOST: z.string(),
  SERVER_HOST: z.string(),
  USER_AUTH_JWT_SECRET: z.string(),
  USER_FORGOT_PASS_JWT_SECRET: z.string(),
  USER_FORGOT_PASS_OTP_JWT_SECRET: z.string(),
  USER_JWT_SECRET: z.string(),
  MAIL_PORT: z.string().transform((str) => parseInt(str, 10)),
  MAIL_HOST: z.string(),
  MAIL_USERNAME: z.string(),
  MAIL_PASSWORD: z.string(),
  JWT_TIME: z.string(),
  SCHEME: z.string(),
  KEY: z.string(),
  CRT: z.string(),
  CA: z.string(),
  CLIENT_ID: z.string(),
  CLIENT_SECRETS: z.string(),
});

const validatedEnv = schema.parse(process.env);

export default validatedEnv;

// {
//   name: 'MarketPlace',
//   full_name: 'ShayanAhmed-0/MarketPlace',
//   private: false,
//   html_url: 'https://github.com/ShayanAhmed-0/MarketPlace',
//   description: null,
//   fork: false,
//   created_at: '2023-06-06T21:51:19Z',
//   updated_at: '2023-07-05T17:56:56Z',
//   pushed_at: '2023-11-24T18:20:43Z',
//   homepage: 'https://nextmartjs.vercel.app',
//   stargazers_count: 0,
//   watchers_count: 0,
//   language: 'TypeScript',
//   forks_count: 0,
//   visibility: 'public',
//   forks: 0,
//   open_issues: 0,
//   watchers: 0,
//   default_branch: 'main',
// }
// {
//   login: 'ShayanAhmed-0',
//   avatar_url: 'https://avatars.githubusercontent.com/u/93779726?v=4',
//   html_url: 'https://github.com/ShayanAhmed-0',
//   email: null,
//   hireable: null,
//   bio: null,
//   public_repos: 38,
//   public_gists: 0,
//   followers: 2,
//   following: 1,
//   created_at: '2021-11-05T14:25:07Z',
//   updated_at: '2025-04-27T22:06:07Z',
//   total_private_repos: 7,
//   owned_private_repos: 7,
//   collaborators: 0,
//   two_factor_authentication: true,
// }
