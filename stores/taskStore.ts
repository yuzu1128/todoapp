import { create } from 'zustand';
import { taskRepository } from '../lib/db';
import type { Task } from '../lib/types';

interface TaskState {
  tasks: Task[];
  selectedDate: string;
}

interface TaskActions {
  setSelectedDate: (date: string) => void;
  addTask: (title: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  loadTasks: () => Promise<void>;
  loadTasksForDate: (date: string) => Promise<Task[]>;
}

type TaskStore = TaskState & TaskActions;

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedDate: getTodayDate(),

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },

  addTask: async (title: string) => {
    const { selectedDate } = get();
    await taskRepository.add({
      title,
      date: selectedDate,
      completed: false,
    });
    // Reload tasks for the selected date
    const updatedTasks = await taskRepository.getByDate(selectedDate);
    set({ tasks: updatedTasks });
  },

  toggleTask: async (id: string) => {
    await taskRepository.toggle(id);
    const { selectedDate } = get();
    const updatedTasks = await taskRepository.getByDate(selectedDate);
    set({ tasks: updatedTasks });
  },

  deleteTask: async (id: string) => {
    await taskRepository.delete(id);
    const { selectedDate } = get();
    const updatedTasks = await taskRepository.getByDate(selectedDate);
    set({ tasks: updatedTasks });
  },

  loadTasks: async () => {
    const { selectedDate } = get();
    const tasks = await taskRepository.getByDate(selectedDate);
    set({ tasks });
  },

  loadTasksForDate: async (date: string) => {
    const tasks = await taskRepository.getByDate(date);
    set({ tasks, selectedDate: date });
    return tasks;
  },
}));
