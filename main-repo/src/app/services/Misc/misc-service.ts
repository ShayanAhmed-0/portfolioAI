import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";

export default class MiscService {
  public static async getLocs() {
    const cuisineTypes = await prismaClient.cuisineType.findMany();
    const dietaryRestrictions =
      await prismaClient.dietaryRestriction.findMany();
    const preferences = await prismaClient.preference.findMany();
    console.log(preferences);
    return { cuisineTypes, dietaryRestrictions, preferences };
  }
  public static getTax() {
    return prismaClient.locs.findFirst({ select: { tax: true } });
  }
}
