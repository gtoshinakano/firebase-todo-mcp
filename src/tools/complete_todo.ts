import { z } from "zod";
import { todoFields } from "../schemas/todo.js";
import { Todo } from "../schemas/types.js";
import { getFirestore } from "../lib/firestore.js";
import { ar } from "zod/v4/locales";
import { arch } from "os";

export const completeTodoOutputSchema = {
  todo: z.object(todoFields).describe("The affected todo item"),
};

export type CompleteTodoResult = z.infer<
  z.ZodObject<typeof completeTodoOutputSchema>
>;

export const completeTodoInputSchema = {
  id: z.string().describe("Required. ID of the todo to complete"),
  archive: z
    .boolean()
    .optional()
    .describe("If set to true, archive the todo upon completion"),
  completionNotes: z
    .string()
    .optional()
    .nullable()
    .describe("Optional completion notes to attach when marking completed"),
};

export async function completeTodoService(
  params: z.infer<z.ZodObject<typeof completeTodoInputSchema>>
): Promise<CompleteTodoResult> {
  const db = getFirestore();
  const ref = db
    .collection(process.env.FIRESTORE_COLLECTION || "test")
    .doc(params.id);

  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
    completed: true,
  };

  if (typeof params.completionNotes !== "undefined") {
    updates.completionNotes = params.completionNotes;
  }
  if (params.archive === true) {
    updates.archived = true;
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
    classification: data.classification
      ? (String(data.classification) as
          | "circumstantial"
          | "urgent"
          | "important")
      : "important",
    archived: Boolean(data.archived ?? false),
  } satisfies Todo;

  return {
    todo,
  } satisfies CompleteTodoResult;
}
