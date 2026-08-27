import { PaymentStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import { SSLService } from "../SSL/ssl.service";
import { IPaymentData } from "../SSL/ssl.interface";
import Stripe from "stripe";
import { stripe } from "../../../config/stripe.config";

const initPayment = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: {
      appointmentId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });

  const initPaymentData: IPaymentData = {
    amount: paymentData.amount,
    transactionId: paymentData.transactionId,
    name: paymentData?.appointment?.patient?.name,
    email: paymentData?.appointment?.patient?.email,
    address: paymentData?.appointment?.patient?.address,
    phoneNumber: paymentData?.appointment?.patient?.contactNumber,
  };

  const result = await SSLService.initPayment(initPaymentData);

  return {
    paymentUrl: result.GatewayPageURL,
  };
};

const validatePayment = async (payload: any) => {
  // if (!payload || !payload.status || !(payload.status === "VALID")) {
  //   return {
  //     message: "invalid payment",
  //   };
  // }
  // const response = await SSLService.validatePayment(payload);

  // if (response?.status !== "VALID") {
  //   return {
  //     message: "payment failed",
  //   };
  // }

  const response = payload;

  await prisma.$transaction(async (tx) => {
    const updatedPaymentData = await tx.payment.update({
      where: {
        transactionId: response.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: response,
      },
    });

    await tx.appointment.update({
      where: {
        id: updatedPaymentData.appointmentId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
  });

  return {
    message: "Payment success",
  };
};

// stripe payment services

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping...`);
    return { message: `Event ${event.id} already processed. Skipping...` };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const appointmentId = session?.metadata?.appointmentId;
      const paymentId = session?.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.error("Missing appointmentId or paymentId in session metadata");
        return {
          message: "Missing appointmentId or paymentId in session metadata",
        };
      }
      const appointment = await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
      });

      if (!appointment) {
        console.error(`Appointment with ID ${appointmentId} not found`);
        return { message: `Appointment with ID ${appointmentId} not found` };
      }

      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            paymentStatus:
              session.payment_status == "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
          },
        });

        await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            stripeEventId: event.id,
            status:
              session.payment_status == "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
          },
        });
      });

      console.log(
        `Processed checkout.session.completed for appointment ${appointmentId} and payment ${paymentId}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      console.log(
        `Checkout session ${session.id} expired. Marking associated payment as failed`,
      );
      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      console.log(
        `Payment intent ${session.id} failed. Marking associated payment as failed`,
      );
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return {
    message: `Webhook event ${event.id} processed successfully`,
  };
};

const verifyStripePayment = async (sessionId: string) => {
  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session) {
    throw new Error("Invalid session ID");
  }

  const appointmentId = session?.metadata?.appointmentId;
  const paymentId = session?.metadata?.paymentId;

  if (!appointmentId || !paymentId) {
    throw new Error("Missing appointmentId or paymentId in session metadata");
  }

  if (session.payment_status === "paid") {
    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { paymentStatus: PaymentStatus.PAID },
      });

      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PAID,
          paymentGatewayData: session as any,
        },
      });
    });
  }

  return { message: "Payment verified" };
};

export const PaymentService = {
  initPayment,
  validatePayment,
  verifyStripePayment,
  handleStripeWebhookEvent
};
