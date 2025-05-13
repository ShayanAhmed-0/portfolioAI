import { exec } from "child_process";
import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";
import fs from 'fs';
import path from "path";
export default class AuthService {
  public static getFullAuthByIdAndUserProfile(id: string) {
    return prismaClient.auth.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        email: true,
        user_profile: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            avatar: { select: { url: true } },
            device: true,
          },
        },
      },
    });
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
  public static checkExistingUserName(user_name:string) {
    return prismaClient.userProfile.findUnique({
      where: {
        user_name,
      }
    });
  }
  public static checkExistingProfile(email: string) {
    return prismaClient.auth.findUnique({
      where: { email },
    });
  }
  public static createUser(
    email: string,
    password: string,
  ) {
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
          if (stdout) console.log('Python stdout:', stdout);   // 👈 log Python output
          if (stderr) console.error('Python stderr:', stderr); // 👈 log Python errors
  
          fs.unlink(inputPath, () => {});
  
          if (err) return reject(stderr);
          resolve(outputPath);
        }
      );
    });
  };
}
