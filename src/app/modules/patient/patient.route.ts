import express from 'express'
import { PatientController } from './patient.controller'

const router = express.Router()

router.get("/:id", PatientController.getByIdFromDB)
router.delete("/:id", PatientController.deleteFromDB)
router.patch("/:id", PatientController.updateIntoDB)
router.delete("/:id", PatientController.deleteFromDB)
router.delete("/soft/:id", PatientController.softDelete)

export const PatientRoutes = router