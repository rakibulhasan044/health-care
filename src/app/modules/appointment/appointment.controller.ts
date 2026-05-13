import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { AppointmentService } from "./appointment.service";

const createAppointment = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await AppointmentService.createAppointment(
    user as IAuthUser,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Appointment created successfully",
    data: result,
  });
});

export const AppointmentController = {
  createAppointment,
};
