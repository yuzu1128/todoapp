import { expect, test } from "@playwright/test";

import {
  addTask,
  getCalendarDayCell,
  getFutureDate,
  getNextWeekday,
  getWeekdayLabel,
  gotoTab,
  openTaskDialog,
  selectCalendarDate,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Command Center/i })
  ).toBeVisible();
});

test("shows all tasks on home without truncating after six additions", async ({
  page,
}) => {
  for (const title of [
    "Task 1",
    "Task 2",
    "Task 3",
    "Task 4",
    "Task 5",
    "Task 6",
  ]) {
    await addTask(page, title);
  }

  await expect(page.getByTestId("active-task-section")).toContainText("Task 6");
  await expect(page.getByTestId("task-item")).toHaveCount(6);
});

test("switches tabs and persists the sound setting after reload", async ({
  page,
}) => {
  await gotoTab(page, "settings");
  await expect(page.getByTestId("settings-page")).toBeVisible();

  await expect(page.getByTestId("sound-toggle")).toHaveText("効果音をOFF");
  await page.getByTestId("sound-toggle").click();
  await expect(page.getByTestId("sound-toggle")).toHaveText("効果音をON");

  await page.reload();
  await expect(page.getByTestId("settings-page")).toBeVisible();
  await expect(page.getByTestId("sound-toggle")).toHaveText("効果音をON");

  await gotoTab(page, "home");
  await expect(
    page.getByRole("heading", { name: /Command Center/i })
  ).toBeVisible();

  await gotoTab(page, "calendar");
  await expect(page.getByTestId("calendar-page")).toBeVisible();
});

test("creates a manual task and reuses it from history chips", async ({ page }) => {
  await addTask(page, "History seed");

  await expect(page.getByTestId("active-task-section")).toContainText(
    "History seed"
  );

  await openTaskDialog(page);
  const chip = page
    .getByTestId("recent-title-chip")
    .filter({ hasText: "History seed" })
    .first();

  await expect(chip).toBeVisible();
  await chip.click();
  await expect(page.getByTestId("task-title-input")).toHaveValue("History seed");
});

test("renders calendar labels in natural Japanese", async ({ page }) => {
  await gotoTab(page, "calendar");

  await expect(page.getByTestId("calendar-view").getByRole("status")).toContainText(
    /^\d{4}年 \d+月$/
  );
  await expect(page.getByTestId("date-header")).toContainText(/\d+月\d+日/);
});

test("keeps the selected day task list visible on first mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/calendar");

  await expect(page.getByTestId("date-header")).toBeVisible();
  await expect(page.getByTestId("task-list-empty")).toBeVisible();
  await expect(page.getByTestId("task-list-empty")).toBeInViewport();
});

test("creates a daily recurring rule and keeps completion per day", async ({
  page,
}) => {
  await gotoTab(page, "settings");
  await page.locator("#recurring-title").fill("Daily sync");
  await page.getByTestId("save-rule-button").click();

  await expect(page.getByTestId("recurring-rule-item")).toContainText("Daily sync");

  await gotoTab(page, "calendar");
  await expect(page.getByTestId("active-task-section")).toContainText(
    "Daily sync"
  );

  await page
    .getByRole("checkbox", { name: "Daily syncの完了状態を切り替える" })
    .click();

  await expect(page.getByTestId("completed-task-section")).toContainText(
    "Daily sync"
  );

  await page.reload();
  await expect(page.getByTestId("completed-task-section")).toContainText(
    "Daily sync"
  );

  const tomorrow = getFutureDate(1);
  await selectCalendarDate(page, tomorrow);
  await expect(page.getByTestId("active-task-section")).toContainText(
    "Daily sync"
  );
});

test("creates a weekly recurring rule, shows only matching weekdays, and skips one occurrence", async ({
  page,
}) => {
  const targetDate = getNextWeekday(1);
  const nextOccurrence = getNextWeekday(1, 1);
  const nonMatchingDate =
    getFutureDate(1).getDay() === 1 ? getFutureDate(2) : getFutureDate(1);

  await gotoTab(page, "settings");
  await page.locator("#recurring-title").fill("Weekly review");
  await page.getByRole("button", { name: "週ごと" }).click();
  await page.getByRole("button", { name: getWeekdayLabel(targetDate) }).click();
  await page.getByTestId("save-rule-button").click();

  await gotoTab(page, "calendar");

  await selectCalendarDate(page, nonMatchingDate);
  await expect(page.getByTestId("task-list-empty")).toBeVisible();

  await selectCalendarDate(page, targetDate);
  await expect(page.getByTestId("active-task-section")).toContainText(
    "Weekly review"
  );

  await page.getByRole("button", { name: "Weekly reviewをこの日だけ非表示" }).click();
  await expect(page.getByTestId("task-list-empty")).toBeVisible();

  await selectCalendarDate(page, nextOccurrence);
  await expect(page.getByTestId("active-task-section")).toContainText(
    "Weekly review"
  );
});

test("adds and deletes the last manual task for a day and clears the marker", async ({
  page,
}) => {
  await gotoTab(page, "calendar");
  const futureDate = getFutureDate(6);

  await selectCalendarDate(page, futureDate);
  await addTask(page, "Marker clear");

  await expect(getCalendarDayCell(page, futureDate)).toHaveClass(
    /calendar-day_has-marker/
  );

  await page.getByRole("button", { name: "Marker clearを削除" }).click();

  await expect(page.getByTestId("task-list-empty")).toBeVisible();
  await expect(getCalendarDayCell(page, futureDate)).not.toHaveClass(
    /calendar-day_has-marker/
  );
});
