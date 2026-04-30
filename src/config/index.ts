import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expires_in: (process.env.EXPIRES_IN || "30d") as SignOptions["expiresIn"],
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: (process.env.REFRESH_TOKEN_EXPIRES_IN ||
      "30d") as SignOptions["expiresIn"],
    reset_pass_token: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: (process.env.RESET_TOKEN_EXPIRES_IN ||
      "5m") as SignOptions["expiresIn"],
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  emailSender :{
    email: process.env.SMTP_USER,
    app_pass: process.env.SMTP_PASS
  }
};
