import express from 'express'
import { PatientController } from './patient.controller'

const router = express.Router()

router.get("/:id", PatientController.getByIdFromDB)
router.delete("/:id", PatientController.deleteFromDB)
router.patch("/:id", PatientController.updateIntoDB)

export const PatientRoutes = router