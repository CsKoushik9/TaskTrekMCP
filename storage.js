import fs from 'fs';
import path from 'path';

const STORAGE_PATH = path.join(process.cwd(), '..', 'TaskTrek', 'public', 'data');
const TASKS_FILE = path.join(STORAGE_PATH, 'tasks.json');
const PROJECTS_FILE = path.join(STORAGE_PATH, 'projects.json');
const COMPONENTS_FILE = path.join(STORAGE_PATH, 'components.json');
const ASSIGNEES_FILE = path.join(STORAGE_PATH, 'assignees.json');

// Ensure data directory exists
if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

const DEFAULT_PROJECTS = [
  { id: 'default', name: 'Default Project', description: 'Default project for tasks', key: 'DEF' }
];

const DEFAULT_COMPONENTS = [
  { id: 'frontend', name: 'Frontend', projectId: 'default' },
  { id: 'backend', name: 'Backend', projectId: 'default' },
  { id: 'database', name: 'Database', projectId: 'default' }
];

const DEFAULT_ASSIGNEES = [
  { id: 'unassigned', name: 'Unassigned', email: '' },
  { id: 'john', name: 'John Doe', email: 'john@example.com' },
  { id: 'jane', name: 'Jane Smith', email: 'jane@example.com' }
];

export const TASK_TYPES = {
  BUG: 'bug',
  FEATURE: 'feature',
  ENHANCEMENT: 'enhancement'
};

export const WORKFLOW_STATUSES = {
  SCREEN: 'screen',
  IN_PROGRESS: 'in-progress',
  CODE_REVIEW: 'code-review',
  CODE_COMPLETE: 'code-complete',
  QA_VERIFY: 'qa-verify',
  RESOLVED: 'resolved'
};

function readJsonFile(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const storage = {
  getTasks: () => readJsonFile(TASKS_FILE, []),
  saveTasks: (tasks) => writeJsonFile(TASKS_FILE, tasks),
  getProjects: () => readJsonFile(PROJECTS_FILE, DEFAULT_PROJECTS),
  saveProjects: (projects) => writeJsonFile(PROJECTS_FILE, projects),
  getComponents: () => readJsonFile(COMPONENTS_FILE, DEFAULT_COMPONENTS),
  saveComponents: (components) => writeJsonFile(COMPONENTS_FILE, components),
  getAssignees: () => readJsonFile(ASSIGNEES_FILE, DEFAULT_ASSIGNEES),
  saveAssignees: (assignees) => writeJsonFile(ASSIGNEES_FILE, assignees)
};