import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const CREATE_TODO_FLOW_PROMPT = `
You are handling a request to add, create, or register a new task for the user.

1. If you need details about the task fields, load the todo-manager-spec resource.
2. If you need detailed creation rules, load the todo-manager-flow-rules resource and follow the "RULES WHEN CREATING TODOS" section strictly.

Then:
- Check for duplicates using list_todos as described in the creation rules.
- Clarify or infer role, dueDate, and classification.
- Suggest splitting the task if it is large or complex and create multiple tasks only after user approval.
- When everything is clear, call create_todo with the validated data.
- Finally, explain to the user what was created and why.
`.trim();

export const COMPLETE_TODO_FLOW_PROMPT = `
You are handling a request to mark a task as done, completed, finished, or similar.

1. If you need details about the task fields, load the todo-manager-spec resource.
2. If you need detailed completion rules, load the todo-manager-flow-rules resource and follow the "COMPLETING THE TASKS" section strictly.

Then:
- Use list_todos to find the correct task. If multiple tasks match, ask the user to choose one.
- If the task is fully completed, use complete_todo with:
  - completed = true
  - completionNotes if the user provides them
  - archived if the user wants the task out of the active list.
- If the task is only partially completed, follow the partial completion rules:
  - propose new tasks for remaining work
  - call create_todo for those new tasks after user approval
  - update the original task only as agreed with the user.
- Summarize the result to the user.
`.trim();

export function registerTodoPrompts(server: McpServer) {
  server.registerPrompt(
    "create-todo-guide",
    {
      title: "Create Todo Guide",
      description: "Guides for adding a new task, following todo manager rules.",
      argsSchema: {}, // no args required for now
    },
    () => ({
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: CREATE_TODO_FLOW_PROMPT,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "complete-todo-guide",
    {
      title: "Complete Task Guide",
      description: "Guide for completing or partially completing tasks.",
      argsSchema: {},
    },
    () => ({
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: COMPLETE_TODO_FLOW_PROMPT,
          },
        },
      ],
    }),
  );
}