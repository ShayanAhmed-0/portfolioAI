// export const send_notification = (app, tokens, object, data) => {
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

//   getMessaging()
//     .sendMulticast(message)
//     .then((response) => {
//       if (response.failureCount > 0) {
//         const failedTokens = [];
//         response.responses.forEach((resp, idx) => {
//           if (!resp.success) {
//             failedTokens.push(registrationTokens[idx]);
//           }
//         });
//         console.log("List of tokens that caused failures: " + failedTokens);
//       }
//     });
// };
import admin, { ServiceAccount } from "firebase-admin";

export const fcm_notification = (tokens: string[], data: any) => {
  //   const registrationTokens = [
  //     "YOUR_REGISTRATION_TOKEN_1",
  //     // …
  //     "YOUR_REGISTRATION_TOKEN_N",
  //   ];
  console.log(tokens, data);
  const message = {
    data,
    tokens,
  };

  admin
    .messaging()
    .sendEachForMulticast(message)
    .then((response) => {
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.log("List of tokens that caused failures: " + failedTokens);
      } else {
        console.log("messages sent");
        // res.send("sent");
      }
    })
    .catch((error) => {
      console.log("Error sending message:", error);
      //   res.send("failed");
    });
};
