import { prismaClient } from "../../../lib/db";
import redis from "../../../lib/redis";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";
import AuthService from "../Auth/auth-services";
import LocationService from "../Location/location-services";

export default class UserService {
  public static checkExistingPhone(phone: string) {
    return prismaClient.userProfile.findUnique({
      where:{
         phone
      }
    })
  }

  public static async createUserProfile(
    auth_id: string,
    user_name:string,
    about:string,
    age:number,
    phone:string,
    gender: "Male" | "Female" | "Other",
    skills:string[],
  ) {
    try {
      // Create user profile
      const userProfile = await prismaClient.userProfile.create({
        data: {
          auth_id,
          phone,
          gender,
          user_name,
          about,
          age,
          skills: {
            connect: skills.map((id) => ({ id })),
          },
        }
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
          auth: { select: { id: true, email: true, is_profile_completed: true } },
          avatar: { select: { id: true, name: true, url: true } },
          id: true,
          age: true,
          gender: true,
          latitude: true,
          longitude: true,
          phone: true,
        },
      });
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
