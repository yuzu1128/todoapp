import { expect, type Locator, type Page } from "@playwright/test";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

function formatCalendarMonth(date: Date): string {
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
}

function parseCalendarMonth(label: string | null): Date | null {
  if (!label) {
    return null;
  }

  const match = label.match(/(\d{4})年\s*(\d+)月/);

  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

function getMonthDiff(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

export function getFutureDate(offsetDays: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date;
}

export function getNextWeekday(targetWeekday: number, weeksAhead = 0): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);

  const currentWeekday = date.getDay();
  let diff = (targetWeekday - currentWeekday + 7) % 7;

  if (diff === 0) {
    diff = 7;
  }

  diff += weeksAhead * 7;
  date.setDate(date.getDate() + diff);
  return date;
}

export function getWeekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()];
}

export function getCalendarDayButton(page: Page, targetDate: Date): Locator {
  return page
    .getByTestId("calendar-view")
    .locator("button")
    .filter({ hasText: new RegExp(`^${targetDate.getDate()}$`) })
    .first();
}

export function getCalendarDayCell(page: Page, targetDate: Date): Locator {
  return getCalendarDayButton(page, targetDate).locator("..");
}

export async function ensureCalendarMonth(page: Page, targetDate: Date) {
  const targetMonth = formatCalendarMonth(targetDate);
  const calendar = page.getByTestId("calendar-view");
  const caption = calendar.getByRole("status");

  for (let step = 0; step < 24; step += 1) {
    const currentLabel = (await caption.textContent())?.trim() ?? null;

    if (currentLabel === targetMonth) {
      return;
    }

    const currentMonth = parseCalendarMonth(currentLabel);

    if (!currentMonth) {
      break;
    }

    const monthDiff = getMonthDiff(currentMonth, targetDate);
    const navButton =
      monthDiff > 0
        ? calendar.getByRole("button", { name: "Go to the Next Month" })
        : calendar.getByRole("button", { name: "Go to the Previous Month" });

    await navButton.click();
  }

  throw new Error(`Failed to navigate calendar to ${targetMonth}.`);
}

export async function selectCalendarDate(page: Page, targetDate: Date) {
  await ensureCalendarMonth(page, targetDate);
  await getCalendarDayButton(page, targetDate).click();
}

export async function gotoTab(
  page: Page,
  tab: "home" | "calendar" | "settings"
) {
  await page.getByTestId(`tab-${tab}`).click();
}

export async function openTaskDialog(page: Page) {
  await expect(page.getByTestId("open-add-task-dialog")).toBeEnabled({
    timeout: 15_000,
  });
  await page.getByTestId("open-add-task-dialog").click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

export async function addTask(page: Page, title: string) {
  await openTaskDialog(page);
  await page.getByTestId("task-title-input").fill(title);
  await page.getByTestId("submit-task-button").click();
  await expect(page.getByRole("dialog")).toBeHidden();
}
