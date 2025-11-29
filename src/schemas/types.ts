// src/todoService.ts
import { z } from "zod";
import { todoFields } from "./business";

export type Todo = z.infer<z.ZodObject<typeof todoFields>>;
