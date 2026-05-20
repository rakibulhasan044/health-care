import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
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

export const PaymentController = {
  initPayment,
};
