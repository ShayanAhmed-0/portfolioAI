import jwt from "jsonwebtoken";
import validatedEnv from "../../config/environmentVariables";

// const secretKey = validatedEnv.USER_JWT_SECRET;

export const generateJWT = (
  payload: any,
  secretKey: string,
  exTime: string | number = validatedEnv.JWT_TIME
) => {
  // Generate JWT with Bearer token
  const token = jwt.sign(payload, secretKey, {
    expiresIn: exTime,
  });

  // Construct Bearer token
  const bearerToken = `Bearer ${token}`;

  // console.log("Generated Bearer Token:", bearerToken);
  return bearerToken;
};
// Payload for the token

export const verifyJWT = (bearerToken: string, secretKey: string) => {
  const token = bearerToken.split(" ");
  if (token.length === 2) {
    if (token[0] !== "Bearer") return false;
    return jwt.verify(token[1], secretKey, (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err.message);
        return false;
      } else {
        console.log("Decoded JWT:", decoded);
        return decoded;
      }
    });
  }
};
// Payload for the token
