/**
 * Task entity type definition
 */
interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export type { Task };
