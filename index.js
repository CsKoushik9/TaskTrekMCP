#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { storage, TASK_TYPES, WORKFLOW_STATUSES } from './storage.js';

const server = new Server(
  {
    name: 'tasktrek-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_task',
        description: 'Create a new task in TaskTrek',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Task title' },
            description: { type: 'string', description: 'Task description' },
            projectId: { type: 'string', description: 'Project ID (optional, defaults to "default")' },
            type: { type: 'string', enum: Object.values(TASK_TYPES), description: 'Task type' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], description: 'Task priority' },
            componentId: { type: 'string', description: 'Component ID (optional)' },
            assigneeId: { type: 'string', description: 'Assignee ID (optional)' },
            labels: { type: 'array', items: { type: 'string' }, description: 'Task labels' }
          },
          required: ['title']
        }
      },
      {
        name: 'create_project',
        description: 'Create a new project in TaskTrek',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Project name' },
            description: { type: 'string', description: 'Project description' },
            key: { type: 'string', description: 'Project key (e.g., PROJ)' }
          },
          required: ['name', 'key']
        }
      },
      {
        name: 'update_task',
        description: 'Update an existing task',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: { type: 'string', description: 'Task ID to update' },
            title: { type: 'string', description: 'New task title' },
            description: { type: 'string', description: 'New task description' },
            status: { type: 'string', enum: Object.values(WORKFLOW_STATUSES), description: 'New task status' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], description: 'New task priority' },
            componentId: { type: 'string', description: 'New component ID' },
            assigneeId: { type: 'string', description: 'New assignee ID' },
            labels: { type: 'array', items: { type: 'string' }, description: 'New task labels' }
          },
          required: ['taskId']
        }
      },
      {
        name: 'list_projects',
        description: 'Get list of all projects',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'list_tasks',
        description: 'Get list of all tasks with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'Filter by project ID' },
            status: { type: 'string', enum: Object.values(WORKFLOW_STATUSES), description: 'Filter by status' },
            assigneeId: { type: 'string', description: 'Filter by assignee ID' }
          }
        }
      },
      {
        name: 'get_task',
        description: 'Get detailed information about a specific task',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: { type: 'string', description: 'Task ID to retrieve' }
          },
          required: ['taskId']
        }
      },
      {
        name: 'summarize_tasks',
        description: 'Get a summary of tasks with statistics',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'Filter by project ID (optional)' }
          }
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_task':
        return await createTask(args);
      case 'create_project':
        return await createProject(args);
      case 'update_task':
        return await updateTask(args);
      case 'list_projects':
        return await listProjects();
      case 'list_tasks':
        return await listTasks(args);
      case 'get_task':
        return await getTask(args);
      case 'summarize_tasks':
        return await summarizeTasks(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ]
    };
  }
});

async function createTask(args) {
  const tasks = storage.getTasks();
  const projects = storage.getProjects();
  const components = storage.getComponents();
  const assignees = storage.getAssignees();

  const projectId = args.projectId || 'default';
  const project = projects.find(p => p.id === projectId || p.key === projectId);
  if (!project) {
    const availableProjects = projects.map(p => `${p.name} (${p.key}, ID: ${p.id})`).join(', ');
    throw new Error(`Project with ID/Key '${projectId}' not found. Available projects: ${availableProjects}`);
  }

  const task = {
    id: Date.now().toString(),
    title: args.title,
    description: args.description || '',
    type: args.type || TASK_TYPES.FEATURE,
    priority: args.priority || 'medium',
    status: WORKFLOW_STATUSES.SCREEN,
    projectId,
    componentId: args.componentId || components.find(c => c.projectId === projectId)?.id || 'frontend',
    assigneeId: args.assigneeId || 'unassigned',
    labels: args.labels || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tasks.push(task);
  storage.saveTasks(tasks);

  return {
    content: [
      {
        type: 'text',
        text: `Task created successfully!\n\nTask ID: ${task.id}\nTitle: ${task.title}\nProject: ${project.name} (${project.key})\nStatus: ${task.status}\nPriority: ${task.priority}`
      }
    ]
  };
}

async function createProject(args) {
  const projects = storage.getProjects();
  
  const existingProject = projects.find(p => p.key.toUpperCase() === args.key.toUpperCase());
  if (existingProject) {
    throw new Error(`Project with key ${args.key} already exists`);
  }

  const project = {
    id: Date.now().toString(),
    name: args.name,
    description: args.description || '',
    key: args.key.toUpperCase()
  };

  projects.push(project);
  storage.saveProjects(projects);

  return {
    content: [
      {
        type: 'text',
        text: `Project created successfully!\n\nProject ID: ${project.id}\nName: ${project.name}\nKey: ${project.key}\nDescription: ${project.description}`
      }
    ]
  };
}

async function updateTask(args) {
  const tasks = storage.getTasks();
  const taskIndex = tasks.findIndex(t => t.id === args.taskId);
  
  if (taskIndex === -1) {
    throw new Error(`Task with ID ${args.taskId} not found`);
  }

  const task = tasks[taskIndex];
  const updatedTask = {
    ...task,
    ...(args.title && { title: args.title }),
    ...(args.description && { description: args.description }),
    ...(args.status && { status: args.status }),
    ...(args.priority && { priority: args.priority }),
    ...(args.componentId && { componentId: args.componentId }),
    ...(args.assigneeId && { assigneeId: args.assigneeId }),
    ...(args.labels && { labels: args.labels }),
    updatedAt: new Date().toISOString()
  };

  tasks[taskIndex] = updatedTask;
  storage.saveTasks(tasks);

  return {
    content: [
      {
        type: 'text',
        text: `Task updated successfully!\n\nTask ID: ${updatedTask.id}\nTitle: ${updatedTask.title}\nStatus: ${updatedTask.status}\nPriority: ${updatedTask.priority}`
      }
    ]
  };
}

async function listProjects() {
  const projects = storage.getProjects();
  
  // Debug logging
  console.error(`[DEBUG] listProjects called - found ${projects.length} projects`);
  console.error(`[DEBUG] Projects: ${JSON.stringify(projects.map(p => ({id: p.id, name: p.name, key: p.key})))}`);
  
  const projectList = projects.map(p => 
    `• ${p.name} (${p.key}) - ID: ${p.id}\n  ${p.description || 'No description'}`
  ).join('\n\n');

  const result = {
    content: [
      {
        type: 'text',
        text: `Available Projects (${projects.length}):\n\n${projectList}\n\nTo create a task, use either the project ID or key. For example:\n- projectId: "default" or "1754130012424"\n- projectId: "DEF" or "TREK"`
      }
    ]
  };
  
  console.error(`[DEBUG] Returning result with ${result.content[0].text.length} characters`);
  return result;
}

async function listTasks(args = {}) {
  let tasks = storage.getTasks();
  const projects = storage.getProjects();
  const assignees = storage.getAssignees();

  // Apply filters
  if (args.projectId) {
    tasks = tasks.filter(t => t.projectId === args.projectId);
  }
  if (args.status) {
    tasks = tasks.filter(t => t.status === args.status);
  }
  if (args.assigneeId) {
    tasks = tasks.filter(t => t.assigneeId === args.assigneeId);
  }

  if (tasks.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: 'No tasks found matching the criteria.'
        }
      ]
    };
  }

  const taskList = tasks.map(task => {
    const project = projects.find(p => p.id === task.projectId);
    const assignee = assignees.find(a => a.id === task.assigneeId);
    
    return `• ${project?.key || 'DEF'}-${task.id}: ${task.title}
  Status: ${task.status} | Priority: ${task.priority}
  Assignee: ${assignee?.name || 'Unassigned'}
  Created: ${new Date(task.createdAt).toLocaleDateString()}`;
  }).join('\n\n');

  return {
    content: [
      {
        type: 'text',
        text: `Tasks (${tasks.length}):\n\n${taskList}`
      }
    ]
  };
}

async function getTask(args) {
  const tasks = storage.getTasks();
  const projects = storage.getProjects();
  const components = storage.getComponents();
  const assignees = storage.getAssignees();

  const task = tasks.find(t => t.id === args.taskId);
  if (!task) {
    throw new Error(`Task with ID ${args.taskId} not found`);
  }

  const project = projects.find(p => p.id === task.projectId);
  const component = components.find(c => c.id === task.componentId);
  const assignee = assignees.find(a => a.id === task.assigneeId);

  const taskDetails = `Task Details:

ID: ${project?.key || 'DEF'}-${task.id}
Title: ${task.title}
Description: ${task.description || 'No description'}

Project: ${project?.name || 'Unknown'} (${project?.key || 'DEF'})
Component: ${component?.name || 'Unknown'}
Type: ${task.type}
Status: ${task.status}
Priority: ${task.priority}
Assignee: ${assignee?.name || 'Unassigned'}

Labels: ${task.labels?.length ? task.labels.join(', ') : 'None'}

Created: ${new Date(task.createdAt).toLocaleString()}
Updated: ${new Date(task.updatedAt).toLocaleString()}`;

  return {
    content: [
      {
        type: 'text',
        text: taskDetails
      }
    ]
  };
}

async function summarizeTasks(args = {}) {
  let tasks = storage.getTasks();
  const projects = storage.getProjects();

  if (args.projectId) {
    tasks = tasks.filter(t => t.projectId === args.projectId);
  }

  const statusCounts = {};
  const priorityCounts = {};
  const typeCounts = {};

  Object.values(WORKFLOW_STATUSES).forEach(status => {
    statusCounts[status] = 0;
  });

  ['low', 'medium', 'high', 'critical'].forEach(priority => {
    priorityCounts[priority] = 0;
  });

  Object.values(TASK_TYPES).forEach(type => {
    typeCounts[type] = 0;
  });

  tasks.forEach(task => {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
    typeCounts[task.type] = (typeCounts[task.type] || 0) + 1;
  });

  const completionRate = tasks.length > 0 ? 
    Math.round((statusCounts[WORKFLOW_STATUSES.RESOLVED] / tasks.length) * 100) : 0;

  const summary = `Task Summary${args.projectId ? ` for Project ${args.projectId}` : ''}:

Total Tasks: ${tasks.length}
Completion Rate: ${completionRate}%

Status Breakdown:
• Screen: ${statusCounts.screen}
• In Progress: ${statusCounts['in-progress']}
• Code Review: ${statusCounts['code-review']}
• Code Complete: ${statusCounts['code-complete']}
• QA Verify: ${statusCounts['qa-verify']}
• Resolved: ${statusCounts.resolved}

Priority Breakdown:
• Critical: ${priorityCounts.critical}
• High: ${priorityCounts.high}
• Medium: ${priorityCounts.medium}
• Low: ${priorityCounts.low}

Type Breakdown:
• Bug: ${typeCounts.bug}
• Feature: ${typeCounts.feature}
• Enhancement: ${typeCounts.enhancement}`;

  return {
    content: [
      {
        type: 'text',
        text: summary
      }
    ]
  };
}

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TaskTrek MCP server running on stdio');
}

runServer().catch(console.error);