import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";

export default class MediaService {
  public static async createMedia(url: string, name: string) {
    return await prismaClient.media.create({
      data: { url, name },
    });
  }
  public static async vendorAvatarMedia(id: string) {
    return await prismaClient.media.findFirst({
      where: { vendorProfileId: id, name: "avatar" },
    });
  }
  public static async vendorBusinessLicenseMedia(id: string) {
    return await prismaClient.media.findFirst({
      where: { vendorProfileId: id, name: "businessLicense" },
    });
  }
  public static async vendorInsuranceMedia(id: string) {
    return await prismaClient.media.findFirst({
      where: { vendorProfileId: id, name: "insurance" },
    });
  }
  public static async connectVendorInsurance(id: string, url: string) {
    return await prismaClient.media.update({
      where: { id, name: "insurance" },
      data: { url },
    });
  }
  public static async connectVendorBusinessLicense(id: string, url: string) {
    return await prismaClient.media.update({
      where: { id, name: "businessLicense" },
      data: { url },
    });
  }
  public static async vendorMedia(id: string) {
    return await prismaClient.media.findMany({
      where: { vendorProfileId: id },
    });
  }

  public static async createUserMedia(
    userProfileId: string,
    url: string,
    name: string
  ) {
    await prismaClient.media.delete({
      where: { userProfileId },
    });
    return await prismaClient.media.create({
      data: { url, name, userProfileId },
    });
  }
  public static async createDishMedia(
    dishId: string,
    url: string,
    name: string
  ) {
    // await prismaClient.media.delete({
    //   where: { userProfileId },
    // });
    return await prismaClient.media.create({
      data: { url, name, dishId },
    });
  }
  public static async createCategoryMedia(
    categoryId: string,
    url: string,
    name: string
  ) {
    await prismaClient.media.delete({
      where: { categoryId },
    });
    return prismaClient.media.create({
      data: { url, name, categoryId },
    });
  }
  public static async createEmployeeMedia(
    employeeProfileId: string,
    url: string,
    name: string
  ) {
    await prismaClient.media.delete({
      where: { employeeProfileId },
    });
    return await prismaClient.media.create({
      data: { url, name, employeeProfileId },
    });
  }

  public static async createVendorMedia(
    url: string,
    name: string,
    vendorProfileId?: string
  ) {
    return await prismaClient.media.create({
      data: { name, url, vendorProfileId },
    });
  }
  public static async connectVendor(id: string, vendorProfileId?: string) {
    return await prismaClient.media.update({
      where: { id },
      data: { vendorProfileId },
    });
  }
}
