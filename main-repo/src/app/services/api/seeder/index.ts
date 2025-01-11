// import {
//   FastifyError,
//   FastifyInstance,
//   FastifyReply,
//   FastifyRequest,
// } from "fastify";
// import multer from "fastify-multer"; // or import multer from 'fastify-multer'
// import CustomError from "../../../../utils/custom-response/custom-error";
// import { prismaClient } from "../../../../lib/db";

// // import formBody from "fastify-formbody";

// const seeder = async (fastify: FastifyInstance) => {
//   fastify.route({
//     method: "DELETE",
//     url: "/delete-all",
//     schema: {},
//     handler: killer,
//     // preValidation: user_bearer,
//     errorHandler: (
//       error: FastifyError,
//       req: FastifyRequest,
//       reply: FastifyReply
//     ) => {
//       return reply
//         .status(error.statusCode!)
//         .send({ message: error.message, status: error.statusCode });
//     },
//   });
// };

// export const killer = async (req: FastifyRequest, reply: FastifyReply) => {
//   try {
//     await prismaClient.vendorProfile.deleteMany(); // Delete vendor profiles first
//     await prismaClient.userProfile.deleteMany();
//     await prismaClient.auth.deleteMany(); // Now delete auth records

//     // Delete data from other tables
//     await prismaClient.cuisineType.deleteMany();
//     await prismaClient.dietaryRestriction.deleteMany();
//     await prismaClient.preference.deleteMany();
//     await prismaClient.category.deleteMany();
//     await prismaClient.dish.deleteMany();
//     await prismaClient.operationalTime.deleteMany();
//     await prismaClient.media.deleteMany();
//     return reply.status(200).send({ message: "DB Destroyed", status: 200 });
//   } catch (error: any) {
//     if (error instanceof CustomError) {
//       // Handle specific CustomError instances
//       return reply.status(error.status).send({
//         message: error.message,
//         status: error.status,
//       });
//     } else {
//       console.log(error);
//       return reply.status(500).send({
//         message: error.message,
//         status: 500,
//       });
//     }
//   }
// };

// export default seeder;
