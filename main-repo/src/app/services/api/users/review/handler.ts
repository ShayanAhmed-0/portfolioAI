import { FastifyReply, FastifyRequest } from "fastify";
import redis from "../../../../../lib/redis";
import CustomError from "../../../../../utils/custom-response/custom-error";
import UserService from "../../../Users/user-service";
import { generateJWT } from "../../../../../utils/validation/token";
import { generateOTP } from "../../../../../utils/otp-generator";
import { sendEmail } from "../../../../../utils/send-email";
import { send_mail_template } from "../../../../../utils/email-templates";
import MediaService from "../../../Media/media-service";
import validatedEnv from "../../../../../config/environmentVariables";
import { gethashedPass } from "../../../../../utils/generate-hash";
import AuthService from "../../../Auth/auth-services";
// import ReviewService from "../../../Reviews/review-service";
// import NotificationService from "../../../Notification/notification-services";
import { title } from "process";
import DeviceService from "../../../Device/device-services";
import { fcm_notification } from "../../../../../utils/fcm-notifications";

// export const test = async(req: FastifyRequest, reply: FastifyReply)=>{
//    try {
//    return reply
//      .status(200)
//      .send({ data: {}, message: "test", stastus: 200 });
//  } catch (error) {
//    if (error instanceof CustomError) {
//      // Handle specific CustomError instances
//      return reply
//        .status(error.status)
//        .send({error, message: "An error occurred", status: 500 });
//    } else {
//      return reply
//        .status(500)
//        .send({error, message: "An error occurred", status: 500 });
//    }
//  }
// }

// export const give_review = async (req: FastifyRequest, reply: FastifyReply) => {
//   try {
//     // console.log(req.body);
//     const { profileId } = req.user as { profileId: string };
//     let { orderId, rating, review } = req.body as {
//       orderId: string;
//       rating: string | number;
//       review: string;
//     };
//     const { files } = req as { files: any };
//     let imgArray: { name: string; url: string }[] = [];
//     // console.log(files);
//     if (files) {
//       files.map((file: any) => {
//         // console.log(file);
//         const { fieldname, filename } = file;
//         if (!filename) throw new CustomError("Invalid File Upload", 400);
//         console.log(fieldname, filename);
//         const mediaUrl = `${validatedEnv.LIVE_URl}/public/uploads/reviews/${filename}`;
//         imgArray.push({ name: fieldname, url: mediaUrl });
//       });
//     }
//     if (typeof rating === "string") {
//       // rating = parseFloat(rating);
//       rating = parseInt(rating);
//     }
//     const createReview = await ReviewService.giveReview(
//       rating,
//       review,
//       orderId,
//       imgArray
//     );

//     const notificationData = {
//       title: `Got a new Review`,
//       description: `user posted a review for the orderId:${orderId}`,
//     };
//     const vendor = await DeviceService.getVendorDeviceToken(
//       createReview.ordersDetails.orders[0].dish!.category?.vendorProfileId!
//     );
//     await NotificationService.newNotification(
//       notificationData.title,
//       notificationData.description,
//       profileId,
//       vendor!.id
//     );
//     if (vendor?.activeEmployeeId) {
//       const employee = await DeviceService.getEmployeeDeviceToken(
//         vendor.activeEmployeeId!
//       );
//       if (employee?.device) {
//         const deviceTokens = employee.device.map(
//           (device: { deviceToken: string }) => device.deviceToken
//         );

//         if (employee.allowNotifications)
//           fcm_notification(deviceTokens, notificationData);
//       }
//     } else {
//       if (vendor?.device) {
//         const deviceTokens = vendor.device.map(
//           (device: { deviceToken: string }) => device.deviceToken
//         );

//         if (vendor.allowNotifications)
//           fcm_notification(deviceTokens, notificationData);
//       }
//     }

//     return reply
//       .status(200)
//       .send({ data: createReview, message: "Review Posted", status: 200 });
//   } catch (error: any) {
//     if (error instanceof CustomError) {
//       // Handle specific CustomError instances
//       return reply.status(error.status).send({
//         message: error.message,
//         status: error.status,
//       });
//     } else {
//       console.log(error);
//       return reply.status(500).send({
//         message: error.message,
//         status: 500,
//       });
//     }
//   }
// };
// export const my_reviews = async (req: FastifyRequest, reply: FastifyReply) => {
//   try {
//     // console.log(req.body);
//     const { profileId } = req.user as { profileId: string };
//     const myreview = await ReviewService.userReviews(profileId);
//     return reply
//       .status(200)
//       .send({ data: myreview, message: "Reviews Fetched", status: 200 });
//   } catch (error: any) {
//     if (error instanceof CustomError) {
//       // Handle specific CustomError instances
//       return reply.status(error.status).send({
//         message: error.message,
//         status: error.status,
//       });
//     } else {
//       console.log(error);
//       return reply.status(500).send({
//         message: error.message,
//         status: 500,
//       });
//     }
//   }
// };
