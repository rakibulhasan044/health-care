import express from "express";
import { AppointmentController } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/my-appointment",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentController.getMyAppointment,
);

router.post(
  "/",
  auth(UserRole.PATIENT),
  // add zod validation
  AppointmentController.createAppointment,
);

// get all appointment with filtering only accessable for admin and super admin

export const AppointmentRoutes = router;
