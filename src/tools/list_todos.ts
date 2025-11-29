import { z } from "zod";
import { todoFields } from "../schemas/business.js";
import { Todo } from "../schemas/types.js";
import { getFirestore } from "../lib/firestore.js";

export const listTodosInputSchema = {
  completed: z
    .boolean()
    .optional()
    .describe("If set, filter todos by completion status."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .describe("Maximum number of todos to return. Default 50."),
};

export const listTodosOutputSchema = {
  todos: z
    .array(z.object(todoFields))
    .describe("List of todos after applying filters."),
};

export type ListTodosResult = z.infer<
  z.ZodObject<typeof listTodosOutputSchema>
>;


export async function listTodosService(params: {
  completed?: boolean;
  limit?: number;
}): Promise<ListTodosResult> {
  const db = getFirestore();
  let query: FirebaseFirestore.Query = db.collection(process.env.FIRESTORE_COLLECTION || "test");
  const limit = params.limit ?? 50;

  if (typeof params.completed === "boolean") {
    query = query.where("completed", "==", params.completed);
  }

  query = query.orderBy("createdAt", "asc").limit(limit);

  const snap = await query.get();
  const todos: Todo[] = snap.docs.map((doc) => {
    const data = doc.data();
    // Ensure we always have our fields; fall back sensibly
    const nowIso = new Date().toISOString();
    return {
      id: doc.id,
      text: String(data.text ?? ""),
      completed: Boolean(data.completed ?? false),
      createdAt: String(data.createdAt ?? nowIso),
      updatedAt: String(data.updatedAt ?? nowIso),
      dueDate: data.dueDate ? String(data.dueDate) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    } satisfies Todo;
  });

  return {
    todos,
  } satisfies ListTodosResult;
}