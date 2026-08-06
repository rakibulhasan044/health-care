import express from "express";
import { ScheduleController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { scheduleValidation } from "./schedule.validations";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(scheduleValidation.createSchedule),
  ScheduleController.createIntoDB,
);

router.get(
  "/",
  auth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ScheduleController.getAllFromDB,
);

router.get(
  "/:id",
  auth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ScheduleController.getScheduleById,
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(scheduleValidation.updateSchedule),
  ScheduleController.updateScheduleById,
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ScheduleController.deleteScheduleById,
);

export const ScheduleRoutes = router;
