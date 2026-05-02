import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helper/fileUploader";
import { userValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

const validateRequestWithPhoto =
  (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = JSON.parse(req.body.data);
      req.body = schema.parse(data);
      next();
    } catch (err) {
      router.get(
        "/",
        auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
        UserController.getAllFromDB,
      );
    }
  };

router.get(
  "/me",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  UserController.getMyProfile,
);

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.getAllFromDB,
);

router.post(
  "/create-admin",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  validateRequestWithPhoto(userValidation.createAdmin),
  UserController.createAdmin,
);

router.post(
  "/create-doctor",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  fileUploader.upload.single("file"),
  validateRequestWithPhoto(userValidation.createDoctor),
  UserController.createDoctor,
);

router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  validateRequestWithPhoto(userValidation.createPatient),
  UserController.createPatient,
);

router.patch(
  "/:id/status",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(userValidation.updateStatus),
  UserController.changeProfileStatus,
);

router.patch(
  "/update-my-profile",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return UserController.updateMyProfile(req, res, next);
  },
);

export const UserRoutes = router;
