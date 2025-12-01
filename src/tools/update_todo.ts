import { z } from "zod";
import { todoFields } from "../schemas/todo.js";
import { Todo } from "../schemas/types.js";
import { getFirestore } from "../lib/firestore.js";

export const singleTodoOutputSchema = {
  todo: z.object(todoFields).describe("The affected todo item"),
};

export type SingleTodoResult = z.infer<
  z.ZodObject<typeof singleTodoOutputSchema>
>;

export const updateTodoInputSchema = {
  id: z.string().describe("Required. ID of the todo to update"),
  title: z.string().optional().describe("New title (if updating)"),
  details: z.string().optional().describe("New details (if updating)"),
  completed: z
    .boolean()
    .optional()
    .describe("New completed status (if updating)"),
  dueDate: z.string().optional().nullable().describe("New due date (if updating)"),
  completionNotes: z.string().optional().nullable().describe("Completion notes (if provided). Only update when marking as completed."),
  role: z
    .string()
    .optional()
    .describe("New role (if updating). Cannot be empty string"),
  classification: z
    .enum(["circumstantial", "urgent", "important"])
    .optional()
    .default("important")
    .describe("Must be provided at the time of task creation based on the nature of the task"),
};

export async function updateTodoService(params: z.infer<z.ZodObject<typeof updateTodoInputSchema>>): Promise<SingleTodoResult> {
  const db = getFirestore();
  const ref = db.collection(process.env.FIRESTORE_COLLECTION || "test").doc(params.id);

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (typeof params.title !== "undefined") updates.title = params.title;
  if (typeof params.details !== "undefined") updates.details = params.details;
  if (typeof params.completed !== "undefined") updates.completed = params.completed;
  if (typeof params.dueDate !== "undefined") updates.dueDate = params.dueDate;
  if (typeof params.completionNotes !== "undefined") updates.completionNotes = params.completionNotes;
  if (typeof params.role !== "undefined") updates.role = params.role;

  if (Object.keys(updates).length === 1) {
    // Only updatedAt set → nothing to change
    throw new Error("No fields provided to update");
  }

  await ref.update(updates);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new Error(`Todo with id ${params.id} not found after update.`);
  }

  const data = snap.data()!;
  const todo: Todo = {
    id: snap.id,
    title: String(data.title ?? ""),
    details: String(data.details ?? ""),
    completed: Boolean(data.completed ?? false),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
    completionNotes: data.completionNotes ? String(data.completionNotes) : "",
    dueDate: data.dueDate ? String(data.dueDate) : null,
    role: data.role ? String(data.role) : "user",
    classification: data.classification ? String(data.classification) as "circumstantial" | "urgent" | "important" : "important",
    archived: Boolean(data.archived ?? false),
  } satisfies Todo;

  return {
    todo,
  } satisfies SingleTodoResult;
}
