// import seeder from "./services/api/seeder";
import chats from "./services/api/chat";
import lovs from "./services/api/lovs";
import reviews from "./services/api/reviews";
import user_auth from "./services/api/users/auth";
import user_profile from "./services/api/users/profile";
// import reviews from "./services/api/reviews";

export default async (fastify: any) => {
  const apiPrefix = "api/v1";
  fastify.register(user_auth, { prefix: `${apiPrefix}/user/auth` });
  fastify.register(user_profile, { prefix: `${apiPrefix}/user/profile` });
  fastify.register(reviews, { prefix: `${apiPrefix}/user/reviews` });
  fastify.register(chats, { prefix: `${apiPrefix}/user/chats` });
  fastify.register(lovs, { prefix: `${apiPrefix}/lovs` });
  

  // fastify.register(seeder, { prefix: "/Warn/seeder" });
  fastify.route({
    method: "GET",
    url: "/",
    handler: async (req: any, res: any) => {
      res.status(200).send("ok");
    },
  });
};
