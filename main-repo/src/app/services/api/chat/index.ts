import {
    FastifyError,
    FastifyInstance,
    FastifyReply,
    FastifyRequest,
  } from "fastify";
import user_bearer from "../../../middlewares/bearer-token/user-bearer";
import { createChat, sendMessage, getChatMessages, getUserChats } from "./handler";
import { avatar_multipart } from "../../../middlewares/multipart/avatar-multipart";
import { chat_multipart } from "../../../middlewares/multipart/chat-multipart";
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
  const chats = async (fastify: FastifyInstance) => {
    fastify.route({
      method: "POST",
      url: "/create-chat",
      schema: { 
      },
      preValidation: user_bearer,
      handler: createChat,
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
      method: "POST",
      url: "/send-message",
      schema: { 
      },
      preValidation: user_bearer,
      preHandler: chat_multipart.array("media", 10), // Handling file upload
      handler: sendMessage,
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
      url: "/chat-rooms",
      schema: { 
      },
      preValidation: user_bearer,
      handler: getUserChats,
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
      url: "/chat-messages/:chatId",
      schema: { 
      },
      preValidation: user_bearer,
      handler: getChatMessages,
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
  
  export default chats;
  