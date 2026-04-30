import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";
import { Request } from "express";

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  const { refreshToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "production",
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "user logged in successfully",
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.clearCookie("refreshToken");
    throw new Error("Refresh token not found");
  }

  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token refreshed successfully",
    data: result,
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: any }, res) => {
    const user = req.user;
    const result = await AuthServices.changePassword(user, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  },
);

const forgotPassword = catchAsync(async (req, res) => {
  await AuthServices.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check your email",
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res) => {
console.log('hello');
  const token = req.headers.authorization || "";
  console.log("token", token);

  await AuthServices.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password reset successfully",
    data: null,
  });
});

export const AuthController = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
