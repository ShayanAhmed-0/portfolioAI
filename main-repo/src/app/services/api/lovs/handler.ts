import { FastifyReply, FastifyRequest } from "fastify";
import MiscService from "../../Misc/misc-service";
import CustomError from "../../../../utils/custom-response/custom-error";

export const getlovs = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const lovs = await MiscService.getLocs();
      return reply.status(200).send({
        data:{lovs},
        status: 200,
        message: "Account Deleted Successfully",
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