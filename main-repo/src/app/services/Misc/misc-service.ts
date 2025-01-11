import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";

export default class MiscService {
  public static async getLocs() {
    const skills = await prismaClient.skills.findMany();
    return { skills };
  }
}
