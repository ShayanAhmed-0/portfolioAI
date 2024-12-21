// // lib/kafka.ts
// import fastifyKafka from "@fastify/kafka";
// import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
// import logger from "../logger/logger";

// export const run_kafka = async (app: any) => {
//   try {
//     app.register(require("@fastify/kafka"), {
//       clientId: "chat-app",
//       brokers: ["localhost:9092"],
//     });

//     app.post("/send", async (request: FastifyRequest, reply: FastifyReply) => {
//       const { message } = request.body as { message: string };
//       const producer = app.kafka.producer();

//       await producer.connect();
//       await producer.send({
//         topic: "chat-messages",
//         messages: [{ value: message }],
//       });

//       await producer.disconnect();

//       reply.send({ status: "Message sent" });
//     });

//     app.get(
//       "/receive",
//       async (request: FastifyRequest, reply: FastifyReply) => {
//         const consumer = app.kafka.consumer({ groupId: "chat-group" });

//         await consumer.connect();
//         await consumer.subscribe({
//           topic: "chat-messages",
//           fromBeginning: true,
//         });

//         const messages: any[] = [];

//         await consumer.run({
//           eachMessage: async ({ message }: { message: any }) => {
//             messages.push(message.value.toString());
//           },
//         });

//         setTimeout(async () => {
//           await consumer.disconnect();
//           reply.send(messages);
//         }, 1000); // Adjust delay as needed
//       }
//     );
//   } catch (error) {
//     logger.error("Error initializing Kafka:", error);
//     throw error; // Ensure errors are propagated correctly
//   }
// };
