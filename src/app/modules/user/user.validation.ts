import { z } from "zod";

const createAdmin = z.object({
  password: z.string().min(4, "Password must be at least 4 characters"),
  admin: z.object({
    name: z.string().min(2, "Name is required and at least 2 character"),
    email: z.string("Invalid email address").nonempty("email is required"),
    contactNumber: z.string("Contact number is required"),
  }),
});

export const userValidation = {
  createAdmin,
};
