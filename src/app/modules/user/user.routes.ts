import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helper/fileUploader";

const router = express.Router();

router.post(
  "/",
  fileUploader.upload.single("file"),
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.createAdmin,
);

export const UserRoutes = router;
