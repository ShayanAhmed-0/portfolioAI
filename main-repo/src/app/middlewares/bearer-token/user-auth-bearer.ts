import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from "fastify";
import _ from "lodash";
import { verifyJWT } from "../../../utils/validation/token";
import validatedEnv from "../../../config/environmentVariables";
// import validatedEnv from "../../../config/environmentVariables";

// declare module "fastify" {
//   interface FastifyRequest {
//     user: any;
//   }
// }

export default async function user_auth_bearer(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const token = req.headers.authorization;
  console.log(token);
  if (!token) {
    return reply.status(401).send({
      message: "Unauthorized Authorization Token is Required",
      status: 401,
    });
  }
  const verification: any = verifyJWT(token, validatedEnv.USER_AUTH_JWT_SECRET);
  if (!verification) {
    return reply.status(401).send({
      message: "Unauthorized Authorization Token is Invalid",
      status: 401,
    });
  }
  // console.log("verification=>", verification);
  return (req.user = verification);
  // req.uid = "uiduid";
}
