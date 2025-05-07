import {
    FastifyError,
    FastifyInstance,
    FastifyReply,
    FastifyRequest,
  } from "fastify";
import user_bearer from "../../../middlewares/bearer-token/user-bearer";
import { getlovs } from "./handler";
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
  const lovs = async (fastify: FastifyInstance) => {
    
    //login
    fastify.route({
      method: "GET",
      url: "/all-lovs",
      schema: { 
      },
      preValidation: user_bearer,
      handler: getlovs,
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
  
  export default lovs;
  