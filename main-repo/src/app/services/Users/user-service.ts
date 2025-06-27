import { prismaClient } from "../../../lib/db";
import redis from "../../../lib/redis";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";
import AuthService from "../Auth/auth-services";
import LocationService from "../Location/location-services";
import { UserStatus } from "@prisma/client";

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
      await LocationService.createLocation(longitude, latitude, auth_id);
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
  public static async updateStatus(
    id: string,
    status: UserStatus
  ) {
    return prismaClient.userProfile.update({
      where: { id, auth: { isDeleted: false } },
      data: { status },
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

  public static async updateUserProfile(
    profileId: string,
    full_name?: string,
    user_name?: string,
    about?: string,
    skills?: string[],
    professional_title?: string,
    longitude?: number,
    latitude?: number,
    location_name?: string,
    experience?: {
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      description?: string | null;
    }[],
    education?: {
      institution: string;
      degree: string;
      startDate: string;
      endDate: string;
    }[],
    mediaUrl?: string,
    filename?: string
  ) {
    try {
      // Get existing profile to preserve unchanged values
      const existingProfile = await prismaClient.userProfile.findUnique({
        where: { id: profileId },
        include: {
          skills: {
            include: { skill: true }
          },
          experience: true,
          education: true,
          avatar: true
        }
      });

      if (!existingProfile) {
        throw new Error("Profile not found");
      }

      // Prepare update data with only provided values
      const updateData: any = {};

      if (full_name !== undefined) updateData.full_name = full_name;
      if (user_name !== undefined) updateData.user_name = user_name;
      if (about !== undefined) updateData.about = about;
      if (professional_title !== undefined) updateData.professional_title = professional_title;
      if (location_name !== undefined) updateData.location_name = location_name;

      // Handle avatar update if provided
      if (mediaUrl && filename) {
        updateData.avatar = {
          upsert: {
            create: {
              name: filename,
              url: mediaUrl,
            },
            update: {
              name: filename,
              url: mediaUrl,
            },
          },
        };
      }

      // Handle skills update if provided
      if (skills && skills.length > 0) {
        // Delete existing skills
        await prismaClient.userSkill.deleteMany({
          where: { user_id: profileId }
        });
        
        // Create new skills
        updateData.skills = {
          create: skills.map((skillId) => ({
            skill: {
              connect: { id: skillId },
            },
          })),
        };
      }

      // Handle experience update if provided
      if (experience && experience.length > 0) {
        // Delete existing experience
        await prismaClient.experience.deleteMany({
          where: { user_profile_id: profileId }
        });
        
        // Create new experience
        updateData.experience = {
          create: experience.map((exp) => ({
            company: exp.company,
            position: exp.position,
            start_date: exp.startDate,
            end_date: exp.endDate,
            description: exp.description ?? null,
          })),
        };
      }

      // Handle education update if provided
      if (education && education.length > 0) {
        // Delete existing education
        await prismaClient.education.deleteMany({
          where: { user_profile_id: profileId }
        });
        
        // Create new education
        updateData.education = {
          create: education.map((edu) => ({
            institution: edu.institution,
            degree: edu.degree,
            start_date: edu.startDate,
            end_date: edu.endDate,
          })),
        };
      }

      // Handle location update if provided
      if (longitude !== undefined && latitude !== undefined) {
        updateData.longitude = longitude;
        updateData.latitude = latitude;
        
        // Update location in Redis geolocation
        try {
          await LocationService.createLocation(longitude, latitude, existingProfile.auth_id);
        } catch (error) {
          console.error("Error updating location in Redis:", error);
          // Don't throw error here to avoid failing the entire update
        }
      }

      // Update the profile
      const updatedProfile = await prismaClient.userProfile.update({
        where: { id: profileId },
        data: updateData,
        include: {
          avatar: true,
          skills: {
            include: { skill: true }
          },
          experience: true,
          education: true,
          auth: {
            select: { id: true, email: true, is_profile_completed: true }
          }
        }
      });

      return updatedProfile;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  public static async searchUsersBySkills(skillIds: string[]) {
    try {
      const users = await prismaClient.userProfile.findMany({
        where: {
          skills: {
            some: {
              skill_id: {
                in: skillIds
              }
            }
          },
          auth: {
            isDeleted: false
          },
          status: "public"
        },
        include: {
          avatar: true,
          skills: {
            include: { skill: true }
          },
          experience: true,
          education: true,
          auth: {
            select: { id: true, email: true, is_profile_completed: true }
          }
        }
      });
      return users;
    } catch (error) {
      console.error("Error searching users by skills:", error);
      throw error;
    }
  }

  public static async searchUsersByUsername(username: string) {
    try {
      const users = await prismaClient.userProfile.findMany({
        where: {
          user_name: {
            contains: username,
            mode: 'insensitive'
          },
          auth: {
            isDeleted: false
          },
          status: "public"
        },
        include: {
          avatar: true,
          skills: {
            include: { skill: true }
          },
          experience: true,
          education: true,
          auth: {
            select: { id: true, email: true, is_profile_completed: true }
          }
        }
      });
      return users;
    } catch (error) {
      console.error("Error searching users by username:", error);
      throw error;
    }
  }

  public static async searchUsersByLocation(
    longitude: number,
    latitude: number,
    radius: number = 50 // Default 50km radius
  ) {
    try {
      // Get user IDs within radius from Redis
      const nearbyLocations = await LocationService.getLocationsWithinRadius(
        longitude,
        latitude,
        radius
      );

      if (!nearbyLocations || nearbyLocations.length === 0) {
        return [];
      }

      // Extract auth IDs from Redis response
      // Redis returns array of [name, distance, coordinates] where name is the auth_id
      const nearbyAuthIds = nearbyLocations.map((location: any) => location[0]);

      // Get user profiles for the nearby auth IDs
      const users = await prismaClient.userProfile.findMany({
        where: {
          auth_id: {
            in: nearbyAuthIds
          },
          auth: {
            isDeleted: false
          },
          status: "public"
        },
        include: {
          avatar: true,
          skills: {
            include: { skill: true }
          },
          experience: true,
          education: true,
          auth: {
            select: { id: true, email: true, is_profile_completed: true }
          }
        }
      });

      return users;
    } catch (error) {
      console.error("Error searching users by location:", error);
      throw error;
    }
  }

  public static async searchUsers(
    skills?: string[],
    username?: string,
    longitude?: number,
    latitude?: number,
    radius?: number
  ) {
    try {
      let users: any[] = [];

      // Search by skills
      if (skills && skills.length > 0) {
        const skillUsers = await this.searchUsersBySkills(skills);
        users = skillUsers;
      }

      // Search by username
      if (username) {
        const usernameUsers = await this.searchUsersByUsername(username);
        if (users.length > 0) {
          // Intersect with existing results
          const usernameUserIds = new Set(usernameUsers.map(u => u.id));
          users = users.filter(u => usernameUserIds.has(u.id));
        } else {
          users = usernameUsers;
        }
      }

      // Search by location
      if (longitude !== undefined && latitude !== undefined) {
        const locationUsers = await this.searchUsersByLocation(longitude, latitude, radius);
        if (users.length > 0) {
          // Intersect with existing results
          const locationUserIds = new Set(locationUsers.map(u => u.id));
          users = users.filter(u => locationUserIds.has(u.id));
        } else {
          users = locationUsers;
        }
      }

      // Remove duplicates
      const uniqueUsers = users.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );

      return uniqueUsers;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }
}
