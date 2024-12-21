import { Kafka, logLevel, Partitioners } from "kafkajs";

const kafka = new Kafka({
  clientId: "chat-app",
  brokers: ["localhost:9092"],
  logLevel: logLevel.INFO,
});
const producer = kafka.producer();

export const kafkarun = async (
  id: string,
  name: string,
  type: string,
  topic: string,
  url: string
) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify({ id, name, type, url }) }],
  });
  console.log("message sent to kafka producer");
};
