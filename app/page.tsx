"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

import { useTaskStore } from "@/stores/taskStore";
import { useCalendarStore } from "@/stores/calendarStore";

import { CalendarView } from "@/components/calendar/CalendarView";
import { DateHeader } from "@/components/calendar/DateHeader";
import { TaskList } from "@/components/task/TaskList";
import { AddTaskDialog } from "@/components/task/AddTaskDialog";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { tasks, selectedDate, setSelectedDate, addTask, toggleTask, deleteTask, loadTasks } = useTaskStore();
  const { currentMonth, setCurrentMonth } = useCalendarStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasksWithDates, setTasksWithDates] = useState<Set<string>>(new Set());

  // Load all tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Update tasksWithDates when tasks change
  useEffect(() => {
    const dates = new Set(tasks.map((task) => task.date));
    setTasksWithDates(dates);
  }, [tasks]);

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    setCurrentMonth(date);
  };

  const handleAddTask = async (title: string) => {
    await addTask(title);
  };

  const handleToggleTask = async (id: string) => {
    await toggleTask(id);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
  };

  const handleTodayClick = () => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    setSelectedDate(todayStr);
    setCurrentMonth(today);
  };

  const selectedDateObj = new Date(selectedDate);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4">
          <h1 className="text-xl font-bold text-center">ToDoApp</h1>
        </div>

        {/* Calendar */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <CalendarView
              onDateSelect={handleDateSelect}
              tasksWithDates={tasksWithDates}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </CardContent>
        </Card>

        {/* Date Header */}
        <DateHeader
          selectedDate={selectedDateObj}
          onTodayClick={handleTodayClick}
        />

        {/* Task List */}
        <Card className="flex-1 border-0 shadow-sm">
          <CardContent className="p-4">
            <TaskList
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          </CardContent>
        </Card>

        {/* Add Task Button */}
        <div className="p-4">
          <Button
            className="w-full"
            size="lg"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            タスクを追加
          </Button>
        </div>

        {/* Add Task Dialog */}
        <AddTaskDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onAddTask={handleAddTask}
        />
      </div>
    </main>
  );
}
