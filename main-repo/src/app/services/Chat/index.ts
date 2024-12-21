import { FastifyInstance } from "fastify";
import socket_auth, {
  getAuthenticatedUser,
  removeAuthenticatedUser,
} from "../../middlewares/socket/socket-auth";
import { Socket } from "socket.io"; // Import Socket from "socket.io"

const my_socket = async (fastify: FastifyInstance) => {
  fastify.io.on("connection", async (socket: Socket) => {
    console.log("hello socket");
    // Specify socket as Socket type
    const authResult = await socket_auth(socket);

    if (authResult.status !== 200) {
      // Handle unauthorized connection
      socket.emit("vendorActive", "Vendor is active!");
      socket.disconnect(true);
      console.log(authResult.message, socket.id);
      return;
    }

    console.log("Client connected", socket.id);
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
    socket.on("vendorActive", () => {
      // removeAuthenticatedUser(socket.id);
      console.log("vendorActivevendorActivevendorActive", socket.id);
      socket.emit("vendorActive", "Vendor is active!");
    });

    // Check if vendor is active and send message to client
    if (authResult.message === "vendor is active") {
      socket.emit("vendorActive", "Vendor is active!"); // Emit a message to the client
    }
  });
};

export default my_socket;
