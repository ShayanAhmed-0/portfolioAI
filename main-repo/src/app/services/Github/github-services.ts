import validatedEnv from "../../../config/environmentVariables";
import { prismaClient } from "../../../lib/db";
// import { Octokit } from "@octokit/rest";

const CLIENT_ID = validatedEnv.CLIENT_ID;
const CLIENT_SECRET = validatedEnv.CLIENT_SECRETS;

export interface Repo {
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description?: string | null;
  fork: boolean;
  created_at: Date;
  updated_at: Date;
  pushed_at: Date;
  homepage: string;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  forks_count: string;
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
}
export default class GithubService {
  public static generateRedirectUrl() {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user,repo`;
    return redirectUrl;
  }
  public static async generateAccessToken(code: string) {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
        }),
      }
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    return accessToken;
  }

  public static async InitilizeOctoKit(accessToken: string) {
    const { Octokit } = await import("@octokit/rest"); // Dynamic import

    const octokit = new Octokit({ auth: accessToken });

    // Example: Get authenticated user's profile
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser();

    // console.log(user)
    // console.log(repos)

    return {
      user,
      repos,
    };
  }
  public static async CreateManyRepos(repoData: Repo[]) {
    await prismaClient.repos.createMany({
      data: repoData,
      skipDuplicates: true, // optional, avoids inserting duplicates
    });
  }
  public static async CreateGitUser(
    user_profile_id: string,
    login: string,
    avatar_url: string,
    html_url: string,
    hireable: boolean | null,
    bio: string | null,
    public_repos: number,
    public_gists: number,
    followers: number,
    following: number,
    created_at: string,
    updated_at: string,
    total_private_repos: number | undefined,
    owned_private_repos: number | undefined,
    collaborators: number | undefined,
    two_factor_authentication: boolean,
    email: string | null
  ) {}
}
