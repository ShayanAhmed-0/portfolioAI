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
      req.user.password,
    );
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

    const validation = validateCreateUserProfile(req.body);
    console.log(validation);
    if (validation.errors)
      return reply.status(200).send({
        status: 400,
        message: "Valdation Errors",
        data: validation.errors,
      });
    // console.log(req);
    const {
      username,
      about,
      age,
      phone,
      gender,
      skills,
    } = req.body as {
      username:string
about:string
age:number|string
phone: number|string
gender: "Male" | "Female" | "Other",
skills:string[]
    };

    const { email, id } = req.user as { email: string; id: string };

    const { file } = req as unknown as { file: any };
    if (!file) {
      throw new CustomError("User Avatar is Required", 400);
    }
    const { filename } = file as unknown as { filename: any };
    if (!filename) {
      throw new CustomError("User Avatar is Required", 400);
    }
    const checkProfile = await AuthService.checkExistingProfile(email);
    if (checkProfile) {
      throw new CustomError("Profile Already Exist Try Logging in", 409);
    }
    const checkPhone = await UserService.checkExistingPhone(phone.toString());
    if (checkProfile) {
      throw new CustomError("Profile Already Exist Try Logging in", 409);
    }

    const ExistingUser = await AuthService.checkExistingUser(email);
    if (!ExistingUser) {
      throw new CustomError("User Does not Exist", 404);
    }

    const mediaUrl = `${validatedEnv.LIVE_URl}/public/uploads/avatar/${filename}`;

    const createUserProfile = await UserService.createUserProfile(
      id,
      username,
      about,
      parseInt(age.toString()),
      phone.toString(),
      gender,
      skills,
    );
    if (!createUserProfile)
      throw new CustomError("invalid cuisineTypes or dietaryRestrictions", 400);
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
      ExistingUser.id
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
    let { email, password, deviceType, deviceToken } = req.body as {
      email: string;
      password: string;
      deviceType: string;
      deviceToken: string;
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
    const getHash = gethashedPass(Auth.salt, password);
    if (Auth.password !== getHash) {
      throw new CustomError("Invalid password", 401);
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
    const mydeviceToken = fullUser.user_profile.device.find(
      (d: any) => d.deviceToken === deviceToken
    );
    if (mydeviceToken) {
      if (!mydeviceToken.isLoggedIn)
        await DeviceService.newLogIn(mydeviceToken.id);
    }
    if (!mydeviceToken) {
      await DeviceService.updateUserDeviceToken(
        profileId,
        deviceToken,
        deviceType
      );
    }
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
export const set_location = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { profileId } = req.user as { profileId: string };
    const { longitude, latitude } = req.body as {
      longitude: string;
      latitude:  string;
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
