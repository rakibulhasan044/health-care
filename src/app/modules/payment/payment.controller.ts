import config from "../../../config";
import { stripe } from "../../../config/stripe.config";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";

const initPayment = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;

  const result = await PaymentService.initPayment(appointmentId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment success",
    data: result,
  });
});

const validatePayment = catchAsync(async (req, res) => {
  const result = await PaymentService.validatePayment(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment success",
    data: result,
  });
});

const handleStripeWebhookEvent = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = config.stripe.stripe_webhook_secret;

  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res.status(400).send({
      message: "Missing Stripe signature or webhook secret",
    });
  }

  let event;

  try{
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  }
  catch (err) {
    console.error("Error constructing webhook event:", err);
    return res.status(400).send({
      message: "Invalid signature or webhook secret",
    });
  }

  try{
    const result = await PaymentService.handleStripeWebhookEvent(event)

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result
    })
  } catch(err) {
    console.error("Error processing Stripe webhook event:", err);
    return res.status(500).send({
      message: "Error processing Stripe webhook event",
    });
  }
});

export const PaymentController = {
  initPayment,
  validatePayment,
  handleStripeWebhookEvent
};
