// import seeder from "./services/api/seeder";
import user_auth from "./services/api/users/auth";
import user_profile from "./services/api/users/profile";

export default async (fastify: any) => {
  const apiPrefix = "api/v1";
  fastify.register(user_auth, { prefix: `${apiPrefix}/user/auth` });
  fastify.register(user_profile, { prefix: `${apiPrefix}/user/profile` });
  

  // fastify.register(seeder, { prefix: "/Warn/seeder" });
  fastify.route({
    method: "GET",
    url: "/",
    handler: async (req: any, res: any) => {
      res.status(200).send("ok");
    },
  });
};
