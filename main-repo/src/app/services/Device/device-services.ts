import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";

export default class DeviceService {
  public static getUserDeviceToken(id: string) {
    return prismaClient.userProfile.findUnique({
      where: { id },
      select: {
        allow_notifications: true,
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
}
