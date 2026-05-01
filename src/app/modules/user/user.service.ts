import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import { fileUploader } from "../../../helper/fileUploader";

const createAdmin = async (req: any) => {
  const file = req.file;
  const data = req.body;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    data.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(data.password, 12);

  const userData = {
    email: data.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const { email, name, contactNumber, profilePhoto } = data.admin;
    const createdAdminData = await transactionClient.admin.create({
      data: {
        email,
        name,
        contactNumber,
        // ...(profilePhoto && { profilePhoto }),
        profilePhoto,
      },
    });

    return createdAdminData;
  });

  return result;
};

const createDoctor = async (req: any) => {
  const file = req.file;
  const data = req.body;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    data.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(data.password, 12);

  const userData = {
    email: data.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const {
      email,
      name,
      contactNumber,
      profilePhoto,
      address,
      registrationNumber,
      experience,
      gender,
      appointmentFee,
      qualification,
      currentWorkingPlace,
      designation,
    } = data.doctor;

    const createdDoctorData = await transactionClient.doctor.create({
      data: {
        name,
        email,
        contactNumber,
        profilePhoto,
        address,
        registrationNumber,
        experience,
        gender,
        appointmentFee,
        qualification,
        currentWorkingPlace,
        designation
      },
    });

    return createdDoctorData;
  });

  return result;
};

export const UserService = {
  createAdmin,
  createDoctor
};
