import { FastifyReply, FastifyRequest } from "fastify";
import MiscService from "../../Misc/misc-service";
import CustomError from "../../../../utils/custom-response/custom-error";
import { validateGiveReview } from "../../../../utils/validation/user/reviews";
import ReviewService from "../../Reviews/review-service";

export const create_review=async(req: FastifyRequest,
  reply: FastifyReply)=>
  {
    try {
      const user = req.user;
      // const { profileId } = req.params as { profileId: string };
      const {errors,success,data} = validateGiveReview(req.body);
      if(errors){
        return reply.code(400).send({ error: errors });
      }


      // Check if user has already reviewed this profile
      const existingReview = await ReviewService.createReview(user.id,data.profileId,data.review,data.rating)


      if (existingReview) {
        return reply.code(400).send({ error: "You have already reviewed this profile" });
      }

    
      return reply.status(200).send({
        data:{review:existingReview},
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
      const user = req.user;
      const { profileId } = req.params as { profileId: string };
      const { self = false, page = 1, limit = 10 } = req.query as { self?: boolean; page?: number; limit?: number };

      let reviews;
      if (self) {
        // Get reviews written by the user
        reviews = await ReviewService.getUserReviews(user.id, page, limit);
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