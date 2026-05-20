import express from "express";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.post("/init-payment/:appointmentId", PaymentController.initPayment);

export const PaymentRoutes = router;
