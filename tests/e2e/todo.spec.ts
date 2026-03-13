import { expect, test } from "@playwright/test";

import {
  addTask,
  getCalendarDayCell,
  getCalendarDayButton,
  getFutureDate,
  openTaskDialog,
  selectCalendarDate,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ToDoApp" })).toBeVisible();
  await expect(page.getByTestId("calendar-view")).toBeVisible();
});

test("renders the dashboard and can jump back to today after changing dates", async ({
  page,
}) => {
  const futureDate = getFutureDate(2);

  await selectCalendarDate(page, futureDate);

  await expect(page.getByRole("button", { name: "今日へ戻る" })).toBeVisible();

  await page.getByRole("button", { name: "今日へ戻る" }).click();

  await expect(page.getByRole("button", { name: "今日へ戻る" })).toHaveCount(0);
});

test("validates whitespace-only and over-limit task titles", async ({ page }) => {
  await openTaskDialog(page);

  await page.getByTestId("task-title-input").fill("   ");
  await expect(page.getByTestId("task-title-feedback")).toHaveText(
    "タスク名を入力してください。"
  );
  await expect(page.getByTestId("submit-task-button")).toBeDisabled();

  await page.getByTestId("task-title-input").fill("a".repeat(101));
  await expect(page.getByTestId("task-title-feedback")).toHaveText(
    "タスク名は100文字以内で入力してください。"
  );
  await expect(page.getByTestId("submit-task-button")).toBeDisabled();

  await page.getByTestId("task-title-input").fill("a".repeat(100));
  await expect(page.getByTestId("task-title-feedback")).toHaveText(
    "空白のみの入力は保存されません。"
  );
  await expect(page.getByTestId("submit-task-button")).toBeEnabled();
});

test("creates a task and keeps it after reload via IndexedDB", async ({ page }) => {
  const futureDate = getFutureDate(3);

  await selectCalendarDate(page, futureDate);
  await addTask(page, "IndexedDB persistence");

  await expect(page.getByTestId("active-task-section")).toContainText(
    "IndexedDB persistence"
  );
  await expect(getCalendarDayCell(page, futureDate)).toHaveClass(
    /rdp-day_has-tasks/
  );

  await page.reload();
  await expect(page.getByRole("heading", { name: "ToDoApp" })).toBeVisible();

  await selectCalendarDate(page, futureDate);
  await expect(page.getByTestId("active-task-section")).toContainText(
    "IndexedDB persistence"
  );
  await expect(getCalendarDayCell(page, futureDate)).toHaveClass(
    /rdp-day_has-tasks/
  );
});

test("moves tasks between active and completed sections", async ({ page }) => {
  const futureDate = getFutureDate(4);

  await selectCalendarDate(page, futureDate);
  await addTask(page, "Move between sections");

  await page
    .getByRole("checkbox", {
      name: "Move between sectionsの完了ステータスを切り替える",
    })
    .click();

  await expect(page.getByTestId("active-task-section")).not.toContainText(
    "Move between sections"
  );
  await expect(page.getByTestId("completed-task-section")).toContainText(
    "Move between sections"
  );
});

test("removes the last task for a day and clears the calendar marker", async ({
  page,
}) => {
  const futureDate = getFutureDate(5);

  await selectCalendarDate(page, futureDate);
  await addTask(page, "Delete marker check");

  const dayCell = getCalendarDayCell(page, futureDate);
  await expect(dayCell).toHaveClass(/rdp-day_has-tasks/);

  await page.getByRole("button", { name: "Delete marker checkを削除" }).click();

  await expect(page.getByTestId("task-list-empty")).toBeVisible();
  await expect(dayCell).not.toHaveClass(/rdp-day_has-tasks/);
});
