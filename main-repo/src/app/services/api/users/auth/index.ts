import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import CustomError from "../../../../../utils/custom-response/custom-error";
import user_auth_bearer from "../../../../middlewares/bearer-token/user-auth-bearer";
import {
  signup,
  signup_otp,
  resend_signup_otp,
  create_user_profile,
  user_login,
  set_location,
  forgot_password,
  forgot_password_otp,
  resend_forgot_password_otp,
  change_password,
  delete_account,
  // logout,
} from "./handler";
import multer from "fastify-multer"; // or import multer from 'fastify-multer'
import { avatar_multipart } from "../../../../middlewares/multipart/avatar-multipart";
import user_bearer from "../../../../middlewares/bearer-token/user-bearer";
import user_forgot_password_otp_bearer from "../../../../middlewares/bearer-token/user-forgot-password-otp-bearer";
import user_forgot_password_bearer from "../../../../middlewares/bearer-token/user-forgot-password-bearer";
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
const user_auth = async (fastify: FastifyInstance) => {
  fastify.register(multer.contentParser);

  fastify.decorateRequest("user", null);
  fastify.decorateRequest("file", null);
  fastify.decorateRequest("files", null);

  //signup
  fastify.route({
    method: "POST",
    url: "/signup",
    schema: {
      // headers: authheaders,
      body: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
        required: ["email", "password"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            token: { type: "string" },
            message: { type: "string" },
            status: { type: "number" },
          },
          required: ["token", "message", "status"],
        },
        409: otherRes,
        500: otherRes,
      },
    },
    handler: signup,
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
  //signup-otp
  fastify.route({
    method: "POST",
    url: "/signup-otp",
    schema: {
      headers: authheaders,
      body: {
        type: "object",
        properties: {
          otp: { type: "number" },
        },
        required: ["otp"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                role: { type: "string" },
              },
              required: ["id", "email", "role"],
            },
            message: { type: "string" },
            status: { type: "number" },
          },
          required: ["data", "message", "status"],
        },
        409: otherRes,
        500: otherRes,
      },
    },
    handler: signup_otp,
    preValidation: user_auth_bearer,
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
  //resend-signup-otp
  fastify.route({
    method: "GET",
    url: "/resend-signup-otp",
    schema: {
      headers: authheaders,
      response: {
        200: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    handler: resend_signup_otp,
    preValidation: user_auth_bearer,
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
  // create-profile;
  fastify.route({
    method: "POST",
    url: "/create-profile",
    schema: {
      headers: authheaders,
      // body: {
      //   type: "object",
      //   properties: {
      //     first_name: { type: "string" },
      //     last_name: { type: "string" },
      //     phone: { type: "string" },
      //     gender: { type: "string" },
      //     age: { type: "number" },
      //     // You may include other properties as needed for the profile creation
      //     // avatar will be handled separately in preHandler
      //   },
      //   required: ["first_name", "last_name", "phone", "gender", "age"],
      // },
      response: {
        201: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                id: { type: "string" },
                first_name: { type: "string" },
                last_name: { type: "string" },
                phone: { type: "string" },
                gender: { type: "string" },
                age: { type: "number" },
              },
              required: [
                "id",
                "first_name",
                "last_name",
                "phone",
                "gender",
                "age",
              ],
            },
            message: { type: "string" },
            status: { type: "number" },
            token: { type: "string" },
          },
          required: ["data", "message", "status", "token"],
        },
        400: otherRes,
        404: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    preHandler: avatar_multipart.single("avatar"), // Handling file upload
    handler: create_user_profile,
    preValidation: user_auth_bearer,
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

  //login
  fastify.route({
    method: "POST",
    url: "/login",
    schema: {
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" },
          deviceType: { type: "string" },
          deviceToken: { type: "string" },
        },
        required: ["email", "password", "deviceType", "deviceToken"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                role: { type: "string" },
                userProfile: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    phone: { type: "string" },
                    age: { type: "number" },
                    gender: { type: "string" },
                    longitude: {
                      type: "number",
                    },
                    latitude: {
                      type: "number",
                    },
                    cuisineTypes: { type: "array" },
                    dietaryRestrictions: { type: "array" },
                    preferences: { type: "array" },
                    avatar: {
                      type: "object",
                      properties: {
                        url: { type: "string" },
                      },
                      required: ["url"],
                    },
                  },
                  required: [
                    "id",
                    "firstName",
                    "lastName",
                    "phone",
                    "age",
                    "gender",
                    "longitude",
                    "latitude",
                    "cuisineTypes",
                    "dietaryRestrictions",
                    "preferences",
                  ],
                },
              },
              required: ["id", "email", "role", "userProfile"],
            },
            message: { type: "string" },
            status: { type: "number" },
            token: { type: "string" },
          },
          required: ["data", "message", "status", "token"],
        },
        404: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                isProfileCompleted: { type: "boolean" },
                isSignedUp: { type: "boolean" },
              },
            },
            status: { type: "number" },
            message: { type: "string" },
            token: { type: "string" },
          },
          required: ["status", "message"],
        },
        401: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    handler: user_login,
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
  //update-location
  fastify.route({
    method: "PATCH",
    url: "/update-location",
    schema: {
      body: {
        type: "object",
        properties: {
          longitude: {
            type: "string",
          },
          latitude: {
            type: "string",
          },
        },
        required: ["longitude", "latitude"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                longitude: {
                  type: ["number", "string"],
                },
                latitude: {
                  type: ["number", "string"],
                },
              },
              // required: ["longitude", "latitude"],
            },
            message: { type: "string" },
            status: { type: "number" },
          },
          required: ["data", "message", "status"],
        },
        401: otherRes,
        404: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    handler: set_location,
    preValidation: user_bearer,
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

  //forgot-password
  fastify.route({
    method: "POST",
    url: "/forgot-password",
    schema: {
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
        },
        required: ["email"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "number" },
            message: { type: "string" },
            token: { type: "string" },
          },
          required: ["status", "message"],
        },
      },
    },
    handler: forgot_password,
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

  //forgot-password-otp
  fastify.route({
    method: "POST",
    url: "/forgot-password-otp",
    schema: {
      headers: authheaders,
      body: {
        type: "object",
        properties: {
          otp: { type: "number" },
        },
        required: ["otp"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            token: { type: "string" },
            message: { type: "string" },
            status: { type: "number" },
          },
          required: ["token", "message", "status"],
        },
        409: otherRes,
        500: otherRes,
      },
    },
    handler: forgot_password_otp,
    preValidation: user_forgot_password_bearer,
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
  //   //resend-signup-otp
  fastify.route({
    method: "GET",
    url: "/resend-forgot-password-otp",
    schema: {
      headers: authheaders,
      response: {
        200: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    handler: resend_forgot_password_otp,
    preValidation: user_forgot_password_bearer,
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

  //change-password
  fastify.route({
    method: "PATCH",
    url: "/change-password",
    schema: {
      headers: authheaders,
      body: {
        type: "object",
        properties: {
          password: { type: "string" },
        },
        required: ["password"],
      },
      response: {
        200: otherRes,
        404: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    handler: change_password,
    preValidation: user_forgot_password_otp_bearer,
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

  //delete-user
  fastify.route({
    method: "DELETE",
    url: "/delete-account",
    schema: {
      headers: authheaders,
      params: {
        id: { type: "string" },
      },
      response: {
        200: otherRes,
        404: otherRes,
        409: otherRes,
        500: otherRes,
      },
    },
    handler: delete_account,
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

  //Logout
  // fastify.route({
  //   method: "PATCH",
  //   url: "/logout",
  //   schema: {
  //     headers: authheaders,
  //     body: {
  //       type: "object",
  //       properties: {
  //         deviceToken: { type: "string" },
  //       },
  //       required: ["deviceToken"],
  //     },
  //     response: {
  //       200: otherRes,
  //       404: otherRes,
  //       409: otherRes,
  //       500: otherRes,
  //     },
  //   },
  //   handler: logout,
  //   preValidation: user_bearer,
  //   errorHandler: (
  //     error: FastifyError,
  //     req: FastifyRequest,
  //     reply: FastifyReply
  //   ) => {
  //     return reply
  //       .status(error.statusCode!)
  //       .send({ message: error.message, status: error.statusCode });
  //   },
  // });
};

export default user_auth;
