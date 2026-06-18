import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import { jwtHelpers } from "../../../helper/jwtHelpers";
import { UserStatus } from "@prisma/client";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import emailSender from "./emailSender";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error("Incorrect password!");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in,
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

// const refreshToken = async (token: string) => {
//   let decodedData;
//   try {
//     decodedData = jwtHelpers.verifyToken(
//       token,
//       config.jwt.refresh_token_secret as Secret,
//     );
//   } catch (error) {
//     throw new Error("You are not authorized!");
//   }

//   const userData = await prisma.user.findUniqueOrThrow({
//     where: {
//       email: decodedData.email,
//       status: UserStatus.ACTIVE,
//     },
//   });

//   const accessToken = jwtHelpers.generateToken(
//     {
//       email: userData.email,
//       role: userData.role,
//     },
//     config.jwt.jwt_secret as Secret,
//     config.jwt.expires_in,
//   );
//   return {
//     accessToken,
//     needPasswordChange: userData.needPasswordChange,
//   };
// };

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret,
    );
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in,
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error("password incorrect");
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);
  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
    },
  });
  return {
    message: "Password changed successfully",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPasswordToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_token as Secret,
    config.jwt.reset_pass_token_expires_in,
  );
  const resetPassLink =
    config.reset_pass_link +
    `?userId=${userData.id}&token=${resetPasswordToken}`;

  await emailSender(
    userData.email,
    `
    <div>
      <p>Dear user,</p>
      <p>Your password reset link</p>
      <a href=${resetPassLink}>
        <button>
          Reset Password
        </button>
      </a>
    </div>
    `,
  );
  console.log(resetPassLink);
};

// const resetPassword = async (
//   token: string,
//   payload: { id: string; password: string },
// ) => {
//   console.log('reset pass');
//   const userData = await prisma.user.findUniqueOrThrow({
//     where: {
//       id: payload.id,
//       status: UserStatus.ACTIVE,
//     },
//   });

//   const isValidToken = jwtHelpers.verifyToken(
//     token,
//     config.jwt.reset_pass_token as Secret,
//   );

//   if (!isValidToken) {
//     throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
//   }

//   // hash password
//   const password = await bcrypt.hash(payload.password, 12);

//   // update into database
//   const newuser=await prisma.user.update({
//     where: {
//       id: payload.id,
//     },
//     data: {
//       password,
//     },
//   });
//   console.log(newuser);
// };

const resetPassword = async (
  token: string | null,
  payload: { email?: string; password: string },
  user?: { email: string },
) => {
  let userEmail: string;

  // Case 1: Token-based reset (from forgot password email)
  if (token) {
    const decodedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_secret as Secret,
    );

    if (!decodedToken) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Invalid or expired reset token!",
      );
    }

    // Verify email from token matches the email in payload
    if (payload.email && decodedToken.email !== payload.email) {
      console.log("Verify email from token matches the email in payload");
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Email mismatch! Invalid reset request.",
      );
    }

    userEmail = decodedToken.email;
  }
  // Case 2: Authenticated user with needPasswordChange (newly created admin/doctor)
  else if (user && user.email) {
    console.log({ user }, "needpassworchange");
    const authenticatedUser = await prisma.user.findUniqueOrThrow({
      where: {
        email: user.email,
        status: UserStatus.ACTIVE,
      },
    });

    // Verify user actually needs password change
    if (!authenticatedUser.needPasswordChange) {
      console.log({ user }, "Verify user actually needs password change");
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You don't need to reset your password. Use change password instead.",
      );
    }

    userEmail = user.email;
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid request. Either provide a valid token or be authenticated.",
    );
  }

  // hash password
  const password = await bcrypt.hash(payload.password, 12);

  // update into database
  await prisma.user.update({
    where: {
      email: userEmail,
    },
    data: {
      password,
      needPasswordChange: false,
    },
  });
};

const getMe = async (user: any) => {
  const accessToken = user.accessToken;
  const decodedData = jwtHelpers.verifyToken(
    accessToken,
    config.jwt.jwt_secret as Secret,
  );

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          currentWorkingPlace: true,
          designation: true,
          // averageRating: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          doctorSpecialties: {
            include: {
              specialties: true,
            },
          },
        },
      },
      patient: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          patientHealthData: true,
        },
      },
    },
  });
  return userData;
};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
};
