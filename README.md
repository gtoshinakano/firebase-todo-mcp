# Firestore Todo List MCP Server
Connect any MCP Client like Claude, Open-WebUI and others to this MCP server to manage todos via AI chat in an opinionated way.

You can simply tell the model to `create_todo`, `list_todos`, `update_todo`, 'complete_todo' and `delete_todo`

You can setup a custom system prompt as well to get customized answers.

Works very well with Claude, OpenAI and Deepseek models (paid versions). Local models in Ollama also works, but with limitations.

Data is stored on Firebase Firestore because it is "free" for personal usage, easy to run, and easy to setup.

This is an experimental project I created just for learning purposes.

Feel free to try. 

## Getting Started

### Use the Firestore Todo MCP Server on Claude (and others)
Edit the `claude_desktop_config.json` or the mcp configuration file of your LLM client
```json
{
    "mcpServers": {
        "firestoreTodoMcp": {
            "command": "npx",
            "args": [
                "firestore-todo-mcp"
            ],
            "env": {
                "FIREBASE_SERVICE_ACCOUNT": "base64(serviceAccount.json)",
                "FIREBASE_PROJECT_ID": "your-firebase-project-id",
                "FIRESTORE_COLLECTION": "test_collection"
            },
            "type": "stdio"
        }
    }
}
```

Don't forget to setup your project on Firebase and to get the Firebase serviceAccount from the project's configuration.

The file content must be 'base64' encoded when passing the value to the json above.

## Development Mode

#### 1. Clone the repo
```bash
git clone https://github.com/gtoshinakano/firebase-todo-mcp.git
cd firebase-todo-mcp
```

#### 2.Run Firestore emulator
Install firebase-tools cli, do firebase login, install emulators and run
```bash
firebase emulators:start --only firestore --project local-todo-dev
```

#### 3.Testing on Inspector
Check if all tools are working fine, test input parameters, output params
```bash
npx @modelcontextprotocol/inspector \
    -e FIRESTORE_EMULATOR_HOST=localhost:3333 \
    -e FIREBASE_PROJECT_ID=local-todo-dev \
    -e FIRESTORE_COLLECTION=test_collection \
    tsx bin/index.ts
```

#### 4. (Optional) Build and Configure Claude mcp configuration locally
```json
{
    "mcpServers": {
    "firestore-todo": {
        "command": "node",
        "args": ["/absolute/path/to/dist/bin/index.js"],
        "env": {
        "FIRESTORE_EMULATOR_HOST": "localhost:3333",
        "FIREBASE_PROJECT_ID": "local-todo-dev",
        "FIRESTORE_COLLECTION": "test_collection"
        }
    }
    }
}
```
#### 5. Create a project with a system prompt from the example
Copy the contents of the system prompts from the path `example/`
`complete`: More effective, but token expensive
`short`: Shorter version for saving tokens. Works fine but less accurate

#### 6. Have fun with your new Task Manager ;)
Try chat like:
`Add the task XYZ. Due date tomorrow.`

You can be more specific and tell the situation:
`I forgot to talk to John regarding XYZ on Friday and I need this ASAP`

Or you can be broad and Claude will try to help you split the big task into smaller ones (doesn't work well with Ollama models :/):
`I need to create my XYZ Vague Project`