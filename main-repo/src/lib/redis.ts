import Redis from "ioredis";

const redis = new Redis({
  host: "localhost",
  port: 6378,
});

export default redis;
