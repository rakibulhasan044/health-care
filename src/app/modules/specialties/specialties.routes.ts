import express, { NextFunction, Request, Response } from "express";
import { SpecialtiesController } from "./specialties.controller";
import { fileUploader } from "../../../helper/fileUploader";
import { SpecialtiesValidations } from "./specialties.validations";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = JSON.parse(req.body.data);
      req.body = SpecialtiesValidations.create.parse(parsedData);
      return SpecialtiesController.insertIntoDB(req, res, next);
    } catch (error) {
      return next(error);
    }
  },
);

router.get("/", SpecialtiesController.getAllFromDB);

router.get("/:id", SpecialtiesController.getById);

router.delete("/:id", SpecialtiesController.deleteFromDB);

export const SpecialtiesRoutes = router;
