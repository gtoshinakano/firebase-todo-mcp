import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTodoTools } from './tools/index.js';

const server = new McpServer({
    name: 'example-server',
    version: '1.0.0'
});

registerTodoTools(server)

export { server };