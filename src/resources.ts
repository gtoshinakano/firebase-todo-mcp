import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const TASK_SPEC = `
ABOUT THE TODO/TASK SPECIFICATION

Each TODO item has at least the following fields:

- id: Unique identifier of the task.
- title: Short, clear name of the task.
- details: Optional, summarized description of the task. May be null or empty.
- completed: Boolean status of the task:
  - true: task is done
  - false: task is pending
- dueDate: Optional ISO 8601 date string for the due date of the task. Defaults to null.
- archived: Boolean status that indicates whether the task has been archived and should not appear in the active list unless explicitly requested.
- role: The role of the user that has to do the task. Valid values:
  - personal: Task in the user’s private sphere.
  - professional: Task related to the user’s work.
  - project: Task related to the user’s personal project.
- completionNotes: Optional. Should be updated only if the user gives completion-related context that makes sense to be stored.
- classification: Required at time of task creation. Based on the nature of the task:
  - circumstantial: tasks that arise due to specific situations or events and have low or no aggregating value
  - urgent: tasks that require immediate attention
  - important: tasks that are significant and bring value to life, work, or goals

There may be additional fields on a task. When updating a task, you must preserve all existing fields that you are not explicitly changing.
`.trim();

export const TOOL_RULES = `
TASK MANAGER TOOL USAGE RULES

You interact with tasks only via the provided tools.

list_todos
- Use to search, filter, or review existing tasks.
- Supports filtering by:
  - date range (from, to) against dueDate or other supported dates
  - archived state
  - completion state
  - role
- Use list_todos before:
  - creating a new task (to check for duplicates in pending tasks)
  - updating or completing a task (to find the correct id)
  - archiving, restoring, or deleting a task (to confirm that it exists)

create_todo
- Use to create a new task after you have:
  - checked for duplicates in pending tasks using list_todos, and
  - clarified or inferred role, dueDate, and classification according to the creation rules.
- Ensure the title is correctly formatted and details are set according to the rules.

update_todo
- Use to change existing tasks, including:
  - marking tasks as completed or uncompleted
  - updating details, dueDate, role, or completionNotes
  - updating the archived flag (archive or restore a task)
- Always identify the correct task id using list_todos if there is any ambiguity.

complete_todo
- Use to complete a task directly by id.
- Accepts optional values for:
  - completionNotes: summarized completion-related context
  - archived: whether the task should be archived after completion
- Use complete_todo only after confirming the correct task via list_todos.

delete_todo
- Use to delete a task only when:
  - the user explicitly asks to remove it, and
  - you have confirmed the correct task via list_todos.
- Prefer archiving over deleting if the user simply wants it out of view but may need it as history.

GENERAL TOOL RULES
- Never fabricate tool effects. Only claim a task was created, updated, completed, archived, restored, or deleted if the corresponding tool call succeeded.
- When tool results are ambiguous (multiple similar tasks), ask the user to clarify which task they mean before acting.
- After any tool call that changes state, summarize the changes back to the user.
`.trim();

export const FLOW_RULES = `
TASK MANAGER FLOW RULES

RULES WHEN CREATING TODOS

1. Check for duplicates first
- Call list_todos to search pending (incomplete) tasks that may match the new task.
- If you find a pending task with the same or very similar meaning (even if the title text is not identical), inform the user that a similar task already exists and ask whether they still want to create a new one.
- Do not create the new task until the user confirms they want a duplicate.

2. Title formatting
- Always capitalize the first letter of all words in the task title.
- Example: Buy Coffee Filters

3. Details field
- If the user’s request is very short and lacks detail, set details to null or leave it blank.
- If the user provides more context about the task, summarize that context concisely and store it in details.

4. Role inference
- If the role is explicitly stated (for work, for my side project, for home), use the corresponding value: professional, project, or personal.
- If the role is not explicit, carefully infer it from the content of the task.
- If, after careful reasoning, the role is still unclear, ask the user which role applies before calling create_todo.

5. Due date
- dueDate can be null.
- If the task clearly has a deadline or sounds urgent (by tomorrow, before Friday, ASAP), ask the user for a specific due date before creating the task.
- If the user does not provide a due date after you ask, you may create the task with dueDate = null but state that no due date was set.

6. Classification inference
- If the classification is not explicit, carefully infer it from the content of the task.
- Only one of these 3 values is allowed:
  - circumstantial: occasional tasks that the user has to do but have low or no value to long term goals and ambitions, such as clean the house
  - urgent: tasks that require immediate attention due to close deadlines or risk of losses
  - important: tasks that are significant and bring value to life, work or personal goals

7. Large or complex tasks
- If the request describes a task that is broad, complex, or labor-intensive, suggest splitting it into at least two or three smaller, clearer tasks.
- Explain your proposed breakdown briefly.
- Only call create_todo for the split tasks after the user approves or adjusts your proposal.

After all clarifications (role, dueDate, classification, breakdown) are complete, call create_todo with the final, validated data.

COMPLETING THE TASKS

When the user says that a task is done or similar:

1. Find the task first
- Call list_todos to locate the task the user is referring to.
- If multiple tasks match, ask the user to choose the correct one.
- If no matching task is found, tell the user and ask whether they want to create a new task or clarify the existing one.

2. Mark the task as completed
- Once the correct task is identified, call complete_todo using the task id and set completed = true.
- If the user provides completion-related notes, summarize them and set completionNotes within the same complete_todo call.
- If the user requests to archive the task after completion, set archived = true via complete_todo.

3. Partial completion
- If the user says the task is only partially completed, do not mark the original task as fully completed unless they explicitly want that.
- Help the user by creating new task(s) for the remaining pending items:
  - Propose a clear breakdown of the remaining work.
  - After the user approves, call create_todo for the new tasks.
- If appropriate, update the original task via update_todo to clarify what was done and what remains, or mark it completed only when the user agrees.

4. Completion notes
- When the user adds context that is useful for future reference, summarize that context and store it via complete_todo or update_todo.
- Keep completionNotes concise, factual, and focused.
`.trim();

export function registerTodoResources(server: McpServer) {
  server.registerResource(
    "todo-manager-spec",
    "todo-manager://spec",
    {
      title: "Todo Manager Spec",
      description: "Field definitions and semantics for todo items.",
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: TASK_SPEC,
        },
      ],
    }),
  );
  server.registerResource(
    "todo-manager-tool-rules",
    "todo-manager://tool-rules",
    {
      title: "Todo Manager Tool Usage Rules",
      description: "When and how to use list_todos, create_todo, update_todo, complete_todo, delete_todo.",
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: TOOL_RULES,
        },
      ],
    }),
  );
  server.registerResource(
    "todo-manager-flow-rules",
    "todo-manager://flow-rules",
    {
      title: "Todo Manager Flow Rules",
      description: "Rules for creating, completing, and splitting tasks.",
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: FLOW_RULES,
        },
      ],
    }),
  );
}