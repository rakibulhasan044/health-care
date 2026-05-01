import express, { NextFunction, Request, RequestHandler, Response } from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helper/fileUploader";
import { userValidation } from "./user.validation";

const router = express.Router();

const validateRequest = (schema: any) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = JSON.parse(req.body.data);
      req.body = schema.parse(data);
      next();
    } catch (err) {
      next(err);
    }
  };

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  validateRequest(userValidation.createAdmin),
  UserController.createAdmin
);

export const UserRoutes = router;
