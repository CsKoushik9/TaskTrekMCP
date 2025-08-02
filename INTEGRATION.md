# TaskTrek MCP Server Integration Guide

## Overview

The TaskTrek MCP Server provides a Model Context Protocol interface to interact with the TaskTrek project management system. This allows AI assistants and other MCP clients to create, update, and manage tasks and projects programmatically.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Client    │◄──►│  TaskTrek MCP    │◄──►│   TaskTrek      │
│  (AI Assistant) │    │     Server       │    │   Web App       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   JSON Files     │
                       │  (Data Storage)  │
                       └──────────────────┘
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd TaskTrekMCP
npm install
```

### 2. Start the MCP Server

```bash
npm start
```

### 3. Configure MCP Client

Add the following configuration to your MCP client:

```json
{
  "mcpServers": {
    "tasktrek": {
      "command": "node",
      "args": ["index.js"],
      "cwd": "/path/to/TaskTrekMCP",
      "env": {}
    }
  }
}
```

## Available Tools

### Task Management

1. **create_task** - Create new tasks
2. **update_task** - Update existing tasks
3. **get_task** - Get detailed task information
4. **list_tasks** - List tasks with filtering options

### Project Management

5. **create_project** - Create new projects
6. **list_projects** - List all projects

### Analytics

7. **summarize_tasks** - Get task statistics and summaries

## Example Usage with AI Assistant

### Creating a Task

**User**: "Create a high-priority bug task for fixing the login issue in the frontend component"

**AI Assistant**: I'll create that task for you using the TaskTrek system.

```json
{
  "tool": "create_task",
  "arguments": {
    "title": "Fix login issue",
    "description": "Users are experiencing problems logging in with special characters in passwords",
    "type": "bug",
    "priority": "high",
    "componentId": "frontend"
  }
}
```

### Getting Project Status

**User**: "What's the current status of all tasks?"

**AI Assistant**: Let me get a summary of all tasks for you.

```json
{
  "tool": "summarize_tasks",
  "arguments": {}
}
```

### Updating Task Status

**User**: "Move task DEF-123 to code review"

**AI Assistant**: I'll update that task status for you.

```json
{
  "tool": "update_task",
  "arguments": {
    "taskId": "123",
    "status": "code-review"
  }
}
```

## Data Synchronization

The MCP server maintains data synchronization between:

1. **TaskTrek Web App** (localStorage) ↔ **JSON Files** ↔ **MCP Server**
2. Changes in the web app are automatically synced to JSON files
3. MCP server operations directly modify JSON files
4. Web app can load changes from JSON files on startup

## File Structure

```
TaskTrekMCP/
├── index.js           # Main MCP server
├── storage.js         # Data storage utilities
├── test.js           # Test script
├── cli-client.js     # CLI test client
├── package.json      # Dependencies
├── README.md         # Documentation
├── INTEGRATION.md    # This file
└── mcp-config.json   # MCP client configuration

TaskTrek/
├── data/             # JSON data files (created automatically)
│   ├── tasks.json
│   ├── projects.json
│   ├── components.json
│   └── assignees.json
└── src/
    ├── utils/
    │   └── api.js    # Sync utilities
    └── components/
        └── MCPStatus.js # MCP connection status
```

## Testing

### 1. Test Storage Functionality

```bash
cd TaskTrekMCP
npm test
```

### 2. Test with CLI Client

```bash
npm run client
```

### 3. Manual Testing

Start the server and send JSON-RPC requests via stdin:

```bash
node index.js
```

Then send requests like:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
```

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure the MCP server has write access to the data directory
2. **Port Conflicts**: The server uses stdio, so no port conflicts should occur
3. **Data Sync Issues**: Check that the TaskTrek web app has the API integration enabled

### Debug Mode

Run the server with debug output:

```bash
DEBUG=* node index.js
```

### Logs

Check the console output for:
- Server startup messages
- Tool execution logs
- Error messages

## Security Considerations

1. **File Access**: The MCP server requires read/write access to the data directory
2. **Input Validation**: All tool inputs are validated before processing
3. **Error Handling**: Errors are caught and returned as structured responses
4. **No Network Access**: The server operates entirely on local files

## Performance

- **Startup Time**: ~100ms
- **Tool Execution**: ~10-50ms per operation
- **Memory Usage**: ~20MB base + data size
- **File I/O**: Synchronous operations for data consistency

## Future Enhancements

1. **Real-time Sync**: WebSocket integration for live updates
2. **Database Support**: PostgreSQL/MySQL backend option
3. **Authentication**: User-based access control
4. **Webhooks**: External system notifications
5. **Backup/Restore**: Automated data backup functionality

## Support

For issues and questions:
1. Check the logs for error messages
2. Verify file permissions
3. Test with the CLI client
4. Review the integration documentation