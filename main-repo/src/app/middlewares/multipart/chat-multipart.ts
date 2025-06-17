import { FastifyRequest } from "fastify";
import { File } from "fastify-multer/lib/interfaces";
import multer from "fastify-multer";
import path from "path";
import { v4 } from "uuid";

const directory = path.join(
  __dirname + "../../../../../../" + "public/uploads/chat-media"
);

const diskStorage = multer.diskStorage({
  destination: directory,
  filename: (
    req: FastifyRequest,
    file: File,
    callback: (error: Error | null, filename: string) => void
  ) => {
    const fileName = file.originalname.split(" ").join("-");
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
    // const fileName = v4() + path.extname(file.originalname);
    const uploadName = baseName + "_" + Date.now() + extension;
    console.log(uploadName);
    return callback(null, uploadName);
  },
});
// C:\Users\shayan.ahmed\Desktop\backend\street_eats\main-repo\uploads
export const chat_multipart = multer({
  storage: diskStorage,
  limits: {
    fileSize: 1024 * 1024 * 1000,
  },
  fileFilter: (
    req: FastifyRequest,
    file: File,
    callback: (error: Error | null, acceptFile: boolean) => void
  ) => {
    console.log("chat_multipart-file");
    console.log(file);
    // const FileTypes = /jpeg|jpg|png|gif|jfif|mp4|mov|avi|3gp|pdf|hevc/;
    const FileTypes =
      /jpeg|jpg|png|gif|jfif|mp4|mov|avi|3gp|pdf|hevcpdf|hevc|application|octet-stream/;
    const mimeType = FileTypes.test(file.mimetype);
    const extname = FileTypes.test(
      path.extname(file.originalname.toLowerCase())
    );
    const isQuickTime = file.mimetype === "video/quicktime";
    if ((mimeType || isQuickTime) && extname) {
      return callback(null, true);
    }
    console.log("error");
    return callback(new Error("File type not supported"), false);
  },
});
