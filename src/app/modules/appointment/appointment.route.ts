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
  "/book-appointment",
  auth(UserRole.PATIENT),
  // add zod validation
  AppointmentController.createAppointment,
);

router.patch(
  "/status/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  AppointmentController.changeAppointmentStatus,
);

router.post(
  "/book-appointment-with-pay_later",
  auth(UserRole.PATIENT),
  AppointmentController.createAppointmentWithPaymentLater,
);

router.post(
  "/initiate-payment/:id",
  auth(UserRole.PATIENT),
  AppointmentController.initiatePayment,
);

export const AppointmentRoutes = router;
