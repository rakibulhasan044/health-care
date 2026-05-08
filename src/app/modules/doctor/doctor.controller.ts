import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DoctorService } from "./doctor.service";

const updateIntoDB = catchAsync(async(req, res) => {
    console.log('here');

    const result = await DoctorService.updateIntoDB(req.params.id as string, req.body)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor updated successfully",
        data: result
    })
})

export const DoctorController = {
    updateIntoDB
}