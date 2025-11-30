import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTodoTools } from './tools/index.js';

const server = new McpServer({
    name: 'todo-mcp',
    version: '0.1.1'
});

registerTodoTools(server)

export { server };