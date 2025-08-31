import { FastifyReply, FastifyRequest } from "fastify";
import redis from "../../../../../lib/redis";
import UserService from "../../../Users/user-service";
import { generateJWT } from "../../../../../utils/validation/token";
import { generateOTP } from "../../../../../utils/otp-generator";
import { sendEmail } from "../../../../../utils/send-email";
import { send_mail_template } from "../../../../../utils/email-templates";
import MediaService from "../../../Media/media-service";
import validatedEnv from "../../../../../config/environmentVariables";
import { gethashedPass } from "../../../../../utils/generate-hash";
import AuthService from "../../../Auth/auth-services";
import DeviceService from "../../../Device/device-services";
import { kafkarun } from "../../../../../lib/kafka";
import CustomError from "../../../../../utils/custom-response/custom-error";
import LocationService from "../../../Location/location-services";
import { validateCreateUserProfile } from "../../../../../utils/validation/user/crete-user";
import GithubService, { Repo } from "../../../Github/github-services";
import { trace } from "potrace";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

interface GithubCallbackQuery {
  code: string;
}
export interface CreateUserProfileBody {
  username: string;
  firstName: string;
  lastName: string;
  professional_title: string;
  latitude: number;
  longitude: number;
  location_name: string;
  skills: string[];
  about: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string | null;
  }>; // Define this array of objects
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>; // Define this array of objects
  deviceType?: "ios" | "android";
  isVectorized:boolean | string
}
export const signup = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    // console.log(req.body.email);

    let { email, password } = req.body as { email: string; password: string };
    email = email.toLowerCase();

    const checkExistingUser = await AuthService.checkExistingUser(email);
    if (checkExistingUser) {
      if (checkExistingUser.is_profile_completed) {
        throw new CustomError("User already exist", 409);
      }
      if (!checkExistingUser.is_profile_completed) {
        throw new CustomError(
          "User already exist Login To Create Your Profile",
          409
        );
      }
    }
    const otp = generateOTP(6);
    const token = generateJWT(
      { email, password, otp },
      validatedEnv.USER_AUTH_JWT_SECRET
    );
    const data = send_mail_template("Resend OTP", email, otp);
    const emailOptions = {
      to: email,
      subject: data.subject,
      content: data.html,
      // attachments: [
      //   {
      //     filename: "attachment.txt",
      //     content: "This is the content of the attachment.",
      //   },
      // ],
      next: (error: any, info: any) => {
        if (error) {
          console.error("Email send failed:", error);
        } else {
          redis.setex(email, validatedEnv.REDIS_OTP_TIME, otp);
          console.log("Email sent successfully:", info);
        }
      },
    };
    sendEmail(emailOptions);
    return reply
      .status(200)
      .send({ token, message: "OTP sent to your email", status: 200 });
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

export const signup_otp = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { otp } = req.body as { otp: number };
    const checkUser = await AuthService.checkExistingUser(req.user.email);
    if (checkUser) {
      return reply.status(409).send({
        data: checkUser,
        message: "User already exist",
        status: 409,
      });
    }
    const keycheck = await redis.exists(req.user.email);
    if (!keycheck) throw new CustomError("OTP Expired", 400);
    const getotp: string = (await redis.get(req.user.email)) as string;
    if (otp !== parseInt(getotp)) throw new CustomError("invalid OTP", 400);

    const user = await AuthService.createUser(
      req.user.email,
      req.user.password
    );
    await UserService.createProfileOnly(user.id)
    return reply
      .status(200)
      .send({ data: user, message: "User Signedup Successfully", status: 200 });
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

export const resend_signup_otp = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { email } = req.user as { email: string };
    const otp = generateOTP(6);
    const data = send_mail_template("Resend OTP", email, otp);
    const emailOptions = {
      to: email,
      subject: data.subject,
      content: data.html,
      next: (error: any, info: any) => {
        if (error) {
          console.error("Email send failed:", error);
        } else {
          redis.setex(email, validatedEnv.REDIS_OTP_TIME, otp);
          console.log("Email sent successfully:", info);
        }
      },
    };
    sendEmail(emailOptions);
    return reply
      .status(200)
      .send({ message: "OTP Sent to your email", status: 200 });
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

export const create_user_profile = async (
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
        message: "Valdation Errors",
        data: validation.errors,
     });

    const { email } = req.user as { email: string; id: string };

    const { file } = req as unknown as { file: any };
    if (!file) {
      throw new CustomError("User Avatar is Required", 400);
    }
    let { filename } = file as unknown as { filename: any };
    if (!filename) {
      throw new CustomError("User Avatar is Required", 400);
    }
    const checkProfile = await AuthService.checkExistingProfile(email);
    if (!checkProfile) {
      throw new CustomError("User Does not Exist", 404);
    }
    if (checkProfile?.is_profile_completed) {
      throw new CustomError("Profile Already Exist Try Logging in", 409);
    }

    // const mediaUrl = `${validatedEnv.LIVE_URl}/public/uploads/avatar/${filename}`;

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
      isVectorized,
      gitUserId
      // deviceType,
    } = validation.data;

    const checkUserName = await AuthService.checkExistingUserName(username);
    if (checkUserName) {
      throw new CustomError("Username Already Exists", 409);
    }
    let mediaUrl = `/avatar/${filename}`;
    if(isVectorized){
      const vectorized = await MediaService.VectorizeAvatar(file,true)
      mediaUrl= vectorized.fileUrl
      filename= vectorized.filename
    }

    const createUserProfile = await UserService.createUserProfile(
      checkProfile.id,
      `${firstName} ${lastName}`,
      username,
      about,
      skills,
      professional_title,
      longitude,
      latitude,
      location_name,
      mediaUrl,
      filename,
      experience,
      education,
    );
    if (!createUserProfile)
      throw new CustomError("error creating profile", 400);
    // const mediaUrl = `${validatedEnv.SCHEME}${validatedEnv.HOST}:${validatedEnv.PORT}/avatar/${req.file.filename}`;
    // const { filename } = req.file as { filename: any };
    // const { file } = req as unknown as { file: any };

    // const media = await MediaService.createUserMedia(
    //   createUserProfile.id,
    //   mediaUrl,
    //   filename
    // );
    // const updateAvatar = await UserService.updateUserProfileAvatar(
    //   createUserProfile.id,
    //   media.id
    // );
    const fullUser = await AuthService.getFullAuthByIdAndUserProfile(
      checkProfile.id
    );
    const authId = fullUser!.id;
    const profileId = createUserProfile.id;
    const token = generateJWT(
      { email, profileId, authId },
      validatedEnv.USER_JWT_SECRET
    );
    // kafkarun(
    //   fullUser!.id,
    //   fullUser?.userProfile?.firstName!,
    //   "user",
    //   "new-user",
    //   fullUser?.userProfile?.avatar?.url!
    // );
    return reply.status(200).send({
      status: 200,
      message: "User Profile Created Successfully",
      data: fullUser,
      token,
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

export const user_login = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    let { email, password } = req.body as {
      email: string;
      password: string;
      // deviceType: string;
      // deviceToken: string;
    };
    email = email.toLowerCase();
    const Auth = await AuthService.getAuthByEmail(email);
    // if (!Auth) throw new CustomError("Email Not Found SignUp First", 404);
    if (!Auth) {
      return reply.status(404).send({
        data: { isSignedUp: false },
        status: 404,
        message: "Email Not Found SignUp First",
      });
    }
    
    const getHash = gethashedPass(Auth.salt, password);
    if (Auth.password !== getHash) {
      throw new CustomError("Invalid password", 401);
    }

    console.log(Auth.id);
    if (!Auth.is_profile_completed) {
      const profileId = Auth.id;
      const token = generateJWT(
        { email, profileId },
        validatedEnv.USER_AUTH_JWT_SECRET
      );
      return reply.status(404).send({
        token,
        data: { isProfileCompleted: Auth.is_profile_completed },
        status: 404,
        message: "Profile not Found Create Profile First",
      });
    }
    const fullUser = await AuthService.getFullAuthByIdAndUserProfile(Auth.id);
    if (!fullUser) {
      throw new CustomError("error getting full user", 401);
    }
    if (!fullUser.user_profile) {
      throw new CustomError("error getting full user", 401);
    }

    const profileId = fullUser.user_profile.id;
    const authId = fullUser.id;
    const token = generateJWT(
      { email, authId, profileId },
      validatedEnv.USER_JWT_SECRET
    );
    // const mydeviceToken = fullUser.user_profile.device.find(
    //   (d: any) => d.deviceToken === deviceToken
    // );
    // if (mydeviceToken) {
    //   if (!mydeviceToken.isLoggedIn)
    //     await DeviceService.newLogIn(mydeviceToken.id);
    // }
    // if (!mydeviceToken) {
    //   await DeviceService.updateUserDeviceToken(
    //     profileId,
    //     deviceToken,
    //     deviceType
    //   );
    // }
    // console.log(fullUser);
    return reply.status(200).send({
      token,
      status: 200,
      data: fullUser,
      message: "User Logged In Successfully",
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
export const check_username = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    let { user_name } = req.body as {
      user_name:string
    };
    const checkUserName = await AuthService.checkExistingUserName(user_name);
    let bool = checkUserName ? true : false;
    // const mydeviceToken = fullUser.user_profile.device.find(
    //   (d: any) => d.deviceToken === deviceToken
    // );
    // if (mydeviceToken) {
    //   if (!mydeviceToken.isLoggedIn)
    //     await DeviceService.newLogIn(mydeviceToken.id);
    // }
    // if (!mydeviceToken) {
    //   await DeviceService.updateUserDeviceToken(
    //     profileId,
    //     deviceToken,
    //     deviceType
    //   );
    // }
    // console.log(fullUser);
    return reply.status(200).send({
      status: 200,
      data: {
        user_name,
        exists: bool
      },
      message: "Username Checked Successfully",
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
export const set_location = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { profileId } = req.user as { profileId: string };
    const { longitude, latitude } = req.body as {
      longitude: string;
      latitude: string;
    };
    const updatedLocation = await UserService.updateUserLocation(
      profileId,
      parseFloat(longitude),
      parseFloat(latitude)
    );

    await LocationService.createLocation(
      parseFloat(longitude),
      parseFloat(latitude),
      profileId
    );
    return reply.status(200).send({
      status: 200,
      data: updatedLocation,
      message: "User Location Updated Successfully",
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

export const forgot_password = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { email } = req.body as { email: string };
    const checkExistingUser = await AuthService.checkExistingUser(
      email,
      "USER"
    );
    if (!checkExistingUser) throw new CustomError("User doesnot exist", 409);

    const otp = generateOTP(6);
    const token = generateJWT(
      { email, otp },
      validatedEnv.USER_FORGOT_PASS_JWT_SECRET
    );
    const data = send_mail_template("Forgot Password OTP", email, otp);
    const emailOptions = {
      to: email,
      subject: data.subject,
      content: data.html,
      // attachments: [
      //   {
      //     filename: "attachment.txt",
      //     content: "This is the content of the attachment.",
      //   },
      // ],
      next: (error: any, info: any) => {
        if (error) {
          console.error("Email send failed:", error);
        } else {
          redis.setex(`forgotPass-${email}`, validatedEnv.REDIS_OTP_TIME, otp);
          console.log("Email sent successfully:", info);
        }
      },
    };
    sendEmail(emailOptions);
    return reply
      .status(200)
      .send({ token, message: "OTP sent to your email", status: 200 });
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

export const forgot_password_otp = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { otp } = req.body as { otp: number };
    const keycheck = await redis.exists(`forgotPass-${req.user.email}`);
    if (!keycheck) throw new CustomError("OTP Expired", 400);
    const getotp: string = (await redis.get(
      `forgotPass-${req.user.email}`
    )) as string;
    if (otp !== parseInt(getotp)) throw new CustomError("invalid OTP", 400);

    await redis.del(`forgotPass-${req.user.email}`);
    const token = generateJWT(
      { email: req.user.email },
      validatedEnv.USER_FORGOT_PASS_OTP_JWT_SECRET
    );
    return reply
      .status(200)
      .send({ token, message: "OTP Verified", status: 200 });
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

export const resend_forgot_password_otp = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { email } = req.user as { email: string };
    const otp = generateOTP(6);
    const data = send_mail_template("Resend OTP", email, otp);
    const emailOptions = {
      to: email,
      subject: data.subject,
      content: data.html,
      next: (error: any, info: any) => {
        if (error) {
          console.error("Email send failed:", error);
        } else {
          redis.setex(
            `forgotPass-${req.user.email}`,
            validatedEnv.REDIS_OTP_TIME,
            otp
          );
          console.log("Email sent successfully:", info);
        }
      },
    };
    sendEmail(emailOptions);
    return reply
      .status(200)
      .send({ message: "OTP Sent to your email", status: 200 });
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

export const change_password = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { password } = req.body as {
      password: string;
    };
    const { email } = req.user as {
      email: string;
    };

    const Auth = await AuthService.checkExistingUser(email);
    if (!Auth) throw new CustomError("Email Not Found SignUp First", 404);

    const passwordChanged = await AuthService.changePassword(email, password);
    return reply.status(200).send({
      status: 200,
      message: "Password Changed Successfully",
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
export const delete_account = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = req.params as { id: string };
    const { authId } = req.user as { authId: string };
    if (id !== authId) throw new CustomError("UserId Mismatch", 400);
    const Auth = await AuthService.getAuthById(id);
    if (!Auth) throw new CustomError("User Not Found", 404);

    const deleteAccount = await AuthService.deleteAccount(id, Auth.email);
    return reply.status(200).send({
      status: 200,
      message: "Account Deleted Successfully",
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
export const github_login = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const redirectUrl = GithubService.generateRedirectUrl();
    console.log("asking redirect",redirectUrl)
    reply.redirect(redirectUrl);
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

export const github_callback = async (
  req: FastifyRequest<{ Querystring: GithubCallbackQuery }>,
  reply: FastifyReply
) => {
  try {
    const code = req.query.code;
    console.log("in callback",code)
    const getAccessToken = await GithubService.generateAccessToken(code);
    const getGithubDetails = await GithubService.InitilizeOctoKit(
      getAccessToken
    );
    if(!getGithubDetails){
      reply.redirect(`https://2qx8mml7-3001.asse.devtunnels.ms/`);
    }
    // Save the github details in a .txt file
    const getDetails = await AuthService.getUserByGitCode(getGithubDetails.user.id)
    console.log(getDetails)
    if(getDetails && getDetails.user_profile && getDetails.user_profile.id){
      const data=await GithubService.connectGitUserToProfile(getDetails.user_profile.id,getGithubDetails.user.id);
      if(getDetails.is_profile_completed){
        reply.redirect(`https://2qx8mml7-3001.asse.devtunnels.ms/dashboard/projects`);
      }else{
        reply.redirect(`https://2qx8mml7-3001.asse.devtunnels.ms/create-profile?gitUserId=${getGithubDetails.user.id}`);
      }
    }else{
      reply.redirect(`https://2qx8mml7-3001.asse.devtunnels.ms/create-profile?gitUserId=${getGithubDetails.user.id}`);
    }  
    // return reply.status(200).send({
    //   status: 200,
    //   getGithubDetails,
    //   message: "Github Details Fetced Successfully",
    // });
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
export const github_refetch = async (
  req: FastifyRequest<{ Querystring: GithubCallbackQuery }>,
  reply: FastifyReply
) => {
  try {
    const { authId, profileId } = req.user as {
      authId: string;
      profileId: string;
    };
    const redirectUrl = GithubService.generateRedirectUrl();
    const user = await AuthService.getFullAuthByIdAndUserProfile(authId)
    const gitUserId = user?.user_profile?.git_user?.id
    if(!gitUserId || !user?.user_profile?.id){
      throw new CustomError("Git Not Logged In",400)
    }
    console.log(gitUserId)
    const getAccessToken = await GithubService.generateAccessToken(gitUserId.toString());
    console.log(getAccessToken)
    const getGithubDetails = await GithubService.InitilizeOctoKit(
      getAccessToken
    );
    const data=await GithubService.connectGitUserToProfile(user?.user_profile?.id,gitUserId);
    // Save the github details in a .txt file
  
    return reply.status(200).send({
      status: 200,
      getGithubDetails,
      message: "Github Details Refetced Successfully",
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
export const save_github_data = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { email } = req.user as { email: string };
    const auth = await AuthService.getFullAuthByEmail(email);
    if(!auth?.user_profile?.id) throw new CustomError("User Profile Not Found", 404);
     const { github_user_id } = req.body as { github_user_id: number };
    const data=await GithubService.connectGitUserToProfile(auth?.user_profile?.id,github_user_id);
    return reply.status(200).send({
      status: 200,
      data,
      message: "Github Connected Successfully",
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
export const image_vectorizer = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { file } = req as unknown as { file: any };

    if (!file) {
      throw new CustomError("User Avatar is Required", 400);
    }
    const vectorized = await MediaService.VectorizeAvatar(file);
    reply.send({
      message: "Image vectorized successfully",
      url: vectorized.fileUrl,
    });
  } catch (error: any) {
    console.error("Vectorization error:", error);
    reply.status(error.statusCode || 500).send({
      error: error.message || "Internal Server Error",
    });
  }
};

export const image_cartoonizer = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { file } = req as unknown as { file: any };

    if (!file) {
      return reply.status(400).send({ error: "Image file is required" });
    }

    const inputPath = file.path;

    const cartoonDir = path.join(
      process.cwd(),
      "../",
      "public",
      "uploads",
      "cartoonized"
    );

    if (!fs.existsSync(cartoonDir)) {
      fs.mkdirSync(cartoonDir, { recursive: true });
    }

    const filename = `cartoon-${uuidv4()}.jpg`;
    const outputPath = path.join(cartoonDir, filename);
    // Cartoonize the image using Python + OpenCV
    const cartoonscriptDir = path.join(
      process.cwd(),
      "../",
      "python",
      "scripts",
      "catoonizer.py"
    );
    console.log(cartoonscriptDir);
    await AuthService.cartoonizeImage(inputPath, outputPath, cartoonscriptDir);

    const fileUrl = `/public/cartoonized/${filename}`;
    reply.send({
      message: "Image cartoonized successfully",
      url: fileUrl,
    });
  } catch (error: any) {
    console.error("Cartoonization error:", error);
    reply.status(500).send({
      error: "Failed to cartoonize image",
      detail: error.toString(),
    });
  }
};
export const save_userpage = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { profileId } = req.user as { profileId: string };
    const { userpage } = req.body as { userpage: string };
    const updateUserPage = await AuthService.updateUserPage(profileId, userpage);
    return reply.status(200).send({
      status: 200,
      data: updateUserPage,
      message: "User Page Updated Successfully",
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
// export const logout = async (req: FastifyRequest, reply: FastifyReply) => {
//   try {
//     const { deviceToken } = req.body as {
//       deviceToken: string;
//     };
//     const { profileId } = req.user as {
//       profileId: string;
//     };

//     const logout = await AuthService.userLogout(profileId, deviceToken);
//     if (!logout) throw new CustomError("device to logout not found", 404);

//     // const passwordChanged = await AuthService.changePassword(email, password);
//     return reply.status(200).send({
//       status: 200,
//       message: "Logged Out Successfully",
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
