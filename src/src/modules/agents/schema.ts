import{z} from "zod";

export const agentsInsertSchema = z.object({

    name: z.string().min(1,{message: "name is required"}),
    instruction :z.string().min(1,{message: "name is required"}),
})