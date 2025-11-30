import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  listTodosInputSchema,
  listTodosOutputSchema,
  ListTodosResult,
  listTodosService,
} from "./list_todos.js";
import { createTodoInputSchema, createTodoService } from "./create_todo.js";
import {
  deleteTodoInputSchema,
  deleteTodoOutputSchema,
  DeleteTodoResult,
  deleteTodoService,
} from "./delete_todo.js";
import {
  singleTodoOutputSchema,
  SingleTodoResult,
  updateTodoInputSchema,
  updateTodoService,
} from "./update_todo.js";

function buildStructuredResult<T extends object>(
  data: T
): {
  structuredContent: T;
  content: { type: "text"; text: string }[];
  isError: boolean;
} {
  return {
    structuredContent: data,
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
    isError: false,
  };
}

export function registerTodoTools(server: McpServer) {
  // 1) list_todos
  server.registerTool(
    "list_todos",
    {
      title: "List todos/tasks",
      description:
        "List todo items from the user's 'todos' store with optional filters.",
      inputSchema: listTodosInputSchema,
      outputSchema: listTodosOutputSchema,
    },
    async (
      params
    ): Promise<ReturnType<typeof buildStructuredResult<ListTodosResult>>> => {
      try {
        const result = await listTodosService(params);
        return buildStructuredResult<ListTodosResult>(result);
      } catch (err) {
        return {
          structuredContent: {
            todos: [],
          } as ListTodosResult,
          content: [
            {
              type: "text",
              text: `Error listing todos: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 2) create_todo
  server.registerTool(
    "create_todo",
    {
      title: "Create todo/task",
      description: "Add a new todo/task item to the user's store",
      inputSchema: createTodoInputSchema,
      outputSchema: singleTodoOutputSchema,
    },
    async (
      params
    ): Promise<ReturnType<typeof buildStructuredResult<SingleTodoResult>>> => {
      try {
        const result = await createTodoService(params);
        return buildStructuredResult<SingleTodoResult>(result);
      } catch (err) {
        return {
          structuredContent: {
            // Dummy object just to conform to schema when error
            todo: {
              id: "",
              text: "",
              completed: false,
              createdAt: "",
              updatedAt: "",
              role: [],
            },
          } as unknown as SingleTodoResult,
          content: [
            {
              type: "text",
              text: `Error adding todo: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 3) update_todo
  server.registerTool(
    "update_todo",
    {
      title: "Update todo/task",
      description:
        "Update fields of an existing todo item (text, completed, dueDate, role).",
      inputSchema: updateTodoInputSchema,
      outputSchema: singleTodoOutputSchema,
    },
    async (
      params
    ): Promise<ReturnType<typeof buildStructuredResult<SingleTodoResult>>> => {
      try {
        const result = await updateTodoService(params);
        return buildStructuredResult<SingleTodoResult>(result);
      } catch (err) {
        return {
          structuredContent: {
            todo: {
              id: params.id,
              text: "",
              completed: false,
              createdAt: "",
              updatedAt: "",
              role: "",
            },
          } as unknown as SingleTodoResult,
          content: [
            {
              type: "text",
              text: `Error updating todo: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 4) delete_todo
  server.registerTool(
    "delete_todo",
    {
      title: "Delete todo/task",
      description:
        "Delete a todo item from the user's Firestore 'todos' collection by id.",
      inputSchema: deleteTodoInputSchema,
      outputSchema: deleteTodoOutputSchema,
    },
    async ({
      id,
    }): Promise<ReturnType<typeof buildStructuredResult<DeleteTodoResult>>> => {
      try {
        const result = await deleteTodoService({ id });
        return buildStructuredResult<DeleteTodoResult>(result);
      } catch (err) {
        return {
          structuredContent: {
            deletedId: id,
          } as DeleteTodoResult,
          content: [
            {
              type: "text",
              text: `Error deleting todo: ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
