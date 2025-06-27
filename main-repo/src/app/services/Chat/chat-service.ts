import { PrismaClient } from "@prisma/client";
import CustomError from "../../../utils/custom-response/custom-error";
import { Server as SocketIOServer } from "socket.io";

const prisma = new PrismaClient();

class ChatService {
  private static io: SocketIOServer;

  public static initializeSocket(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private static setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join_chat', (chatId: string) => {
        socket.join(chatId);
      });

      socket.on('leave_chat', (chatId: string) => {
        socket.leave(chatId);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  public static async createChat(participantIds: string[]) {
    try {
      // First, try to find an existing chat with the same participants
      const existingChat = await prisma.chat.findFirst({
        where: {
          participants: {
            every: {
              id: {
                in: participantIds
              }
            }
          }
        },
        include: {
          participants: {
            select:{
              avatar:true,
              full_name:true,
              user_name:true
            }
          }
        }
      });

      // If chat exists, return it; otherwise create a new one
      if (existingChat) {
        return existingChat;
      }

      const chat = await prisma.chat.create({
        data: {
          participants: {
            connect: participantIds.map(id => ({ id }))
          }
        },
        include: {
          participants: true
        }
      });
      return chat;
    } catch (error) {
      throw new CustomError("Failed to create chat", 400);
    }
  }

  public static async sendMessage(chatId: string, senderId: string, content: string, mediaArray: { url: string; name: string }[]) {
    try {
      const message = await prisma.message.create({
        data: {
          content,
          chat_id: chatId,
          sender_id: senderId,
        },
        include: {
          sender: {
            select: {
              full_name: true,
              avatar: true
            }
          }
        }
      });

      // Create media entries if any
      if (mediaArray && mediaArray.length > 0) {
        await prisma.media.createMany({
          data: mediaArray.map(media => ({
            url: media.url,
            name: media.name,
            chat_id: chatId
          }))
        });
      }

      // Emit the message to all users in the chat
      this.io.to(chatId).emit('new_message', message);

      return message;
    } catch (error) {
      throw new CustomError("Failed to send message", 400);
    }
  }

  public static async getChatMessages(chatId: string, page: number = 1, limit: number = 50) {
    try {
      const messages = await prisma.message.findMany({
        where: {
          chat_id: chatId
        },
        include: {
          sender: {
            select: {
              full_name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      });

      return messages;
    } catch (error) {
      throw new CustomError("Failed to fetch messages", 400);
    }
  }

  public static async getUserChats(userId: string) {
    try {
      const chats = await prisma.chat.findMany({
        where: {
          participants: {
            some: {
              id: userId
            }
          }
        },
        include: {
          participants: {
            select: {
              id: true,
              full_name: true,
              avatar: true
            }
          },
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      return chats;
    } catch (error) {
      throw new CustomError("Failed to fetch user chats", 400);
    }
  }
}

export default ChatService; 