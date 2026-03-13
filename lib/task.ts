export const TASK_TITLE_MAX_LENGTH = 100;

export function getTaskTitleLength(title: string): number {
  return Array.from(title).length;
}

export function normalizeTaskTitle(title: string): string {
  return title.trim();
}

export function validateTaskTitle(title: string): string | null {
  const normalizedTitle = normalizeTaskTitle(title);

  if (!normalizedTitle) {
    return "タスク名を入力してください。";
  }

  if (getTaskTitleLength(normalizedTitle) > TASK_TITLE_MAX_LENGTH) {
    return `タスク名は${TASK_TITLE_MAX_LENGTH}文字以内で入力してください。`;
  }

  return null;
}
