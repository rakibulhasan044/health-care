import express from "express";
import { ScheduleController } from "./schedule.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/", ScheduleController.createIntoDB);

router.get("/", auth(UserRole.DOCTOR), ScheduleController.getAllFromDB);

router.delete("/", ScheduleController.deleteAllSchedule);

export const ScheduleRoutes = router;
