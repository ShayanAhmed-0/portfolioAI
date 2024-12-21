import fastifyIO from "fastify-socket.io";
import fs from "fs";
import path from "path";
import fastify from "fastify";
import { fastifyCors } from "@fastify/cors";
import fastifyMultipart, { FastifyMultipartOptions } from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import formBodyPlugin from "@fastify/formbody";
import { Server as SocketIO } from "socket.io";
import my_socket from "./app/services/Chat";
import logger from "./logger/logger";
import AppConfig from "./config/environmentVariables";
import routes from "./app/routes";
// import { producer } from "./lib/kafka";
// import { producer } from "./lib/kafka";

declare module "fastify" {
  interface FastifyInstance {
    io: SocketIO;
    kafka: any;
  }
  interface FastifyRequest {
    user?: any;
  }
}
export const init = async (config: typeof AppConfig) => {
  const app = fastify({
    logger: false,
    // Conditionally set up HTTPS based on the environment
    ...(config.ENVIRONMENT === "LIVE" && {
      https: {
        key: fs.readFileSync(
          "/home/portfolioai/ssl/keys/c0612_e32e3_456064bd57312c817d4356da58f0d9c2.key"
        ),
        cert: fs.readFileSync(
          "/home/portfolioai/ssl/certs/streeteats_apis_thesuitchstaging2_com_c0612_e32e3_1728152003_ebd79b0db338e807fc64b4a06c056e43.crt"
        ),
        ca: fs.readFileSync("/home/portfolioai/ssl/certs/ca.crt"),
      },
    }),
  });

  // await producer.connect();
  app.decorate("config", config);
  // app.decorate("kafka", {});
  app.register(formBodyPlugin);

  app.register(fastifyMultipart);
  app.register(fastifyIO);

  // console.log(path.join(__dirname, "public/uploads"));
  app.register(fastifyStatic, {
    root: path.join(__dirname, "public/uploads"),
  });

  logger.info("hello world");

  app.register(fastifyCors, {
    origin: true,
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Accept",
      "Content-Type",
      "Authorization",
    ],
    methods: ["GET", "PUT", "OPTIONS", "POST", "DELETE"],
    exposedHeaders: "Content-Disposition",
  });

  app.register(routes);

  return app;
};

export const run = async (app: any) => {
  logger.info("server Running");
  await app.listen(
    {
      // Conditionally include the host based on the environment
      ...(app.config.ENVIRONMENT === "LIVE" && {
        host: app.config.SERVER_HOST,
      }),
      port: app.config.PORT,
    },
    (err: any) => {
      if (err) {
        logger.error(err); // Log the error if any
        process.exit(1); // Terminate the process with a non-zero exit code
      }
      logger.info(
        `Server Listening to http://${app.config.HOST}:${app.config.PORT}`
      );
    }
  );
};
export const run_socket = async (app: any) => {
  try {
    console.log("Initializing socket.io...");
    await my_socket(app);
    console.log("Socket.io initialized successfully.");
  } catch (err: any) {
    app.log.error("Error initializing socket.io:", err);
    return {
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    };
  }
};
