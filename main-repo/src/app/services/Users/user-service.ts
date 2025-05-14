import { prismaClient } from "../../../lib/db";
import redis from "../../../lib/redis";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";
import AuthService from "../Auth/auth-services";
import LocationService from "../Location/location-services";

export default class UserService {
  // public static checkExistingPhone(phone: string) {
  //   return prismaClient.userProfile.findUnique({
  //     where:{
  //        phone
  //     }
  //   })
  // }

  public static async createUserProfile(
    auth_id: string,
    full_name: string,
    user_name: string,
    about: string,
    skills: string[],
    professional_title: string,
    longitude: number,
    latitude: number,
    location_name: string,
    experience: {
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      description?: string | null;
    }[],
    education: {
      institution: string;
      degree: string;
      startDate: string;
      endDate: string;
    }[],
    mediaUrl: string,
    filename: string
  ) {
    try {
      const userProfile = await prismaClient.userProfile.create({
        data: {
          auth_id,
          user_name,
          professional_title,
          longitude,
          latitude,
          location_name,
          full_name,
          about,
          avatar: {
            create: {
              name: filename,
              url: mediaUrl,
            },
          },
          skills: {
            create: skills.map((id) => ({
              skill: {
                connect: { id },
              },
            })),
          },
          experience: {
            create: experience.map((exp) => ({
              company: exp.company,
              position: exp.position,
              start_date: exp.startDate,
              end_date: exp.endDate,
              description: exp.description ?? null,
            })),
          },
          education: {
            create: education.map((edu) => ({
              institution: edu.institution,
              degree: edu.degree,
              start_date: edu.startDate,
              end_date: edu.endDate,
            })),
          },
        },
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
          auth: {
            select: { id: true, email: true, is_profile_completed: true },
          },
          avatar: { select: { id: true, name: true, url: true } },
          id: true,
          // age: true,
          // gender: true,
          latitude: true,
          longitude: true,
          // phone: true,
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
      data: { allow_notifications: allowNotifications },
      select: {
        allow_notifications: true,
      },
    });
  }
}
