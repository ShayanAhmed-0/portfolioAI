import { FastifyReply, FastifyRequest } from "fastify";
import redis from "../../../../../lib/redis";
import CustomError from "../../../../../utils/custom-response/custom-error";
import UserService from "../../../Users/user-service";
import { generateJWT } from "../../../../../utils/validation/token";
import { generateOTP } from "../../../../../utils/otp-generator";
import { sendEmail } from "../../../../../utils/send-email";
import { send_mail_template } from "../../../../../utils/email-templates";
import MediaService from "../../../Media/media-service";
import validatedEnv from "../../../../../config/environmentVariables";
import { gethashedPass } from "../../../../../utils/generate-hash";
import AuthService from "../../../Auth/auth-services";
// import CardService from "../../../Cards/card-service";

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

export const change_password = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    console.log(req.user.authId);
    const { password, newPassword } = req.body as {
      password: string;
      newPassword: string;
    };
    const auth = await AuthService.getAuthById(req.user.authId);
    if (!auth) throw new CustomError("Auth not Found", 404);
    const checkHash = gethashedPass(auth.salt, password);
    if (checkHash !== auth.password)
      throw new CustomError("Password is Incorrect", 400);
    const newHash = gethashedPass(auth.salt, newPassword);
    if (checkHash === newHash)
      throw new CustomError("Old and New password are same", 400);
    const updatePassword = await AuthService.updatePassword(
      req.user.authId,
      newHash
    );
    return reply.status(200).send({ message: "Password Updated", status: 200 });
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

export const allowNotifications = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { allowNotifications } = req.body as {
      allowNotifications: boolean;
    };

    const { authId, profileId } = req.user as {
      authId: string;
      profileId: string;
    };
    const updatedProfile = await UserService.updateNotifications(
      profileId,
      allowNotifications
    );
    return reply.status(200).send({
      data: { notifications: updatedProfile.allow_notifications },
      message: `notifications set to ${updatedProfile.allow_notifications}`,
      status: 200,
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

export const deleteAccount = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params as {
      id: string;
    };

    const { authId, profileId } = req.user as {
      authId: string;
      profileId: string;
    };
    if (authId !== id) {
      console.log("Invalid Id", 404);
    }
    const getAccount = await AuthService.getFullAuthByIdAndUserProfile(id);
    const updatedProfile = await AuthService.deleteAccount(
      id,
      getAccount?.email!
    );

    return reply.status(200).send({
      message: "account deleted",
      status: 200,
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
