import Dexie, { Table } from "dexie";

import type { Task } from "../types";

/**
 * ToDoApp database schema
 */
class ToDoAppDatabase extends Dexie {
  tasks!: Table<Task, string>;

  constructor() {
    super("ToDoAppDB");
    this.version(1).stores({
      tasks: "id, date, completed, createdAt",
    });
  }
}

export const db = new ToDoAppDatabase();

/**
 * Task repository for IndexedDB operations
 */
export const taskRepository = {
  /**
   * Get the unique dates that have at least one task
   */
  async getTaskDates(): Promise<string[]> {
    const keys = await db.tasks.orderBy("date").uniqueKeys();
    return keys.map((key) => String(key));
  },

  /**
   * Get tasks for a specific date
   */
  async getByDate(date: string): Promise<Task[]> {
    return await db.tasks.where("date").equals(date).sortBy("createdAt");
  },

  /**
   * Add a new task
   */
  async add(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = Date.now();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    await db.tasks.add(newTask);
    return newTask.id;
  },

  /**
   * Update task completion status
   */
  async toggle(id: string): Promise<void> {
    const task = await db.tasks.get(id);

    if (task) {
      await db.tasks.update(id, {
        completed: !task.completed,
        updatedAt: Date.now(),
      });
    }
  },

  /**
   * Delete a task
   */
  async delete(id: string): Promise<void> {
    await db.tasks.delete(id);
  },
};
