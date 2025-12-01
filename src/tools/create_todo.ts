import { z } from "zod";
import { Todo } from "../schemas/types.js";
import { getFirestore } from "../lib/firestore.js";
import { todoFields } from "../schemas/todo.js";
import { arch } from "os";

export const createTodoInputSchema = {
  title: z.string().describe("Todo/Task text to add"),
  details: z.string().optional().describe("Optional. Todo/Task description with details. Max 20 words"),
  completed: z
    .boolean()
    .optional()
    .describe("Initial completed status. Default false"),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .describe("Optional ISO 8601 due date"),
  role: z
    .string()
    .describe("User defined role of the person who has to do this todo or task"),
  classification: z
    .enum(["circumstantial", "urgent", "important"])
    .default("important")
    .describe(`Required. Determined based on the nature of the task:
      - circumstantial: tasks that arise due to specific situations or events and has low or none aggregating value
      - urgent: tasks that require immediate attention
      - important: tasks that are significant and brings value to life, work or goals
    `),
};

export const singleTodoOutputSchema = {
  todo: z.object(todoFields).describe("The affected todo item"),
};

export type SingleTodoResult = z.infer<
  z.ZodObject<typeof singleTodoOutputSchema>
>;

export async function createTodoService(params: z.infer<z.ZodObject<typeof createTodoInputSchema>>): Promise<SingleTodoResult> {
  const db = getFirestore();
  const nowIso = new Date().toISOString();

  const docData = {
    title: params.title,
    details: params.details ?? "",
    completed: params.completed ?? false,
    createdAt: nowIso,
    updatedAt: nowIso,
    dueDate: params.dueDate ?? null,
    role: params.role,
    classification: params.classification,
    archived: false,
  };

  const ref = await db.collection(process.env.FIRESTORE_COLLECTION || "test").add(docData);
  const todo: Todo = {
    id: ref.id,
    ...docData,
  } satisfies Todo;

  return {
    todo,
  } satisfies SingleTodoResult;
}