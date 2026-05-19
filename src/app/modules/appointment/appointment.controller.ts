import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
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

const getMyAppointment = catchAsync(async (req, res) => {
  const user = req.user;
  const filters = pick(req.query, ["status", "paymentStatus"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await AppointmentService.getMyAppointment(
    user as IAuthUser,
    filters,
    options,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Appointment fetched successfully!",
    data: result,
  });
  
});

export const AppointmentController = {
  createAppointment,
  getMyAppointment,
};
