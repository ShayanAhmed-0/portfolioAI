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
        role: true,
        userProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            age: true,
            gender: true,
            cuisineTypes: true,
            dietaryRestrictions: true,
            preferences: true,
            latitude: true,
            longitude: true,
            avatar: { select: { url: true } },
            device: true,
          },
        },
      },
    });
  }
  public static getFullAuthByIdAndVendorProfile(id: string) {
    return prismaClient.auth.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        email: true,
        role: true,
        isProfileCompleted: true,
        vendorProfile: {
          select: {
            id: true,
            stripeAccount: true,
            isActive: true,
            isApproved: true,
            businessName: true,
            phone: true,
            locationName: true,
            latitude: true,
            longitude: true,
            currentId: true,
            bin: true,
            offeringServices: true,
            cuisineTypes: true,
            operationalTimes: true,
            media: {
              select: {
                id: true,
                name: true,
                url: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            device: true,
            employeeProfile: {
              select: {
                id: true,
                device: {
                  select: {
                    deviceToken: true,
                  },
                },
              },
            },
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
        role: true,
        userProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            age: true,
            gender: true,
            dietaryRestrictions: true,
            cuisineTypes: true,
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
        role,
        isDeleted: false,
      },
      include: { userProfile: true },
    });
  }
  public static checkExistingProfile(email: string) {
    return prismaClient.auth.findUnique({
      where: { email, isProfileCompleted: true, isDeleted: false },
    });
  }
  public static createUser(
    email: string,
    password: string,
    role: "USER" | "VENDOR"
  ) {
    console.log(role);
    const salt = generateSalt();
    const hashedPassword = gethashedPass(salt, password);
    return prismaClient.auth.create({
      data: { email, password: hashedPassword, role, salt },
      select: { id: true, email: true, role: true },
    });
  }
  public static updateProfileCompleted(id: string) {
    return prismaClient.auth.update({
      where: { id, isDeleted: false },
      data: { isProfileCompleted: true },
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
  public static vendorLogout(id: string, deviceToken: string) {
    return prismaClient.vendorProfile.update({
      where: { id, device: { some: { deviceToken } } },
      data: {
        device: {
          updateMany: {
            where: {
              vendorProfileId: id,
              deviceToken,
            },
            data: {
              isLoggedIn: false,
            },
          },
        },
      },
    });
  }
  public static userLogout(id: string, deviceToken: string) {
    return prismaClient.userProfile.update({
      where: { id, device: { some: { deviceToken } } },
      data: {
        device: {
          updateMany: {
            where: {
              userProfileId: id,
              deviceToken,
            },
            data: {
              isLoggedIn: false,
            },
          },
        },
      },
    });
  }
}
