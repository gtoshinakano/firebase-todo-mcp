import { z } from "zod";
import { Todo } from "../schemas/types.js";
import { getFirestore } from "../lib/firestore.js";
import { todoFields } from "../schemas/business.js";

export const addTodoInputSchema = {
  text: z.string().describe("Todo text to add."),
  completed: z
    .boolean()
    .optional()
    .describe("Initial completed status. Default false."),
  dueDate: z
    .string()
    .optional()
    .describe("Optional ISO 8601 due date."),
  tags: z
    .array(z.string())
    .optional()
    .describe("Optional list of tags/labels for this todo."),
};

export const singleTodoOutputSchema = {
  todo: z.object(todoFields).describe("The affected todo item."),
};

export type SingleTodoResult = z.infer<
  z.ZodObject<typeof singleTodoOutputSchema>
>;

export async function addTodoService(params: {
  text: string;
  completed?: boolean;
  dueDate?: string;
  tags?: string[];
}): Promise<SingleTodoResult> {
  const db = getFirestore();
  const nowIso = new Date().toISOString();

  const docData = {
    text: params.text,
    completed: params.completed ?? false,
    createdAt: nowIso,
    updatedAt: nowIso,
    dueDate: params.dueDate,
    tags: params.tags ?? [],
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