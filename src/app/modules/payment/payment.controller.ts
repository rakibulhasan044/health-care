import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PaymentService } from "./payment.service";

const initPayment = catchAsync(async (req, res) => {
  const result = PaymentService.initPayment();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment success",
    data: result,
  });
});

export const PaymentController = {
  initPayment,
};
