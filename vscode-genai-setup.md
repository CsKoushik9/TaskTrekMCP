# VS Code MCP Integration Setup

## Option 1: Cline Extension (Recommended)

### Step 1: Install Cline Extension
1. Open VS Code
2. Press `Ctrl+Shift+X` (Extensions)
3. Search "Cline"
4. Install "Cline" by Saoud Rizwan
5. Restart VS Code

### Step 2: Configure MCP Server
1. **Open Cline Settings:**
   - Press `Ctrl+Shift+P` (Command Palette)
   - Type "Cline: Open Settings"
   - OR click Cline icon in sidebar → Settings (gear icon)

2. **Add MCP Server Configuration:**
   - In Cline Settings UI, look for "MCP Servers" section
   - Click "Add MCP Server" or "Edit Configuration"
   - Add this configuration:
   ```json
   {
     "mcpServers": {
       "tasktrek": {
         "command": "node",
         "args": ["index.js"],
         "cwd": "d:/genAI/projects/TaskTrekMCP"
       }
     }
   }
   ```

3. **Alternative: Manual Config File:**
   - If UI doesn't work, create/edit:
   - Windows: `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings.json`
   - Mac: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings.json`

### Step 3: Start MCP Server
```bash
cd d:/genAI/projects/TaskTrekMCP
npm start
```

### Step 4: Test Integration
1. Open Cline chat (click Cline icon in sidebar)
2. Wait for "MCP servers connected" message
3. Try these commands:
   - "Create a task called 'Test from VS Code'"
   - "List all current tasks"
   - "Show me a summary of all tasks"

## Option 2: External Claude Desktop

1. **Download Claude Desktop:**
   - Visit: https://claude.ai/download
   - Install desktop app

2. **Configure MCP:**
   - Create config file at:
     - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
     - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

3. **Add TaskTrek Server:**
   ```json
   {
     "mcpServers": {
       "tasktrek": {
         "command": "node",
         "args": ["index.js"],
         "cwd": "d:/genAI/projects/TaskTrekMCP"
       }
     }
   }
   ```

## Test Commands

Once configured, try these commands:

- "Create a high priority bug task for login issues"
- "List all current tasks"
- "Show me a summary of all tasks"
- "Create a new project called 'Mobile App' with key 'MOB'"
- "Update task DEF-123 to in-progress status"