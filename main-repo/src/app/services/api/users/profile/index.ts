import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import multer from "fastify-multer"; // or import multer from 'fastify-multer'
import user_auth_bearer from "../../../../middlewares/bearer-token/user-auth-bearer";
// import { handle_multipart } from "../../../../middlewares/multipart/handle-multipart";
import { avatar_multipart } from "../../../../middlewares/multipart/avatar-multipart";
import user_bearer from "../../../../middlewares/bearer-token/user-bearer";
import CustomError from "../../../../../utils/custom-response/custom-error";
import {  change_repo_visibility, change_status, get_others_profile, get_profile, update_user_profile } from "./handler";
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
const user_profile = async (fastify: FastifyInstance) => {
  fastify.route({
    method: "GET",
    url: "/get-profile",
    schema: {
      headers: authheaders,
    },
    handler: get_profile,
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
    url: "/change-status",
    schema: {
      headers: authheaders,
      response: {
        // 200: {
        //   type: "object",
        //   properties: {
        //     data: {
        //       type: "object",
        //       properties: {
        //         id: { type: "string" },
        //         email: { type: "string" },
        //         role: { type: "string" },
        //         userProfile: {
        //           type: "object",
        //           properties: {
        //             id: { type: "string" },
        //             firstName: { type: "string" },
        //             lastName: { type: "string" },
        //             phone: { type: "string" },
        //             age: { type: "number" },
        //             gender: { type: "string" },
        //             longitude: { type: "number" },
        //             latitude: { type: "number" },
        //             cuisineTypes: { type: "array" },
        //             dietaryRestrictions: { type: "array" },
        //             preferences: { type: "array" },
        //             avatar: {
        //               type: "object",
        //               properties: {
        //                 url: { type: "string" },
        //               },
        //               required: ["url"],
        //             },
        //           },
        //           required: [
        //             "id",
        //             "firstName",
        //             "lastName",
        //             "phone",
        //             "age",
        //             "gender",
        //             "longitude",
        //             "latitude",
        //             "cuisineTypes",
        //             "dietaryRestrictions",
        //             "preferences",
        //           ],
        //         },
        //       },
        //       required: ["id", "email", "role", "userProfile"],
        //     },
        //     message: { type: "string" },
        //     status: { type: "number" },
        //   },
        //   required: ["data", "message", "status"],
        // },
        // 400: otherRes,
        // 409: otherRes,
        // 500: otherRes,
      },
    },
    handler: change_status,
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
    url: "/update",
    schema: {
      headers: authheaders,
    
    },
    preHandler: avatar_multipart.single("avatar"),
    handler: update_user_profile,
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
    url: "/get-others-profile/:username",
    schema: {
      // headers: authheaders,
    },
    handler: get_others_profile,
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
  fastify.route({
    method: "POST",
    url: "/change-repo-visibility",
    schema: {
      headers: authheaders,
      response: {
        // 200: {
        //   type: "object",
        //   properties: {
        //     data: {
        //       type: "object",
        //       properties: {
        //         id: { type: "string" },
        //         email: { type: "string" },
        //         role: { type: "string" },
        //         userProfile: {
        //           type: "object",
        //           properties: {
        //             id: { type: "string" },
        //             firstName: { type: "string" },
        //             lastName: { type: "string" },
        //             phone: { type: "string" },
        //             age: { type: "number" },
        //             gender: { type: "string" },
        //             longitude: { type: "number" },
        //             latitude: { type: "number" },
        //             cuisineTypes: { type: "array" },
        //             dietaryRestrictions: { type: "array" },
        //             preferences: { type: "array" },
        //             avatar: {
        //               type: "object",
        //               properties: {
        //                 url: { type: "string" },
        //               },
        //               required: ["url"],
        //             },
        //           },
        //           required: [
        //             "id",
        //             "firstName",
        //             "lastName",
        //             "phone",
        //             "age",
        //             "gender",
        //             "longitude",
        //             "latitude",
        //             "cuisineTypes",
        //             "dietaryRestrictions",
        //             "preferences",
        //           ],
        //         },
        //       },
        //       required: ["id", "email", "role", "userProfile"],
        //     },
        //     message: { type: "string" },
        //     status: { type: "number" },
        //   },
        //   required: ["data", "message", "status"],
        // },
        // 400: otherRes,
        // 409: otherRes,
        // 500: otherRes,
      },
    },
    handler: change_repo_visibility,
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

  // create-profile;
  // fastify.route({
  //   method: "PATCH",
  //   url: "/edit-profile",
  //   schema: {
  //     headers: authheaders,
  //     // response: {
  //     //   // 201: {
  //     //   //   type: "object",
  //     //   //   properties: {
  //     //   //     data: {
  //     //   //       type: "object",
  //     //   //       properties: {
  //     //   //         id: { type: "string" },
  //     //   //         first_name: { type: "string" },
  //     //   //         last_name: { type: "string" },
  //     //   //         phone: { type: "string" },
  //     //   //         gender: { type: "string" },
  //     //   //         age: { type: "number" },
  //     //   //       },
  //     //   //       required: [
  //     //   //         "id",
  //     //   //         "first_name",
  //     //   //         "last_name",
  //     //   //         "phone",
  //     //   //         "gender",
  //     //   //         "age",
  //     //   //       ],
  //     //   //     },
  //     //   //     message: { type: "string" },
  //     //   //     status: { type: "number" },
  //     //   //     token: { type: "string" },
  //     //   //   },
  //     //   //   required: ["data", "message", "status", "token"],
  //     //   // },
  //     //   400: otherRes,
  //     //   404: otherRes,
  //     //   409: otherRes,
  //     //   500: otherRes,
  //     // },
  //   },
  //   preHandler: avatar_multipart.single("avatar"), // Handling file upload
  //   preValidation: user_bearer,
  //   handler: edit_user_profile,
  //   errorHandler: (
  //     error: FastifyError,
  //     req: FastifyRequest,
  //     reply: FastifyReply
  //   ) => {
  //     console.log(error);
  //     return reply
  //       .status(error.statusCode!)
  //       .send({ message: error.message, status: error.statusCode });
  //   },
  // });
};

export default user_profile;
