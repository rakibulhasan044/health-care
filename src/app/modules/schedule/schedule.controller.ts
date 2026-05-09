import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ScheduleService } from "./schedule.service";

const createIntoDB = catchAsync(async (req, res) => {
  const result = await ScheduleService.createIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

export const ScheduleController = {
  createIntoDB,
};
