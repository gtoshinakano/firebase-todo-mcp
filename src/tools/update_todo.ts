import { z } from "zod";
import { todoFields } from "../schemas/business.js";
import { Todo } from "../schemas/types.js";
import { getFirestore } from "../lib/firestore.js";

export const singleTodoOutputSchema = {
  todo: z.object(todoFields).describe("The affected todo item."),
};

export type SingleTodoResult = z.infer<
  z.ZodObject<typeof singleTodoOutputSchema>
>;

export const updateTodoInputSchema = {
  id: z.string().describe("ID of the todo to update."),
  text: z.string().optional().describe("New text (if updating)."),
  completed: z
    .boolean()
    .optional()
    .describe("New completed status (if updating)."),
  dueDate: z.string().optional().describe("New due date (if updating)."),
  tags: z
    .array(z.string())
    .optional()
    .describe("New list of tags (if updating)."),
};

export async function updateTodoService(params: {
  id: string;
  text?: string;
  completed?: boolean;
  dueDate?: string;
  tags?: string[];
}): Promise<SingleTodoResult> {
  const db = getFirestore();
  const ref = db.collection(process.env.FIRESTORE_COLLECTION || "test").doc(params.id);

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (typeof params.text !== "undefined") updates.text = params.text;
  if (typeof params.completed !== "undefined")
    updates.completed = params.completed;
  if (typeof params.dueDate !== "undefined") updates.dueDate = params.dueDate;
  if (typeof params.tags !== "undefined") updates.tags = params.tags;

  if (Object.keys(updates).length === 1) {
    // Only updatedAt set → nothing to change
    throw new Error("No fields provided to update.");
  }

  await ref.update(updates);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error(`Todo with id ${params.id} not found after update.`);
  }

  const data = snap.data()!;
  const todo: Todo = {
    id: snap.id,
    text: String(data.text ?? ""),
    completed: Boolean(data.completed ?? false),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
    dueDate: data.dueDate ? String(data.dueDate) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
  } satisfies Todo;

  return {
    todo,
  } satisfies SingleTodoResult;
}
