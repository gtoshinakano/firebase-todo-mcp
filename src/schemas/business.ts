import { z } from "zod";

export const todoBaseFields = {
  text: z.string().describe("Todo text / description"),
  completed: z.boolean().describe("Whether the todo is completed"),
  createdAt: z
    .string()
    .describe("ISO 8601 timestamp when the todo was created"),
  updatedAt: z
    .string()
    .describe("ISO 8601 timestamp when the todo was last updated"),
  dueDate: z
    .string()
    .optional()
    .describe("Optional ISO 8601 due date"),
  tags: z
    .array(z.string())
    .default([])
    .describe("Optional list of tags/labels"),
};


export const todoFields = {
  id: z.string().describe("Document ID of the todo"),
  ...todoBaseFields,
};