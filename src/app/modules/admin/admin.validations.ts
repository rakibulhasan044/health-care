import z from "zod";

const update = z.object({
  body: z.object({
    name: z.string(),
    contactNumber: z.string().max(15),
  }),
});

export const AdminValidationSchemas = {
  update,
};
