import { Gender } from "@prisma/client";
import { z } from "zod";

const createAdmin = z.object({
  password: z.string().min(4, "Password must be at least 4 characters"),
  admin: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address").nonempty("email is required"),
    contactNumber: z.string("Contact number is required"),
  }),
});

const createDoctor = z.object({
  password: z.string("Password is required"),
  doctor: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address").nonempty("email is required"),
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

export const userValidation = {
  createAdmin,
  createDoctor
};
