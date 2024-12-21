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
import {
  addCard,
  allowNotifications,
  change_password,
  deleteAccount,
  myCards,
} from "./handler";
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
const user_setting = async (fastify: FastifyInstance) => {
  fastify.route({
    method: "PATCH",
    url: "/change-password",
    schema: {
      headers: authheaders,
      body: {
        type: "object",
        properties: {
          password: { type: "string" },
          newPassword: { type: "string" },
        },
        required: ["password", "newPassword"],
      },
      response: {
        200: otherRes,
        400: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    handler: change_password,
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
    method: "PATCH",
    url: "/allow-notifications",
    schema: {
      headers: authheaders,
      body: {
        type: "object",
        properties: {
          allowNotifications: { type: "boolean" },
        },
        required: ["allowNotifications"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "number" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                notifications: { type: "boolean" },
              },
              required: ["notifications"],
            },
          },
          required: ["status", "message", "data"],
        },
        400: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    handler: allowNotifications,
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
    method: "DELETE",
    url: "/delete/:id",
    schema: {
      headers: authheaders,
      response: {
        200: otherRes,
        400: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    handler: deleteAccount,
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
    url: "/my-cards",
    schema: {
      headers: authheaders,
    },
    handler: myCards,
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
    method: "POST",
    url: "/add-card",
    schema: {
      headers: authheaders,
      body: {
        type: "object",
        properties: {
          cardNumber: { type: "string" },
          name: { type: "string" },
          expiryDate: { type: "string" },
          CVV: { type: "string" },
        },
        required: ["cardNumber", "name", "expiryDate", "CVV"],
      },
      response: {
        200: otherRes,
        400: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    handler: addCard,
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

export default user_setting;
