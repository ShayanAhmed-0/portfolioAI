import { prismaClient } from "../../../lib/db";
import redis from "../../../lib/redis";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";
import AuthService from "../Auth/auth-services";
import LocationService from "../Location/location-services";

export default class UserService {
  public static checkExistingPhone(phone: string) {
    return prismaClient.userProfile.findFirst({ where: { phone } });
  }

  public static async createUserProfile(
    auth_id: string,
    user_name:string,
    about:string,
    age:number,
    skills:string[],
    deviceToken:string,
    deviceType:string,
  ) {
    try {
      // Create user profile
      const userProfile = await prismaClient.userProfile.create({
        data: {
          auth_id,
          user_name,
          about,
          age,
          skills,
          deviceToken,
          deviceType,
      });
      const a = await AuthService.updateProfileCompleted(auth_id);
      console.log(a);
      return userProfile;
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }
  public static async getUserProfileById(id: string) {
    try {
      // Create user profile
      return prismaClient.userProfile.findUnique({
        where: { id, auth: { isDeleted: false } },
        select: {
          auth: { select: { id: true, email: true, isProfileCompleted: true } },
          avatar: { select: { id: true, name: true, url: true } },
          id: true,
          age: true,
          cuisineTypes: true,
          dietaryRestrictions: true,
          favourites: true,
          firstName: true,
          gender: true,
          lastName: true,
          latitude: true,
          longitude: true,
          // locationName:true,
          OrdersDetails: {
            include: {
              Reviews: true,
            },
          },
          phone: true,
          preferenceNote: true,
          preferences: true,
        },
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }

  public static async editUserProfile(
    id: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
    longitude?: number,
    latitude?: number,
    dietaryRestrictions?: string[],
    cuisineTypes?: string[]
  ) {
    try {
      if (typeof cuisineTypes === "string") {
        cuisineTypes = [cuisineTypes];
      }
      if (typeof dietaryRestrictions === "string") {
        dietaryRestrictions = [dietaryRestrictions];
      }
      const [dietaryRestrictionsConnect, cuisineTypesConnect] =
        await Promise.all([
          prismaClient.dietaryRestriction.findMany({
            where: {
              name: { in: dietaryRestrictions },
            },
            select: { id: true },
          }),
          prismaClient.cuisineType.findMany({
            where: {
              name: { in: cuisineTypes },
            },
            select: { id: true },
          }),
        ]);
      // let dietaryRestrictionsConnect: { id: string }[];
      // let cuisineTypesConnect: { id: string }[];
      // dietaryRestrictionsConnect = dietaryRestrictions?.map((id) => ({
      //   id,
      // }));

      // cuisineTypesConnect = cuisineTypes?.map((id) => ({ id }));

      const updateProfile = await prismaClient.userProfile.update({
        where: { id, auth: { isDeleted: false } },
        data: {
          firstName,
          lastName,
          phone,
          longitude,
          latitude,
          cuisineTypes: { set: cuisineTypesConnect },
          dietaryRestrictions: {
            set: dietaryRestrictionsConnect,
          },
        },
      });
      console.log(updateProfile);
      return updateProfile;
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }

  public static updateUserProfileAvatar(id: string, avatarId: string) {
    return prismaClient.userProfile.update({
      where: { id, auth: { isDeleted: false } },
      data: { avatar: { connect: { id: avatarId } } },
    });
  }

  public static async updateUserLocation(
    id: string,
    longitude: number,
    latitude: number
  ) {
    // await LocationService.createLocation(longitude, latitude, id);
    return prismaClient.userProfile.update({
      where: { id, auth: { isDeleted: false } },
      data: { longitude, latitude },
    });
  }
  public static async updateNotifications(
    id: string,
    allowNotifications: boolean
  ) {
    return prismaClient.userProfile.update({
      where: { id },
      data: { allowNotifications },
      select: {
        allowNotifications: true,
      },
    });
  }
}
