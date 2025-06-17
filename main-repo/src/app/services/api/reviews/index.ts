import {
    FastifyError,
    FastifyInstance,
    FastifyReply,
    FastifyRequest,
  } from "fastify";
import user_bearer from "../../../middlewares/bearer-token/user-bearer";
import { create_review, get_reviews } from "./handler";
// import { getlovs } from "./handler";
  // import formBody from "fastify-formbody";
  
  // const upload = multer({ dest: "uploads/" });
  
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
  const reviews = async (fastify: FastifyInstance) => {
    fastify.route({
      method: "POST",
      url: "/create-review",
      schema: { 
      },
      preValidation: user_bearer,
      handler: create_review,
      errorHandler: (
        error: FastifyError,
        req: FastifyRequest,
        reply: FastifyReply
      ) => {
        return reply
          .status(error.statusCode || 500)
          .send({ message: error.message, status: error.statusCode || 500 });
      },
    });
    fastify.route({
      method: "GET",
      url: "/get-reviews/:profileId",
      schema: { 
      },
      preValidation: user_bearer,
      handler: get_reviews,
      errorHandler: (
        error: FastifyError,
        req: FastifyRequest,
        reply: FastifyReply
      ) => {
        return reply
          .status(error.statusCode || 500)
          .send({ message: error.message, status: error.statusCode || 500 });
      },
    });
    
  };
  
  export default reviews;
  