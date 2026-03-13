import { create } from 'zustand';

interface CalendarState {
  currentMonth: Date;
}

interface CalendarActions {
  setCurrentMonth: (month: Date) => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToToday: () => void;
}

type CalendarStore = CalendarState & CalendarActions;

export const useCalendarStore = create<CalendarStore>((set) => ({
  currentMonth: new Date(),

  setCurrentMonth: (month: Date) => {
    set({ currentMonth: month });
  },

  goToNextMonth: () => {
    set((state) => {
      const newDate = new Date(state.currentMonth);
      newDate.setMonth(newDate.getMonth() + 1);
      return { currentMonth: newDate };
    });
  },

  goToPrevMonth: () => {
    set((state) => {
      const newDate = new Date(state.currentMonth);
      newDate.setMonth(newDate.getMonth() - 1);
      return { currentMonth: newDate };
    });
  },

  goToToday: () => {
    set({ currentMonth: new Date() });
  },
}));
