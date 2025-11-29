#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "../src/server.js";

export async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer()