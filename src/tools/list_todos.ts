import { z } from "zod";
import { todoFields } from "../schemas/todo.js";
import { Todo } from "../schemas/types.js";
import { getFirestore } from "../lib/firestore.js";

export const listTodosInputSchema = {
  completed: z
    .boolean()
    .optional()
    .describe("If set, filter todos by completion status"),
  archived: z
    .boolean()
    .optional()
    .describe("If set, filter todos by archived status"),
  from: z
    .string()
    .optional()
    .describe("Optional ISO 8601 date. If set, filter todos from this date (inclusive) based on createdAt"),
  to: z
    .string()
    .optional()
    .describe("Optional ISO 8601 date. If set, filter todos to this date (inclusive) based on updatedAt"),
  role: z
    .string()
    .optional()
    .describe("If set, filter todos by user role"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .describe("Maximum number of todos to return. Default 50"),
};

export const listTodosOutputSchema = {
  todos: z
    .array(z.object(todoFields))
    .describe("List of todos after applying filters."),
};

export type ListTodosResult = z.infer<
  z.ZodObject<typeof listTodosOutputSchema>
>;


export async function listTodosService(params: z.infer<z.ZodObject<typeof listTodosInputSchema>>): Promise<ListTodosResult> {
  const db = getFirestore();
  let query: FirebaseFirestore.Query = db.collection(process.env.FIRESTORE_COLLECTION || "test");
  const limit = params.limit ?? 50;

  if (typeof params.completed === "boolean") {
    query = query.where("completed", "==", params.completed);
  }

  if (typeof params.archived === "boolean") {
    query = query.where("archived", "==", params.archived);
  }

  if (typeof params.role === "string") {
    query = query.where("role", "==", params.role);
  }

  if (typeof params.from === "string") {
    query = query.where("createdAt", ">=", params.from);
  }
  
  if (typeof params.to === "string") {
    query = query.where("updatedAt", "<=", params.to);
  }

  query = query.orderBy("createdAt", "asc").limit(limit);

  const snap = await query.get();
  const todos: Todo[] = snap.docs.map((doc) => {
    const data = doc.data();
    // Ensure we always have our fields; fall back sensibly
    const nowIso = new Date().toISOString();
    return {
      id: doc.id,
      title: String(data.title ?? ""),
      details: String(data.details ?? ""),
      completed: Boolean(data.completed ?? false),
      createdAt: String(data.createdAt ?? nowIso),
      updatedAt: String(data.updatedAt ?? nowIso),
      dueDate: data.dueDate ? String(data.dueDate) : null,
      role: data.role ? String(data.role) : "user",
      classification: data.classification ? String(data.classification) as "circumstantial" | "urgent" | "important" : "important",
      archived: Boolean(data.archived ?? false),
    } satisfies Todo;
  });

  return {
    todos,
  } satisfies ListTodosResult;
}