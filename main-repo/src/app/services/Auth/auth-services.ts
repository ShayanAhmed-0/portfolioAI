import { exec } from "child_process";
import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";
import fs from "fs";
import path from "path";
export default class AuthService {
  public static updateUserPage(profileId: string, userpage: string) {
    return prismaClient.userProfile.update({
      where: { id: profileId },
      data: { userpage },
    });
  }
  public static getFullAuthByIdAndUserProfile(id: string) {
    // return prismaClient.auth.findUnique({
    //   where: { id, isDeleted: false },
    //   include:{
    //     user_profile:{
    //       include:{
    //         avatar:true,
    //         education:true,
    //         experience:true,
    //         git_user:true,
    //         repos:true,
    //         reviews:true,
    //         skills:{
    //           include:{
    //             skill:true
    //           }
    //         }
    //       }
    //     }
    //   },
    // });
    return prismaClient.auth.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        email: true,
        is_profile_completed: true,
        createdAt: true,
        updatedAt: true,
        user_profile: {
          include: {
            avatar: true,
            education: true,
            experience: true,
            git_user: {
              include:{
                repos:true
              }
            },
            reviews: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });
  }
  public static async getOthersProfile(username: string) {
    // return prismaClient.auth.findUnique({
    //   where: { id, isDeleted: false },
    //   include:{
    //     user_profile:{
    //       include:{
    //         avatar:true,
    //         education:true,
    //         experience:true,
    //         git_user:true,
    //         repos:true,
    //         reviews:true,
    //         skills:{
    //           include:{
    //             skill:true
    //           }
    //         }
    //       }
    //     }
    //   },
    // });
    username=username.toLowerCase()
    const user= await prismaClient.auth.findFirst({
      where: { user_profile: { user_name: username }, isDeleted: false },
      select: {
        id: true,
        email: true,
        is_profile_completed: true,
        createdAt: true,
        updatedAt: true,
        user_profile: {
          include: {
            avatar: true,
            education: true,
            experience: true,
            git_user: {
              select:{
                url:true,
                html_url:true,
                repos:{
                  where:{
                    status: "public"
                  }
                }
              }
            },
            reviews: true,
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });
    if (user?.user_profile?.id) {
      await prismaClient.userProfile.update({
        where: {
          id: user.user_profile.id,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    }

    return user
  }

  public static getFullAuthByEmail(email: string) {
    return prismaClient.auth.findUnique({
      where: { email, isDeleted: false },
      select: {
        id: true,
        email: true,
        user_profile: {
          select: {
            id: true,
            avatar: { select: { url: true } },
          },
        },
      },
    });
  }
  public static getAuthByEmail(email: string) {
    return prismaClient.auth.findUnique({
      where: { email, isDeleted: false },
    });
  }
  public static getAuthById(id: string) {
    return prismaClient.auth.findUnique({
      where: { id, isDeleted: false },
    });
  }

  public static checkExistingUser(email: string, role?: "USER" | "VENDOR") {
    return prismaClient.auth.findUnique({
      where: {
        email,
        isDeleted: false,
      },
      include: { user_profile: true },
    });
  }
  public static checkExistingUserName(user_name: string) {
    user_name=user_name.toLowerCase()
    return prismaClient.userProfile.findUnique({
      where: {
        user_name,
      },
    });
  }
  public static checkExistingProfile(email: string) {
    return prismaClient.auth.findUnique({
      where: { email },
    });
  }
  public static createUser(email: string, password: string) {
    const salt = generateSalt();
    const hashedPassword = gethashedPass(salt, password);
    return prismaClient.auth.create({
      data: { email, password: hashedPassword, salt },
      select: { id: true, email: true },
    });
  }
  public static updateProfileCompleted(id: string) {
    return prismaClient.auth.update({
      where: { id, isDeleted: false },
      data: { is_profile_completed: true },
    });
  }

  public static updatePassword(id: string, password: string) {
    return prismaClient.auth.update({
      where: { id, isDeleted: false },
      data: { password },
    });
  }
  public static changePassword(email: string, password: string) {
    const salt = generateSalt();
    const hashedPassword = gethashedPass(salt, password);
    return prismaClient.auth.update({
      where: { email, isDeleted: false },
      data: { password: hashedPassword, salt },
      select: { id: true, email: true },
    });
  }
  public static deleteAccount(id: string, email: string) {
    return prismaClient.auth.update({
      where: { id, isDeleted: false },
      data: {
        email: `${email}-${Date.now()}-deleted`,
        isDeleted: true,
      },
    });
  }
  // public static userLogout(id: string, deviceToken: string) {
  //   return prismaClient.userProfile.update({
  //     where: { id, device: { some: { deviceToken } } },
  //     data: {
  //       device: {
  //         updateMany: {
  //           where: {
  //             userProfileId: id,
  //             deviceToken,
  //           },
  //           data: {
  //             isLoggedIn: false,
  //           },
  //         },
  //       },
  //     },
  //   });
  // }

  public static cartoonizeImage = (
    inputPath: string,
    outputPath: string,
    scriptPath: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      exec(
        `python "${scriptPath}" "${inputPath}" "${outputPath}"`,
        (err, stdout, stderr) => {
          if (stdout) console.log("Python stdout:", stdout); // 👈 log Python output
          if (stderr) console.error("Python stderr:", stderr); // 👈 log Python errors

          fs.unlink(inputPath, () => {});

          if (err) return reject(stderr);
          resolve(outputPath);
        }
      );
    });
  };

  public static async getUserByGitCode(code:number){
    const a =await prismaClient.auth.findFirst({
      where:{
        user_profile:{
          git_user:{
            id:code
          }
        }
      },
      select:{
        is_profile_completed:true,
        user_profile:true
      }
    })
    console.log(a)
    return a
  }
}
