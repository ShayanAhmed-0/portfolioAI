import config from "./config/environmentVariables";
// import { run_kafka } from "./lib/kafka";
import { init, run } from "./server";
// import admin, { ServiceAccount } from "firebase-admin";
(async () => {
  try {
    const server = await init(config);
  
    //   credential: admin.credential.cert(serviceAccount as ServiceAccount),
    // });
    // // server.get("/get", (req, res) => {
    // //   res.send("get");
    // // });
    // server.post("/send-notifications", (req, res) => {
    //   // These registration tokens come from the client FCM SDKs.
    //   const registrationTokens = [
    //     "YOUR_REGISTRATION_TOKEN_1",
    //     // …
    //     "YOUR_REGISTRATION_TOKEN_N",
    //   ];

    //   const message = {
    //     data: { score: "850", time: "2:45" },
    //     tokens: registrationTokens,
    //   };

    //   admin
    //     .messaging()
    //     .sendEachForMulticast(message)
    //     .then((response) => {
    //       if (response.failureCount > 0) {
    //         const failedTokens: string[] = [];
    //         response.responses.forEach((resp, idx) => {
    //           if (!resp.success) {
    //             failedTokens.push(registrationTokens[idx]);
    //           }
    //         });
    //         console.log("List of tokens that caused failures: " + failedTokens);
    //       } else {
    //         console.log("messages sent");
    //         res.send("sent");
    //       }
    //     })
    //     .catch((error) => {
    //       console.log("Error sending message:", error);
    //       res.send("failed");
    //     });
    // });
    console.log("Server initialized successfully.");

    // Start both Fastify server and socket.io server concurrently
    await Promise.all([
      run(server),
      // run_socket(server),
      // run_kafka(server)
    ]);

    console.log("Server and socket.io running.");
  } catch (err) {
    console.error("Error initializing server:", err);
    process.exit(1); // Exit process with error
  }
})();
