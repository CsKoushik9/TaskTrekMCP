# TaskTrek MCP Server

A Model Context Protocol (MCP) server for TaskTrek project management system that enables AI assistants to interact with TaskTrek programmatically.

## Architecture Flow

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   AI Assistant      │◄──►│   TaskTrek MCP       │◄──►│   JSON Files        │
│   (Claude, Cline)   │    │   Server (stdio)     │    │   (Data Storage)    │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
                                      ▲                           ▲
                                      │                           │
                                      ▼                           ▼
                           ┌──────────────────────┐    ┌─────────────────────┐
                           │   MCP Tools          │    │   TaskTrek Web App  │
                           │   • create_task      │    │   (React Frontend)  │
                           │   • update_task      │    │   • Visual Interface│
                           │   • list_tasks       │    │   • Manual Editing  │
                           │   • summarize_tasks  │    │   • Analytics       │
                           │   • create_project   │    │   • Project Mgmt    │
                           │   • list_projects    │    └─────────────────────┘
                           │   • get_task         │
                           └──────────────────────┘
```

### Data Flow:
1. **AI Assistant** sends commands via MCP protocol
2. **MCP Server** processes requests and updates JSON files
3. **Web App** reads from same JSON files for visual interface
4. **Bidirectional Sync** - changes in either interface persist

### Usage Patterns:
- **AI-First**: Use MCP server for automated task management
- **Visual-First**: Use web app for manual task management
- **Hybrid**: Switch between both as needed - data stays synced

## Features

The TaskTrek MCP server provides the following tools:

### 1. `create_task`
Create a new task in TaskTrek with the following parameters:
- `title` (required): Task title
- `description`: Task description
- `projectId`: Project ID (defaults to "default")
- `type`: Task type (bug, feature, enhancement)
- `priority`: Task priority (low, medium, high, critical)
- `componentId`: Component ID
- `assigneeId`: Assignee ID
- `labels`: Array of task labels

### 2. `create_project`
Create a new project with:
- `name` (required): Project name
- `key` (required): Project key (e.g., "PROJ")
- `description`: Project description

### 3. `update_task`
Update an existing task:
- `taskId` (required): Task ID to update
- `title`: New task title
- `description`: New task description
- `status`: New task status (screen, in-progress, code-review, code-complete, qa-verify, resolved)
- `priority`: New task priority
- `componentId`: New component ID
- `assigneeId`: New assignee ID
- `labels`: New task labels

### 4. `list_projects`
Get list of all available projects.

### 5. `list_tasks`
Get list of all tasks with optional filtering:
- `projectId`: Filter by project ID
- `status`: Filter by status
- `assigneeId`: Filter by assignee ID

### 6. `get_task`
Get detailed information about a specific task:
- `taskId` (required): Task ID to retrieve

### 7. `summarize_tasks`
Get a summary of tasks with statistics:
- `projectId`: Filter by project ID (optional)

## Installation

1. Navigate to the TaskTrekMCP directory:
```bash
cd TaskTrekMCP
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running the Server

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

## Data Storage & Synchronization

The MCP server stores data in JSON files in the `../TaskTrek/data/` directory:
- `tasks.json`: All tasks
- `projects.json`: All projects  
- `components.json`: All components
- `assignees.json`: All assignees

### Sync Behavior:
- **MCP Server**: Writes directly to JSON files
- **Web App**: Reads from JSON files on startup
- **No Conflicts**: Both interfaces can be used independently
- **Data Persistence**: Changes made in either interface persist

### Running Both Interfaces:
```bash
# Terminal 1: Start MCP Server (for AI assistant)
cd TaskTrekMCP
npm start

# Terminal 2: Start Web App (for visual interface) - OPTIONAL
cd TaskTrek
npm start
```

**Note**: You don't need to run both simultaneously. Choose based on your workflow:
- **AI-only**: Just run MCP server
- **Visual-only**: Just run web app
- **Hybrid**: Run both and switch as needed

## Integration with MCP Clients

This server can be integrated with any MCP-compatible client. The server communicates via stdio and provides structured responses for all operations.

## Example Usage

### Creating a Task
```json
{
  "tool": "create_task",
  "arguments": {
    "title": "Fix login bug",
    "description": "Users cannot login with special characters in password",
    "type": "bug",
    "priority": "high",
    "projectId": "default"
  }
}
```

### Updating a Task Status
```json
{
  "tool": "update_task",
  "arguments": {
    "taskId": "1234567890",
    "status": "in-progress"
  }
}
```

### Getting Task Summary
```json
{
  "tool": "summarize_tasks",
  "arguments": {
    "projectId": "default"
  }
}
```

## Error Handling

The server provides detailed error messages for:
- Invalid task/project IDs
- Missing required parameters
- Validation errors
- File system errors

## License

MIT License