# 1.Run Firestore emulator
```terminal
firebase emulators:start --only firestore --project local-todo-dev
```

# 2.Run Inspector

```terminal
npx @modelcontextprotocol/inspector \
    -e FIRESTORE_EMULATOR_HOST=localhost:3333 \
    -e FIREBASE_PROJECT_ID=local-todo-dev \
    -e FIRESTORE_COLLECTION=test_collection \
    tsx bin/index.ts
```

# 3. Configure Claude mcp configuration file
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