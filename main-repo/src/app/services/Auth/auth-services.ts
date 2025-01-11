import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";

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
            phone: true,
            age: true,
            gender: true,
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
            phone: true,
            age: true,
            gender: true,
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
  public static checkExistingProfile(email: string) {
    return prismaClient.auth.findUnique({
      where: { email, is_profile_completed: true, isDeleted: false },
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
}
