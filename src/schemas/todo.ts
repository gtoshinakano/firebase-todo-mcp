import { z } from "zod";

export const todoBaseFields = {
  title: z.string().describe("Todo/Task title in a few words"),
  details: z.string().default("").describe("Todo/Task description with details. Max 20 words"),
  completed: z.boolean().describe("Whether the todo or task is completed"),
  createdAt: z
    .string()
    .describe("ISO 8601 timestamp when the todo was created"),
  updatedAt: z
    .string()
    .describe("ISO 8601 timestamp when the todo was last updated"),
  dueDate: z
    .string()
    .nullable()
    .describe("Optional ISO 8601 due date"),
  role: z
    .string()
    .default("user")
    .describe("User defined role of the person who has to do this todo or task"),
  completionNotes: z.string().optional().nullable().describe("Optional Completion notes. Only set when marking as completed"),
  classification: z
    .enum(["circumstantial", "urgent", "important"])
    .default("important")
    .describe("Must be provided at the time of task creation based on the nature of the task"),
};


export const todoFields = {
  id: z.string().describe("Document ID of the todo"),
  ...todoBaseFields,
};