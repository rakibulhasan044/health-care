import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DoctorScheduleService } from "./doctorSchedule.service";

const createIntoDB = catchAsync(async (req, res) => {
  const user = req.user;
  const result = DoctorScheduleService.createIntoDB(user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctors schedule created successfully",
    data: result,
  });
});

export const DoctorScheduleController = {
  createIntoDB,
};
