import { FastifyReply, FastifyRequest } from "fastify";
import CustomError from "../../../../utils/custom-response/custom-error";
import UserService from "../../Users/user-service";
import { PrismaClient } from "@prisma/client";
// import CardService from "../../../Cards/card-service";

const prismaClient = new PrismaClient();

// export const test = async(req: FastifyRequest, reply: FastifyReply)=>{
//    try {
//    return reply
//      .status(200)
//      .send({ data: {}, message: "test", status: 200 });
//  } catch (error) {
//    if (error instanceof CustomError) {
//      // Handle specific CustomError instances
//      return reply
//        .status(error.status)
//        .send({error, message: "An error occurred", status: 500 });
//    } else {
//      return reply
//        .status(500)
//        .send({error, message: "An error occurred", status: 500 });
//    }
//  }
// }

export const search_portfolios = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { skills, username, longitude, latitude, radius } = req.query as {
      skills?: string;
      username?: string;
      longitude?: string;
      latitude?: string;
      radius?: string;
    };

    // Parse skills array if provided - now handling skill IDs directly
    let skillIds: string[] | undefined;
    if (skills) {
      skillIds = skills.split(',').map(s => s.trim());
    }
    
    // Parse coordinates if provided
    const parsedLongitude = longitude ? parseFloat(longitude) : undefined;
    const parsedLatitude = latitude ? parseFloat(latitude) : undefined;
    const parsedRadius = radius ? parseFloat(radius) : undefined;

    // Validate that if coordinates are provided, both longitude and latitude are required
    if ((parsedLongitude !== undefined && parsedLatitude === undefined) || 
        (parsedLatitude !== undefined && parsedLongitude === undefined)) {
      throw new CustomError("Both longitude and latitude are required for location search", 400);
    }

    // Perform search
    const searchResults = await UserService.searchUsers(
      skillIds,
      username,
      parsedLongitude,
      parsedLatitude,
      parsedRadius
    );

    return reply.status(200).send({
      status: 200,
      message: "Search completed successfully",
      data: {
        users: searchResults,
        count: searchResults.length
      }
    });
  } catch (error: any) {
    if (error instanceof CustomError) {
      // Handle specific CustomError instances
      return reply.status(error.status).send({
        message: error.message,
        status: error.status,
      });
    } else {
      console.log(error);
      return reply.status(500).send({
        message: error.message,
        status: 500,
      });
    }
  }
};

// export const myCards = async (req: FastifyRequest, reply: FastifyReply) => {
//   try {
//     const { authId, profileId } = req.vendor as {
//       authId: string;
//       profileId: string;
//     };

//     const myCards = await CardService.getUserCards(profileId);

//     return reply.status(200).send({
//       data: myCards,
//       message: "Cards fetched",
//       status: 200,
//     });
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
// export const addCard = async (req: FastifyRequest, reply: FastifyReply) => {
//   try {
//     const { authId, profileId } = req.vendor as {
//       authId: string;
//       profileId: string;
//     };
//     const { cardNumber, name, expiryDate, CVV } = req.body as {
//       cardNumber: string;
//       name: string;
//       expiryDate: string;
//       CVV: string;
//     };

//     // const addedCard = await CardService.addUserCards(
//     //   profileId,
//     //   cardNumber,
//     //   name,
//     //   expiryDate,
//     //   CVV
//     // );

//     return reply.status(200).send({
//       // data: addedCard,
//       message: "Card added",
//       status: 200,
//     });
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
