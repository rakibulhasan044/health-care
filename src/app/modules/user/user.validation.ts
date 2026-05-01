import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";

const createAdmin = z.object({
  password: z
    .string("Password is required")
    .min(4, "Password must be at least 4 characters"),
  admin: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string("email is required").email("Invalid email address"),
    contactNumber: z.string("Contact number is required"),
  }),
});

const createDoctor = z.object({
  password: z
    .string("Password is required")
    .min(4, "Password must be at least 4 characters"),
  doctor: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string("email is required").email("Invalid email address"),
    contactNumber: z.string("Contact number is required"),
    address: z.string().optional(),
    registrationNumber: z.string("Registration number is required"),
    experience: z.number().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    appointmentFee: z.number("Appointment fee is required"),
    qualification: z.string("Qualification is required"),
    currentWorkingPlace: z.string("Current working place is required"),
    designation: z.string("Designation is required"),
  }),
});

const createPatient = z.object({
  password: z.string(),
  patient: z.object({
    email: z.string("Email is required!").email(),
    name: z.string("Name is required!"),
    contactNumber: z.string("Contact number is required!"),
    address: z.string("Address is required"),
  }),
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]),
  }),
});

export const userValidation = {
  createAdmin,
  createDoctor,
  createPatient,
  updateStatus,
};
