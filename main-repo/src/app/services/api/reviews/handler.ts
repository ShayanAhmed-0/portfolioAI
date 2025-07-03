import { FastifyReply, FastifyRequest } from "fastify";
import MiscService from "../../Misc/misc-service";
import CustomError from "../../../../utils/custom-response/custom-error";
import { validateGiveReview } from "../../../../utils/validation/user/reviews";
import ReviewService from "../../Reviews/review-service";

export const create_review=async(req: FastifyRequest,
  reply: FastifyReply)=>
  {
    try {
      const {profileId} = req.user;
      const {errors,success,data} = validateGiveReview(req.body);
      if(errors){
        return reply.code(400).send({ error: errors });
      }
      const existingReview = await ReviewService.findExisting(profileId,data.profileId)

      if (existingReview) {
        throw new CustomError("You have already reviewed this profile", 400);
      }

      // Check if user has already reviewed this profile
      const Review = await ReviewService.createReview(profileId,data.profileId,data.review,data.rating)

    
      return reply.status(200).send({
        data:{review:Review},
        status: 200,
        message: "Review Created Successfully",
      });
    } catch (error: any) {
      if (error instanceof CustomError) {
        // Handle specific CustomError instances
        return reply.status(error.status).send({
          message: error.message,
          status: error.status,
        });
      } else {
        console.log(error);
        return reply.status(500).send({
          message: error.message,
          status: 500,
        });
      }
    }
  }
export const get_reviews = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // const user = req.user;
      const { profileId } = req.params as { profileId: string };
      const { self = false, page = 1, limit = 10 } = req.query as { self?: boolean|string; page?: number; limit?: number };

      let reviews;
      if (self) {
        reviews = await ReviewService.getUserReviews(profileId);
      } else {
        // Get reviews for a specific profile
        reviews = await ReviewService.getProfileReviews(profileId);
      }

      return reply.status(200).send({
        data: reviews,
        status: 200,
        message: "Reviews fetched successfully"
      });
    } catch (error: any) {
      if (error instanceof CustomError) {
        // Handle specific CustomError instances
        return reply.status(error.status).send({
          message: error.message,
          status: error.status,
        });
      } else {
        console.log(error);
        return reply.status(500).send({
          message: error.message,
          status: 500,
        });
      }
    }
};