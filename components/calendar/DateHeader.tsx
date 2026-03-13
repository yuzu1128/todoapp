import * as React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DateHeaderProps {
  selectedDate: Date;
  onTodayClick: () => void;
}

export function DateHeader({ selectedDate, onTodayClick }: DateHeaderProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateNormalized = new Date(selectedDate);
  selectedDateNormalized.setHours(0, 0, 0, 0);

  const isToday =
    selectedDateNormalized.getTime() === today.getTime();

  const formattedDate = format(selectedDate, "M月d日（E）", { locale: ja });

  return (
    <div className="flex items-center justify-between px-3 py-4">
      <div>
        <h2 className="text-2xl font-semibold">{formattedDate}</h2>
        {isToday && (
          <span className="text-sm text-muted-foreground">今日</span>
        )}
      </div>
      {!isToday && (
        <Button variant="outline" size="sm" onClick={onTodayClick}>
          今日
        </Button>
      )}
    </div>
  );
}
