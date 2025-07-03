import { FastifyReply, FastifyRequest } from "fastify";
import CustomError from "../../../../../utils/custom-response/custom-error";
import AuthService from "../../../Auth/auth-services";
import UserService from "../../../Users/user-service";
import validatedEnv from "../../../../../config/environmentVariables";
import MediaService from "../../../Media/media-service";
import { validateCreateUserProfile } from "../../../../../utils/validation/user/crete-user";
import { CreateUserProfileBody } from "../auth/handler";
import GithubService from "../../../Github/github-services";
import { UserStatus } from "@prisma/client";

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
export const get_others_profile = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    // const { authId, profileId } = req.user as {
    //   authId: string;
    //   profileId: string;
    // };
const {username} = req.params as {username:string};

    const profile = await AuthService.getOthersProfile(username);
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
export const change_status = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { authId, profileId } = req.user as {
      authId: string;
      profileId: string;
    };

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


export const update_user_profile = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const body = req.body as CreateUserProfileBody;
    const parsedBody = {
      ...body,
      latitude: parseFloat(body.latitude.toString()), // Ensure latitude is parsed as a float
      longitude: parseFloat(body.longitude.toString()), // Ensure longitude is parsed as a float
      experience: Array.isArray(body.experience)
        ? body.experience
        : JSON.parse(body.experience), // Ensure experience is an array
      education: Array.isArray(body.education)
        ? body.education
        : JSON.parse(body.education), // Ensure education is an array
      isVectorized: body.isVectorized && body.isVectorized==="true"?true:false
    };
    const validation = validateCreateUserProfile(parsedBody);
    console.log(validation);
    if (validation.errors)
      return reply.status(200).send({
        status: 400,
        message: "Validation Errors",
        data: validation.errors,
      });

    const { authId, profileId } = req.user as { authId: string; profileId: string };

    const { file } = req as unknown as { file: any };
    let mediaUrl = null;
    let filename = null;
    
   

    const {
      username,
      firstName,
      lastName,
      professional_title,
      latitude,
      longitude,
      location_name,
      about,
      skills,
      experience,
      education,
      deviceToken,
      isVectorized
    } = validation.data;

    // Check if username is being changed and if it already exists
    const existingProfile = await AuthService.getFullAuthByIdAndUserProfile(authId);
    if (!existingProfile || !existingProfile.user_profile) {
      throw new CustomError("Profile not found", 404);
    }
    
    if (existingProfile.user_profile.user_name !== username) {
    
      const checkUserName = await AuthService.checkExistingUserName(username);
      if (checkUserName) {
        console.log(checkUserName)
        throw new CustomError("Username Already Exists", 409);
      }
    }

     if (file) {
      let { filename: fileFilename } = file as unknown as { filename: any };
      if (!fileFilename) {
        filename=existingProfile.user_profile.avatar?.name
        mediaUrl=existingProfile.user_profile.avatar?.url
      }else{
        filename = fileFilename;
        mediaUrl = `/avatar/${filename}`;
        
        if(parsedBody.isVectorized){
          const vectorized = await MediaService.VectorizeAvatar(file)
          mediaUrl = vectorized.fileUrl
          filename = vectorized.filename
        }
      }
    }else{
      filename=existingProfile.user_profile.avatar?.name
        mediaUrl=existingProfile.user_profile.avatar?.url
    }
    // Prepare update data with only provided values
    const updateData: any = {};
    if (firstName && lastName) updateData.full_name = `${firstName} ${lastName}`;
    if (username) updateData.user_name = username;
    if (about) updateData.about = about;
    if (skills) updateData.skills = skills;
    if (professional_title) updateData.professional_title = professional_title;
    if (longitude) updateData.longitude = longitude;
    if (latitude) updateData.latitude = latitude;
    if (location_name) updateData.location_name = location_name;
    if (experience) updateData.experience = experience;
    if (education) updateData.education = education;
    if (mediaUrl) updateData.mediaUrl = mediaUrl;
    if (filename) updateData.filename = filename;

    const updateUserProfile = await UserService.updateUserProfile(
      profileId,
      updateData.full_name,
      updateData.user_name,
      updateData.about,
      updateData.skills,
      updateData.professional_title,
      updateData.longitude,
      updateData.latitude,
      updateData.location_name,
      updateData.experience,
      updateData.education,
      updateData.mediaUrl,
      updateData.filename
    );
    
    if (!updateUserProfile)
      throw new CustomError("error updating profile", 400);
 


    const fullUser = await AuthService.getFullAuthByIdAndUserProfile(authId);
    if (!fullUser) {
      throw new CustomError("error getting updated user", 400);
    }

    return reply.status(200).send({
      status: 200,
      message: "User Profile Updated Successfully",
      data: fullUser,
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

export const change_repo_visibility = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { authId, profileId } = req.user as { authId: string; profileId: string };
    const {repoId,status} = req.body as {repoId:string,status:UserStatus};
    // const repo = await RepoService.getRepoById(repoId);
    // if(!repo) throw new CustomError("Repo not found",404);
    const updatedRepo = await GithubService.updateRepoVisibility(profileId,repoId,status);
    return reply.status(200).send({
      status: 200,
      updatedRepo,
      message: "Repo Visibility Updated Successfully"
    });
  } catch (error: any) {
      if (error instanceof CustomError) {
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
