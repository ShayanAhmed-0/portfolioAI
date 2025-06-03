import sharp from "sharp";
import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";
import { trace } from "potrace";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

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
  public static async VectorizeAvatar(file: any) {
    const inputPath = file.path;

    const buffer = await sharp(inputPath)
      .resize(1024)
      .grayscale()
      .toFormat("png") // Ensure compatibility
      .toBuffer();

    // Wrap Potrace trace in a Promise
    const svg: string = await new Promise((resolve, reject) => {
      trace(buffer, { threshold: 128 }, (err, svg) => {
        // Cleanup uploaded file
        fs.unlink(inputPath, () => {}); // Non-blocking deletion

        if (err) {
          return reject(err);
        }
        resolve(svg);
      });
    });
    const outputDir = path.join(
      process.cwd(),
      "../public/uploads",
      "vectorized"
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filename = `vector-${uuidv4()}.svg`;
    const outputPath = path.join(outputDir, filename);

    // Save SVG to disk
    fs.writeFileSync(outputPath, svg);
    const fileUrl = `/vectorized/${filename}`;
    return { filename, outputPath, fileUrl };
  }
}
