import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTodoTools } from './tools/index.js';
import { registerTodoResources } from './resources.js';
import { registerTodoPrompts } from './prompts.js';

const server = new McpServer({
    name: 'todo-mcp',
    version: '0.1.1'
});

registerTodoTools(server)
registerTodoResources(server);
registerTodoPrompts(server);

export { server };