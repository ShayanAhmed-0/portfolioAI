import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import multer from "fastify-multer"; // or import multer from 'fastify-multer';
import {
  search_portfolios,
  // myCards,
} from "./handler";
import user_bearer from "../../../middlewares/bearer-token/user-bearer";
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
const portfolios = async (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/search",
    schema: {
      // headers: authheaders,
    },
    handler: search_portfolios,
    // preValidation: user_bearer,
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

export default portfolios;
