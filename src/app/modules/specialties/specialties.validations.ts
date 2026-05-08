import {z} from "zod"

const create = z.object({
    title: z.string("Title is required").min(3)
})

export const SpecialtiesValidations = {
    create
}