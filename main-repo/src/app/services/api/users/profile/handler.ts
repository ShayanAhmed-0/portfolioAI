import { FastifyReply, FastifyRequest } from "fastify";
import CustomError from "../../../../../utils/custom-response/custom-error";
import AuthService from "../../../Auth/auth-services";
import UserService from "../../../Users/user-service";
import validatedEnv from "../../../../../config/environmentVariables";
import MediaService from "../../../Media/media-service";

// export const get_miscs = async (req: FastifyRequest, reply: FastifyReply) => {
//   try {
//     return reply
//       .status(200)
//       .send({ data:{}, message: "list of Contents", status: 200 });
//   } catch (error) {
//     if (error instanceof CustomError) {
//       // Handle specific CustomError instances
//       return reply
//         .status(error.status)
//         .send({error, message: "An error occurred", status: 500 });
//     } else {
//       return reply
//         .status(500)
//         .send({error, message: "An error occurred", status: 500 });
//     }
//   }
// };

export const get_profile = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { authId, profileId } = req.user as {
      authId: string;
      profileId: string;
    };

    console.log("profileId");
    console.log(profileId);
    console.log("authId");
    console.log(authId);

    const profile = await AuthService.getFullAuthByIdAndUserProfile(authId);
    return reply
      .status(200)
      .send({ data: profile, message: "User Profile", status: 200 });
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

// export const edit_user_profile = async (
//   req: FastifyRequest,
//   reply: FastifyReply
// ) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       phone,
//       longitude,
//       latitude,
//       dietaryRestrictions,
//       cuisineTypes,
//     } = req.body as {
//       firstName?: string;
//       lastName?: string;
//       phone?: string;
//       longitude?: string;
//       latitude?: string;
//       dietaryRestrictions?: string[];
//       cuisineTypes?: string[];
//     };

//     console.log(req.user);

//     const { email, authId, profileId } = req.user as {
//       email: string;
//       authId: string;
//       profileId: string;
//     };
//     const { file } = req as unknown as { file: any };
//     console.log(file);
//     if (file) {
//       const { filename, fieldname } = file as unknown as {
//         filename: any;
//         fieldname: any;
//       };
//       if (fieldname) {
//         const mediaUrl = `${validatedEnv.LIVE_URl}/public/uploads/avatar/${filename}`;
//         const media = await MediaService.createUserMedia(
//           profileId,
//           mediaUrl,
//           fieldname
//         );
//       }
//     }
//     const updatedProfile = await UserService.editUserProfile(
//       profileId,
//       firstName,
//       lastName,
//       phone,
//       parseFloat(longitude!),
//       parseFloat(latitude!),
//       dietaryRestrictions,
//       cuisineTypes
//     );
//     return reply
//       .status(200)
//       .send({ data: updatedProfile, message: "Profile Updated", status: 200 });
//   } catch (error: any) {
//     if (error instanceof CustomError) {
//       console.log(error);
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
