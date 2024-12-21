import nodemailer, { Transporter } from "nodemailer";
import { emailConfig } from "../config/emailConfig";
type SendEmailOptions = {
  to: string;
  subject: string;
  content: string;
  attachments?: { filename: string; content: string }[];
  next: (error: Error | null, info: any) => void;
};

// create reusable transporter object using the default SMTP transport
const transporter: Transporter = nodemailer.createTransport(emailConfig);

export const sendEmail = ({
  to,
  subject,
  content,
  attachments,
  next,
}: SendEmailOptions) => {
  try {
    const message = {
      from: {
        name: process.env.MAIL_FROM_NAME || "",
        address: process.env.MAIL_USERNAME || "",
      },
      to,
      subject,
      html: content,
      attachments,
    };
    console.log("Email send successfully", message);
    transporter.sendMail(message, next);
  } catch (error: any) {
    console.error(error, "Email send failed");
    next(error, null);
  }
};

// const emailOptions = {
//   to: "shayan@yopmail.com",
//   subject: "Test Email",
//   content: "<p>This is a test email.</p>",
//   // attachments: [
//   //   {
//   //     filename: "attachment.txt",
//   //     content: "This is the content of the attachment.",
//   //   },
//   // ],
//   next: (error: any, info: any) => {
//     if (error) {
//       console.error("Email send failed:", error);
//     } else {
//       console.log("Email sent successfully:", info);
//     }
//   },
// };
// sendEmail(emailOptions);
