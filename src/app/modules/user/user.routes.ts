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
      console.log("error from routes");
      next(err);
    }
  };

router.post(
  "/create-admin",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  validateRequest(userValidation.createAdmin),
  UserController.createAdmin
);

router.post(
  "/create-doctor",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  validateRequest(userValidation.createDoctor),
  UserController.createDoctor
);

router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  validateRequest(userValidation.createPatient),
  UserController.createPatient
);

export const UserRoutes = router;
