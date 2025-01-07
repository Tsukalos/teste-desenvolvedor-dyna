import fs from 'fs';
import path from 'path';

interface Task {
  id: number;
  text: string;
  lang: string;
  summary: string | null;
}

export class TasksRepository {
  private tasks: Task[] = [];
  private currentId: number = 1;
  private filePath: string;

  constructor() {
    this.filePath = path.resolve(__dirname, 'tasks.json');
    this.loadTasks();
  }

  private loadTasks() {
    if (fs.existsSync(this.filePath)) {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      this.tasks = JSON.parse(data);
      const maxId = this.tasks.reduce((max, task) => (task.id > max ? task.id : max), 0);
      this.currentId = maxId + 1;
    }
  }

  private saveTasks() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.tasks, null, 2));
  }

  createTask(text: string, lang: string): Task {
    const task: Task = {
      id: this.currentId++,
      text,
      lang,
      summary: null
    };
    this.tasks.push(task);
    this.saveTasks();
    return task;
  }

  updateTask(id: number, summary: string): Task | null {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      this.tasks[taskIndex].summary = summary;
      this.saveTasks();
      return this.tasks[taskIndex];
    }
    return null;
  }

  getTaskById(id: number): Task | null {
    return this.tasks.find(t => t.id === id) || null;
  }

  getAllTasks(): Task[] {
    return this.tasks;
  }

  deleteTask(id: number): boolean {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      this.tasks.splice(taskIndex, 1);
      this.saveTasks();
      return true;
    }
    return false;
  }
}