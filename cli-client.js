#!/usr/bin/env node

import { spawn } from 'child_process';
import { createInterface } from 'readline';

class TaskTrekMCPClient {
  constructor() {
    this.requestId = 1;
    this.server = null;
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('Starting TaskTrek MCP Server...');
    
    this.server = spawn('node', ['index.js'], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    this.server.stdout.on('data', (data) => {
      try {
        const response = JSON.parse(data.toString());
        console.log('\nResponse:', JSON.stringify(response, null, 2));
      } catch (error) {
        console.log('Raw response:', data.toString());
      }
    });

    // Initialize the server
    await this.sendRequest({
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'tasktrek-cli-client',
          version: '1.0.0'
        }
      }
    });

    this.showMenu();
  }

  async sendRequest(request) {
    return new Promise((resolve) => {
      this.server.stdin.write(JSON.stringify(request) + '\n');
      resolve();
    });
  }

  showMenu() {
    console.log('\n=== TaskTrek MCP Client ===');
    console.log('1. List Tools');
    console.log('2. Create Task');
    console.log('3. List Tasks');
    console.log('4. Create Project');
    console.log('5. List Projects');
    console.log('6. Get Task Summary');
    console.log('7. Exit');
    
    this.rl.question('\nSelect an option: ', (answer) => {
      this.handleMenuChoice(answer);
    });
  }

  async handleMenuChoice(choice) {
    switch (choice) {
      case '1':
        await this.listTools();
        break;
      case '2':
        await this.createTask();
        break;
      case '3':
        await this.listTasks();
        break;
      case '4':
        await this.createProject();
        break;
      case '5':
        await this.listProjects();
        break;
      case '6':
        await this.getTaskSummary();
        break;
      case '7':
        this.exit();
        return;
      default:
        console.log('Invalid option');
    }
    
    setTimeout(() => this.showMenu(), 1000);
  }

  async listTools() {
    await this.sendRequest({
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/list'
    });
  }

  async createTask() {
    this.rl.question('Task title: ', async (title) => {
      this.rl.question('Task description: ', async (description) => {
        await this.sendRequest({
          jsonrpc: '2.0',
          id: this.requestId++,
          method: 'tools/call',
          params: {
            name: 'create_task',
            arguments: {
              title,
              description,
              type: 'feature',
              priority: 'medium'
            }
          }
        });
      });
    });
  }

  async listTasks() {
    await this.sendRequest({
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: 'list_tasks',
        arguments: {}
      }
    });
  }

  async createProject() {
    this.rl.question('Project name: ', async (name) => {
      this.rl.question('Project key: ', async (key) => {
        await this.sendRequest({
          jsonrpc: '2.0',
          id: this.requestId++,
          method: 'tools/call',
          params: {
            name: 'create_project',
            arguments: {
              name,
              key,
              description: `Project ${name}`
            }
          }
        });
      });
    });
  }

  async listProjects() {
    await this.sendRequest({
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: 'list_projects',
        arguments: {}
      }
    });
  }

  async getTaskSummary() {
    await this.sendRequest({
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: 'summarize_tasks',
        arguments: {}
      }
    });
  }

  exit() {
    console.log('Goodbye!');
    if (this.server) {
      this.server.kill();
    }
    this.rl.close();
    process.exit(0);
  }
}

const client = new TaskTrekMCPClient();
client.start().catch(console.error);