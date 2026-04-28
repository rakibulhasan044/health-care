import express, { NextFunction, Request, Response } from "express";
import { AdminController } from "./admin.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AdminValidationSchemas } from "./admin.validations";

const router = express.Router();

router.get("/", AdminController.getAllFromDB);

router.get("/:id", AdminController.getByIdFromDB);

router.patch(
  "/:id",
  validateRequest(AdminValidationSchemas.update),
  AdminController.updateIntoDB,
);

router.delete("/:id", AdminController.deleteFromDB);

export const AdminRoutes = router;
