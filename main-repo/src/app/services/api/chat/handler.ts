import { FastifyReply, FastifyRequest } from "fastify";
import ChatService from "../../Chat/chat-service";
import CustomError from "../../../../utils/custom-response/custom-error";
import MediaService from "../../Media/media-service";

export const createChat = async (req: FastifyRequest,
    reply: FastifyReply) => {
    try {
      const { participantIds } = req.body as { participantIds: string[] };
      const chat = await ChatService.createChat(participantIds);
      return reply.status(200).send({
        data:{chat},
        status: 200,
        message: "chat room created successfully",
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

export const sendMessage = async (req: FastifyRequest,
    reply: FastifyReply) => {
    try {
      const { chatId, content } = req.body as { chatId: string, content: string };
      const { profileId } = req.user as { profileId: string };
      // const files = (req as any).files as any[];
      
      // let mediaArray: { url: string; name: string }[] = [];

      // if (files && files.length > 0) {
      //   mediaArray = files.map(file => ({
      //     url: `/chat-media/${file.filename}`,
      //     name: file.filename
      //   }));
      // }
    
      // const senderId = req.user.id;
      const message = await ChatService.sendMessage(
        chatId, 
        profileId, 
        content, 
        // mediaArray
      );
// console.log((ChatService as any).io);
      // Emit the message to all users in the chat room via socket
      if ((ChatService as any).io) {
        // Log all socket IDs in the room before emitting
        const room = (ChatService as any).io.sockets.adapter.rooms.get(chatId);
        if (room) {
          const socketIds = Array.from(room);
          console.log(`Emitting 'new_message' to chat ${chatId} sockets:`, socketIds);
        } else {
          console.log(`No sockets found in chat room ${chatId} when emitting 'new_message'`);
        }
        (ChatService as any).io.to(chatId).emit('new_message', message);
        console.log(`Emitted new_message to chat ${chatId}`);
      }

      return reply.status(200).send({
        data: { message },
        status: 200,
        message: "message sent successfully",
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

export const getChatMessages = async (req: FastifyRequest,
    reply: FastifyReply) => {
    try {
      const { chatId } = req.params as { chatId: string };
      const messages = await ChatService.getChatMessages(
        chatId,
        1,
        50
      );
      return reply.status(200).send({
        data:{messages},
        status: 200,
        message: "message fetched successfully",
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

export const getUserChats = async (req: FastifyRequest,
    reply: FastifyReply) => {
    try {
      const {profileId} = req.user; // Assuming you have user info in request
      console.log(profileId)
      const chats = await ChatService.getUserChats(profileId);
      return reply.status(200).send({
        data:{chats},
        status: 200,
        message: "chat rooms fetched successfully",
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
  