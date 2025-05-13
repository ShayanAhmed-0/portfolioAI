import validatedEnv from "../../../config/environmentVariables";
// import { Octokit } from "@octokit/rest";

const CLIENT_ID = validatedEnv.CLIENT_ID;
const CLIENT_SECRET = validatedEnv.CLIENT_SECRETS;
export default class GithubService {
  public static generateRedirectUrl(){
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user,repo`;
    return redirectUrl
  }
  public static async  generateAccessToken(code:string){
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    return accessToken
  }

  public static async InitilizeOctoKit(accessToken:string){
    const { Octokit } = await import('@octokit/rest'); // Dynamic import

  const octokit = new Octokit({ auth: accessToken });

  // Example: Get authenticated user's profile
  const { data: user } = await octokit.rest.users.getAuthenticated();
  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser();

  // console.log(user)
  // console.log(repos)

  return {
    user,
    repos
  }

  }
}
