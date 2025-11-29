import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  listTodosInputSchema,
  listTodosOutputSchema,
  ListTodosResult,
  listTodosService,
} from "./list_todos.js";
import { addTodoInputSchema, addTodoService } from "./create_todo.js";
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
    // Also return JSON string for backwards compatibility / human inspection
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
      title: "List todos",
      description:
        "List todo items from the user's Firestore 'todos' collection with optional filters.",
      inputSchema: listTodosInputSchema,
      outputSchema: listTodosOutputSchema,
    },
    async ({
      completed,
      limit,
    }): Promise<ReturnType<typeof buildStructuredResult<ListTodosResult>>> => {
      try {
        const result = await listTodosService({ completed, limit });
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

  // 2) add_todo
  server.registerTool(
    "add_todo",
    {
      title: "Add todo",
      description:
        "Add a new todo item to the user's Firestore 'todos' collection.",
      inputSchema: addTodoInputSchema,
      outputSchema: singleTodoOutputSchema,
    },
    async ({
      text,
      completed,
      dueDate,
      tags,
    }): Promise<ReturnType<typeof buildStructuredResult<SingleTodoResult>>> => {
      try {
        const result = await addTodoService({
          text,
          completed,
          dueDate,
          tags,
        });
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
              tags: [],
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
      title: "Update todo",
      description:
        "Update fields of an existing todo item (text, completed, dueDate, tags).",
      inputSchema: updateTodoInputSchema,
      outputSchema: singleTodoOutputSchema,
    },
    async ({
      id,
      text,
      completed,
      dueDate,
      tags,
    }): Promise<ReturnType<typeof buildStructuredResult<SingleTodoResult>>> => {
      try {
        const result = await updateTodoService({
          id,
          text,
          completed,
          dueDate,
          tags,
        });
        return buildStructuredResult<SingleTodoResult>(result);
      } catch (err) {
        return {
          structuredContent: {
            todo: {
              id,
              text: "",
              completed: false,
              createdAt: "",
              updatedAt: "",
              tags: [],
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
      title: "Delete todo",
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
