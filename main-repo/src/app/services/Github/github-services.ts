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
    await GithubService.CreateGitUser(
     user.id,
     user.login,
     user.avatar_url,
     user.html_url,
     user.email,
     user.hireable?.toString() || null,
     user.bio,
     user.public_repos,
     user.public_gists,
     user.followers,
     user.following,
     new Date(user.created_at),
     new Date(user.updated_at),
     user.total_private_repos ?? 0,
     user.owned_private_repos ?? 0,
     user.collaborators ?? 0,
     user.url

    );
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser();
    const mappedRepos = repos.map((repo: any) => ({
      git_user_id:user.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      html_url: repo.html_url,
      description: repo.description,
      fork: repo.fork,
      created_at: new Date(repo.created_at),
      updated_at: new Date(repo.updated_at),
      pushed_at: new Date(repo.pushed_at),
      homepage: repo.homepage || "",
      stargazers_count: repo.stargazers_count,
      watchers_count: repo.watchers_count,
      language: repo.language || "",
      forks_count: String(repo.forks_count), // String as per your Prisma model
      visibility: repo.visibility || "",
      forks: repo.forks,
      open_issues: repo.open_issues,
      watchers: repo.watchers,
      default_branch: repo.default_branch,
    }));

    await GithubService.CreateManyRepos(mappedRepos);

    return {
      user,
      repos,
    };
  }
  public static async CreateManyRepos(repoData: Repo[]) {
    return await prismaClient.repos.createMany({
      data: repoData,
      skipDuplicates: true, // optional, avoids inserting duplicates
    });
  }

  public static async CreateGitUser(
    id:number,
    login: string,
    avatar_url: string,
    html_url: string,
    email: string | null,
    hireable:  string |null,
    bio: string | null,
    public_repos: number,
    public_gists: number,
    followers: number,
    following: number,
    created_at: Date,
    updated_at: Date,
    total_private_repos: number,
    owned_private_repos: number,
    collaborators: number,
    url:string
  ) {
    return await prismaClient.gitUser.create({
      data: {
        id,
        login: login,
        avatar_url: avatar_url,
        html_url: html_url,
        email: email,
        hireable: hireable?.toString() || null,
        bio: bio,
        public_repos: public_repos,
        public_gists: public_gists,
        followers: followers,
        following: following,
        created_at: new Date(created_at),
        updated_at: new Date(updated_at),
        total_private_repos: total_private_repos ?? 0,
        owned_private_repos: owned_private_repos ?? 0,
        collaborators: collaborators ?? 0,
        url
      },
    });
  }
  public static async connectGitUserToProfile(
    profileId:string,
    githubUserId:number
  ) {
    return await prismaClient.userProfile.update({
      where:{
        id:profileId
      },
      data:{
        git_user:{
          connect:{
            id:githubUserId
          }
        }
      }
    })
  }
}
