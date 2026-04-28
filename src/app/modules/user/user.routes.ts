import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import { jwtHelpers } from "../../../helper/jwtHelpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
const router = express.Router();

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if(!token) {
        throw new Error("You are not authorized")
      }
      const verifiedUser = jwtHelpers.verifyToken(token, config.jwt.refresh_token_secret as Secret)
      console.log(verifiedUser);
      
      if(roles.length && !roles.includes(verifiedUser.role)) {
        throw new Error("You are not authorized")
      }
      next()
    } catch (error) {
      next(error);
    }
  };
};

router.post("/", auth("ADMIN", "SUPER_ADMIN"), UserController.createAdmin);

export const UserRoutes = router;
