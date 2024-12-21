import { Socket } from "socket.io";
import validatedEnv from "../../config/environmentVariables";
import { verifyJWT } from "../../utils/validation/token";
// import VendorService from "../../services/Vendor/vendor-service";

// Define a map to store authenticated users
const authenticatedUsers: Map<string, any> = new Map();

export default async function socket_auth(socket: Socket) {
  const authHeader = socket.handshake.headers["authorization"];
  console.log(authHeader);

  if (!authHeader) {
    console.log("Authorization header not found");
    return { message: "Authorization header not found", status: 403 };
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log("Token not found");
    return { message: "Token not found", status: 403 };
  }

  let verification: any = verifyJWT(authHeader, validatedEnv.USER_JWT_SECRET);
  if (!verification)
    verification = verifyJWT(authHeader, validatedEnv.VENDOR_JWT_SECRET);
  if (!verification)
    verification = verifyJWT(authHeader, validatedEnv.EMPLOYEE_SECRET);
  console.log(verification);

  if (!verification) {
    console.log("Invalid token");
    return { message: "Invalid token", status: 403 };
  }

  // Store authenticated user with socket id as key
  authenticatedUsers.set(socket.id, verification);

  console.log("Authorization successful");
  return { message: "Authorization successful", status: 200 };
}

// Function to get authenticated user by socket id
export function getAuthenticatedUser(socketId: string): any | undefined {
  return authenticatedUsers.get(socketId);
}

// Function to remove authenticated user on disconnect
export function removeAuthenticatedUser(socketId: string): void {
  authenticatedUsers.delete(socketId);
}
