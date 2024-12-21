import { FastifyInstance } from "fastify";
import { Server, Socket } from "socket.io"; // Import Socket from "socket.io"
import fastify, { FastifyReply, FastifyRequest } from "fastify";
// import fastifyIO from "fastify-socket.io";
// import { Server as SocketIO } from "socket.io";
import { Kafka, logLevel } from "kafkajs";
import { prismaClient } from "./lib/db";
import fs from "fs";
import config from "./config/environmentVariables";
import socket_auth, {
  getAuthenticatedUser,
  removeAuthenticatedUser,
} from "./middleware/socket/socket-auth";

const app = fastify({
  logger: false,
  // Conditionally set up HTTPS based on the environment
  ...(config.ENVIRONMENT === "LIVE" && {
    https: {
      key: fs.readFileSync(
        "/home/streeteatsapisth/ssl/keys/c0612_e32e3_456064bd57312c817d4356da58f0d9c2.key"
      ),
      cert: fs.readFileSync(
        "/home/streeteatsapisth/ssl/certs/streeteats_apis_thesuitchstaging2_com_c0612_e32e3_1728152003_ebd79b0db338e807fc64b4a06c056e43.crt"
      ),
      ca: fs.readFileSync("/home/streeteatsapisth/ssl/certs/ca.crt"),
    },
  }),
});

const port: number = config.PORT || 3001;

const kafka = new Kafka({
  clientId: "chat-app",
  brokers: ["localhost:9092"],
  // logLevel: logLevel.INFO,
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "chat-app-group" });

app.get("/", (req: FastifyRequest, reply: FastifyReply) => {
  return reply.send({ message: "Street Eats Chat" });
});

const io = new Server(app.server);

async function run() {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({ topic: "messages" });
  await consumer.subscribe({ topic: "new-user" });
  await consumer.subscribe({ topic: "test" });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      console.log("consumer");
      console.log(topic);
      if (topic === "test") {
        console.log("test run");
        const data = JSON.parse(message.value!.toString());
        console.log(data);
      }

      if (topic === "new-user") {
        const { id, name, url, type } = JSON.parse(message.value!.toString());
        console.log(id, name, type);
        if (type === "user") {
          await prismaClient.user.create({
            data: {
              id,
              name,
              profileUrl: url,
            },
          });
        }
        if (type === "vendor") {
          await prismaClient.vendor.create({
            data: {
              name,
              id,
              profileUrl: url,
            },
          });
        }
      }
      if (topic === "messages") {
        const { chat, senderId, roomId, isRead } = JSON.parse(
          message.value!.toString()
        );
        await prismaClient.chat.create({
          data: {
            message: chat,
            senderId,
            isRead,
            roomId,
          },
        });
      }
    },
  });
}
run().catch(console.error);

io.on("connection", async (socket: Socket) => {
  console.log("On Connection");
  console.log("Client connected", socket.id);
  const authResult = await socket_auth(socket);

  if (authResult.status !== 200) {
    // Handle unauthorized connection
    setTimeout(() => {
      socket.disconnect(true);
    });
    socket.emit("serverLogs", authResult);
    console.log(authResult.message, socket.id);
    return;
  }
  // Get authenticated user using socket id
  const authenticatedUser = getAuthenticatedUser(socket.id);
  if (authenticatedUser) {
    console.log("Authenticated user:", authenticatedUser);
  } else {
    console.log("Authenticated user not found");
    // socket.disconnect(true);
    return;
  }

  // Handle disconnect to remove user from authenticated users
  socket.on("disconnect", () => {
    removeAuthenticatedUser(socket.id);
    console.log("Client disconnected", socket.id);
  });

  socket.on("all-rooms", async () => {
    // socket.join(roomId);
    let myRooms = await prismaClient.room.findMany({
      where: {
        OR: [
          { userId: authenticatedUser.profileId },
          { vendorId: authenticatedUser.profileId },
        ],
      },
      select: {
        id: true,

        Chat: {
          select: { message: true },
          take: 1,
          orderBy: { updatedAt: "desc" },
        },
        _count: {
          select: {
            Chat: {
              where: {
                isRead: false,
              },
            },
          },
        },
      },
    });
    console.log(myRooms);
    socket.emit("rooms", myRooms);
  });
  socket.on(
    "join-room",
    async ({
      roomId,
      userId,
      vendorId,
    }: {
      roomId?: string;
      userId?: string;
      vendorId?: string;
    }) => {
      if (!roomId) {
        const createRoom = await prismaClient.room.create({
          data: {
            userId: userId!,
            vendorId: vendorId!,
          },
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                profileUrl: true,
              },
            },
            vendor: {
              select: {
                id: true,
                name: true,
                profileUrl: true,
              },
            },
            Chat: {
              select: {
                id: true,
                isRead: true,
                message: true,
                media: {
                  select: {
                    url: true,
                  },
                },
                senderId: true,
                roomId: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });
        socket.join(createRoom.id);
        socket.emit("joined-room", {
          data: createRoom,
          message: "Room Created",
        });
      } else {
        const roomData = await prismaClient.room.findUnique({
          where: {
            id: roomId,
          },
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                profileUrl: true,
              },
            },
            vendor: {
              select: {
                id: true,
                name: true,
                profileUrl: true,
              },
            },
            Chat: {
              select: {
                id: true,
                isRead: true,
                message: true,
                media: {
                  select: {
                    url: true,
                  },
                },
                senderId: true,
                roomId: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });
        socket.join(roomId);
        socket.emit("joined-room", {
          data: roomData,
          message: "Room Joined",
        });
      }
    }
  );
  socket.on("leave-room", async ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
  });
  socket.on("new-msg", async (body) => {
    const { chat, roomId } = body as {
      chat: string;
      roomId: string;
    };
    // const roomUsers = io.sockets.adapter.rooms.get(roomId).size;
    const sendrId = authenticatedUser.profileId;
    const roomUsers = io.sockets.adapter.rooms.get(roomId)?.size;

    const isRead = roomUsers === 2;
    console.log(roomUsers);
    // const venId = vendorId.split("-");
    // const uId = userId.split("-");
    // const roomId = venId[0] + "-" + uId[0];

    // console.log(vendorId, userId, chat);
    await producer.send({
      topic: "messages",
      messages: [
        {
          value: JSON.stringify({
            chat,
            sendrId,
            roomId,
            isRead,
          }),
        },
      ],
    });
    io.to(roomId).emit(chat, sendrId, roomId, isRead);
  });
});

app.listen(
  {
    ...(config.ENVIRONMENT === "LIVE" && {
      host: config.SERVER_HOST,
    }),
    port: port,
  },
  (err: any) => {
    if (err) {
      console.log(err); // Log the error if any
      process.exit(1); // Terminate the process with a non-zero exit code
    }
    console.log(`Server Listening to http://localhost:${port}`);
  }
);

// io.listen(port);
// app.post("/sendToKafka", async (req, res) => {
//   try {
//     const { vendorId, userId, chat } = req.body as {
//       vendorId: string;
//       userId: string;
//       chat: string;
//     };

//     await producer.send({
//       topic: "private-messages",
//       messages: [
//         {
//           value: JSON.stringify({
//             vendorId,
//             userId,
//             chat,
//           }),
//         },
//       ],
//     });

//     res.status(200).send({ message: "Message sent" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: "Failed to send message to Kafka" });
//   }
// });
