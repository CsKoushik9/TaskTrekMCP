#!/usr/bin/env node

import { storage } from './storage.js';

// Test the storage functionality
console.log('Testing TaskTrek MCP Server Storage...\n');

// Test creating a project
const projects = storage.getProjects();
console.log('Default projects:', projects.length);

// Test creating a task
const tasks = storage.getTasks();
console.log('Current tasks:', tasks.length);

// Create a test task
const testTask = {
  id: Date.now().toString(),
  title: 'Test Task from MCP',
  description: 'This is a test task created by the MCP server',
  type: 'feature',
  priority: 'medium',
  status: 'screen',
  projectId: 'default',
  componentId: 'frontend',
  assigneeId: 'unassigned',
  labels: ['test', 'mcp'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

tasks.push(testTask);
storage.saveTasks(tasks);

console.log('Test task created:', testTask.id);
console.log('Total tasks now:', storage.getTasks().length);

console.log('\nMCP Server storage test completed successfully!');