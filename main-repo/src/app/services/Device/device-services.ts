import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";

export default class DeviceService {
  public static getUserDeviceToken(id: string) {
    return prismaClient.userProfile.findUnique({
      where: { id },
      select: {
        allowNotifications: true,
        device: { where: { isLoggedIn: true } },
      },
    });
  }
  public static newLogIn(id: string) {
    return prismaClient.device.update({
      where: { id, isLoggedIn: false },
      data: {
        isLoggedIn: true,
      },
    });
  }
  public static updateUserDeviceToken(
    id: string,
    deviceToken: string,
    deviceType: string
  ) {
    return prismaClient.userProfile.update({
      where: { id },
      data: {
        device: {
          create: {
            deviceToken,
            deviceType,
          },
        },
      },
    });
  }
  public static getEmployeeDeviceToken(id: string) {
    return prismaClient.employeeProfile.findUnique({
      where: { id },
      select: {
        allowNotifications: true,
        device: {
          where: {
            isLoggedIn: true,
          },
        },
      },
    });
  }
  public static updateEmployeeDeviceToken(
    id: string,
    deviceToken: string,
    deviceType: string
  ) {
    return prismaClient.employeeProfile.update({
      where: { id },
      data: {
        device: {
          create: {
            deviceToken,
            deviceType,
          },
        },
      },
    });
  }
  public static getVendorDeviceToken(id: string) {
    return prismaClient.vendorProfile.findUnique({
      where: { id },
      select: {
        id: true,
        allowNotifications: true,
        device: { where: { isLoggedIn: true } },
        activeEmployeeId: true,
      },
    });
  }
  public static updateVendorDeviceToken(
    id: string,
    deviceToken: string,
    deviceType: string
  ) {
    return prismaClient.vendorProfile.update({
      where: { id },
      data: {
        device: {
          create: {
            isLoggedIn: true,
            deviceToken,
            deviceType,
          },
        },
      },
    });
  }

  public static async removeEmployeeDeviceToken(
    employeeProfileId: string,
    deviceToken: string
  ) {
    try {
      return prismaClient.employeeProfile.update({
        where: { id: employeeProfileId },
        data: {
          device: {
            deleteMany: {
              deviceToken,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }
}
