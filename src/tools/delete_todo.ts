import { z } from "zod";
import { getFirestore } from "../lib/firestore.js";

export const deleteTodoInputSchema = {
  id: z.string().describe("ID of the todo to delete"),
};

export const deleteTodoOutputSchema = {
  deletedId: z.string().describe("ID of the deleted todo item"),
};

export type DeleteTodoResult = z.infer<
  z.ZodObject<typeof deleteTodoOutputSchema>
>;

export async function deleteTodoService(params: {
  id: string;
}): Promise<DeleteTodoResult> {
  const db = getFirestore();
  const ref = db.collection(process.env.FIRESTORE_COLLECTION || "test").doc(params.id);
  await ref.delete();

  return {
    deletedId: params.id,
  } satisfies DeleteTodoResult;
}
