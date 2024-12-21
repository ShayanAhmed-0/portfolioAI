import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import multer from "fastify-multer"; // or import multer from 'fastify-multer'
import user_auth_bearer from "../../../../middlewares/bearer-token/user-auth-bearer";
import { handle_multipart } from "../../../../middlewares/multipart/handle-multipart";
import { avatar_multipart } from "../../../../middlewares/multipart/avatar-multipart";
import user_bearer from "../../../../middlewares/bearer-token/user-bearer";
import CustomError from "../../../../../utils/custom-response/custom-error";
import { give_review, my_reviews } from "./handler";
import { review_multipart } from "../../../../middlewares/multipart/handle-multipart copy";
// import formBody from "fastify-formbody";

const upload = multer({ dest: "uploads/" });

const authheaders = {
  type: "object",
  properties: {
    Authorization: { type: "string" },
  },
  required: ["Authorization"],
};

const otherRes = {
  type: "object",
  properties: {
    status: { type: "number" },
    message: { type: "string" },
  },
  required: ["status", "message"],
};
const user_reviews = async (fastify: FastifyInstance) => {
  fastify.route({
    method: "POST",
    url: "/give-review",
    schema: {
      headers: authheaders,
    },
    handler: give_review,
    preHandler: review_multipart.array("reviewImg"),
    preValidation: user_bearer,
    errorHandler: (
      error: FastifyError,
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      return reply
        .status(error.statusCode!)
        .send({ message: error.message, status: error.statusCode });
    },
  });
  fastify.route({
    method: "GET",
    url: "/my-reviews",
    schema: {
      headers: authheaders,
    },
    handler: my_reviews,
    preValidation: user_bearer,
    errorHandler: (
      error: FastifyError,
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      return reply
        .status(error.statusCode!)
        .send({ message: error.message, status: error.statusCode });
    },
  });
};

export default user_reviews;
