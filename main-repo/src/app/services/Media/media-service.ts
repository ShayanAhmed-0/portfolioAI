import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";

export default class MediaService {
  public static async createMedia(url: string, name: string) {
    return await prismaClient.media.create({
      data: { url, name },
    });
  }

  public static async createUserMedia(
    user_profile_id: string,
    url: string,
    name: string
  ) {
    await prismaClient.media.delete({
      where: { user_profile_id },
    });
    return await prismaClient.media.create({
      data: { url, name, user_profile_id },
    });
  }
}
