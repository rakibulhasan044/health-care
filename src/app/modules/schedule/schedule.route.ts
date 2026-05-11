import express from 'express'
import { ScheduleController } from './schedule.controller'

const router = express.Router()

router.post("/", ScheduleController.createIntoDB)

router.delete("/", ScheduleController.deleteAllSchedule)

export const ScheduleRoutes = router