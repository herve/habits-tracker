import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Load the small TypeScript domain modules without a browser or database.
function load(name) {
  const source = readFileSync(new URL(`${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  runInNewContext(outputText, { exports, require: (dependency) => load(dependency) });
  return exports;
}

const { normalizeSchedule, isScheduledOn, scheduleLabel } = load("schedule");
const { computeStreak } = load("streaks");
const { streakColor } = load("streak-style");
const { computeStats } = load("stats");
const { readProfile, validateProfile } = load("profile");

test("profile preferences default safely and reject invalid updates", () => {
  const defaults = readProfile({});
  assert.equal(defaults.avatar, "initials");
  assert.equal(defaults.showMotivation, true);
  assert.equal(defaults.expandRestDays, false);
  assert.equal(readProfile({ profile_avatar: "invalid" }).avatar, "initials");
  assert.equal(validateProfile({ ...defaults, displayName: "  Sam  " }).displayName, "Sam");
  assert.throws(() => validateProfile({ ...defaults, displayName: "x".repeat(61) }), /60/);
  assert.throws(() => validateProfile({ ...defaults, avatar: "invalid" }), /avatar/);
  assert.throws(() => validateProfile({ ...defaults, showMotivation: "yes" }), /preferences/);
  const preferences = readProfile({ show_motivation: false, expand_rest_days: true });
  assert.equal(preferences.showMotivation, false);
  assert.equal(preferences.expandRestDays, true);
  assert.equal(readProfile({ avatar_kind: "emoji", avatar_emoji: "🦊" }).avatarEmoji, "🦊");
  assert.equal(readProfile({ avatar_emoji: "<script>" }).avatarEmoji, "");
  assert.equal(readProfile({ avatar_url: "javascript:alert(1)" }).avatarUrl, "");
  assert.equal(readProfile({ avatar_kind: "photo", avatar_url: "https://example.com/avatar.png" }).avatarKind, "photo");
});

function sampleHabit(created, completed, schedule = null) {
  return { id: "habit", name: "Reading", created_at: `${created}T12:00:00`, schedule_days: schedule,
    completions: completed.map((date) => ({ date, done: true })) };
}

test("weekly summary uses Monday through Sunday and excludes future days", () => {
  const habit = sampleHabit("2026-09-01", ["2026-09-21", "2026-09-23"]);
  const stats = computeStats([habit], "2026-09-22");
  assert.equal(stats.weekStart, "2026-09-21");
  assert.equal(stats.weekEnd, "2026-09-27");
  assert.equal(stats.scheduled, 2);
  assert.equal(stats.completed, 1);
  assert.equal(stats.percentage, 50);
  assert.equal(computeStats([habit], "2026-09-27").scheduled, 7);
  assert.equal(computeStats([habit], "2026-09-28").scheduled, 1);
});

test("patterns cover exactly 28 days and omit pre-creation and rest days", () => {
  const stats = computeStats([sampleHabit("2026-08-01", ["2026-08-25", "2026-08-26", "2026-09-22"])], "2026-09-22");
  assert.equal(stats.patternStart, "2026-08-26");
  assert.equal(stats.patterns.reduce((sum, day) => sum + day.scheduled, 0), 28);
  assert.equal(stats.patterns.reduce((sum, day) => sum + day.completed, 0), 2);
  assert.equal(stats.patterns.every((day) => day.scheduled === 4), true);
  const recent = computeStats([sampleHabit("2026-09-22", [], [2, 4])], "2026-09-22");
  assert.equal(recent.scheduled, 1);
  assert.equal(recent.patterns.reduce((sum, day) => sum + day.scheduled, 0), 1);
});

test("personal best ignores rest days, breaks on misses, and deduplicates completions", () => {
  const habit = sampleHabit("2026-09-07", ["2026-09-07", "2026-09-09", "2026-09-09", "2026-09-11", "2026-09-16", "2026-09-18"], [1, 3, 5]);
  assert.equal(computeStats([habit], "2026-09-22").records[0].best, 3);
  assert.equal(computeStats([sampleHabit("2026-09-21", ["2026-09-20", "2026-09-21", "2026-09-22"])], "2026-09-22").records[0].best, 2);
});

test("no scheduled check-ins means no percentage rather than a failure score", () => {
  assert.equal(computeStats([], "2026-09-22").percentage, null);
  assert.equal(computeStats([sampleHabit("2026-09-22", [], [0])], "2026-09-22").percentage, null);
});

test("dashboard compares equal weekdays and separates month and lifetime totals", () => {
  const habit = sampleHabit("2026-08-01", ["2026-08-01", "2026-09-14", "2026-09-21", "2026-09-22", "2026-09-23"]);
  const stats = computeStats([habit], "2026-09-22");
  assert.equal(stats.totalCompleted, 4);
  assert.equal(stats.month.completed, 3);
  assert.equal(stats.month.scheduled, 22);
  assert.equal(stats.previousWeek.start, "2026-09-14");
  assert.equal(stats.previousWeek.end, "2026-09-15");
  assert.equal(stats.previousWeek.percentage, 50);
  assert.equal(stats.percentage, 100);
  assert.equal(stats.currentStreak, 2);
  assert.equal(stats.longestStreak, 2);
  assert.equal(stats.activeHabits, 1);
  assert.equal(stats.daily.at(-1).completed, 1);
});

test("monthly metrics reset at month boundaries and ignore unscheduled completions", () => {
  const stats = computeStats([sampleHabit("2026-08-01", ["2026-08-31", "2026-09-01"], [1])], "2026-09-01");
  assert.equal(stats.month.scheduled, 0);
  assert.equal(stats.month.percentage, null);
  assert.equal(stats.totalCompleted, 1);
  assert.equal(stats.currentStreak, 1);
});

test("streak colors change exactly at each milestone", () => {
  const boundaries = [5, 14, 28, 50, 100];
  for (const boundary of boundaries) {
    assert.notEqual(streakColor(boundary - 1), streakColor(boundary));
    assert.equal(streakColor(boundary), streakColor(boundary + 1));
  }
  assert.equal(streakColor(0), streakColor(4));
  assert.equal(streakColor(100), streakColor(365));
});

test("daily schedules include all days; weekdays exclude the weekend", () => {
  for (const day of ["2026-09-18", "2026-09-19", "2026-09-20", "2026-09-21"]) {
    assert.equal(isScheduledOn(null, day), true);
    assert.equal(isScheduledOn(undefined, day), true);
  }
  assert.equal(isScheduledOn([1, 3, 5], "2026-09-18"), true);
  assert.equal(isScheduledOn([1, 3, 5], "2026-09-19"), false);
  assert.equal(isScheduledOn([0], "2026-09-20"), true);
  assert.equal(scheduleLabel([0, 1, 5]), "Mon, Fri, Sun");
});

test("schedule validation rejects empty, duplicate and invalid weekdays", () => {
  for (const invalid of [[], [1, 1], [-1], [7], [1.5], [null], "Monday", undefined]) {
    assert.throws(() => normalizeSchedule(invalid), /Choose at least one day/);
  }
  assert.equal(normalizeSchedule([0, 1, 2, 3, 4, 5, 6]), null);
  assert.equal(JSON.stringify(normalizeSchedule([5, 1, 3])), "[1,3,5]");
});

test("rest days preserve a streak and a missed scheduled day breaks it", () => {
  const completed = new Set(["2026-09-16", "2026-09-18"]);
  assert.equal(computeStreak(completed, "2026-09-20", [1, 3, 5]), 2);
  assert.equal(computeStreak(completed, "2026-09-21", [1, 3, 5]), 2);
  assert.equal(computeStreak(completed, "2026-09-22", [1, 3, 5]), 0);
  completed.add("2026-09-21");
  assert.equal(computeStreak(completed, "2026-09-21", [1, 3, 5]), 3);
});

test("daily behavior, single-day schedules and empty history remain valid", () => {
  const completed = new Set(["2026-09-18", "2026-09-19"]);
  assert.equal(computeStreak(completed, "2026-09-20"), 2);
  assert.equal(computeStreak(completed, "2026-09-21"), 0);
  assert.equal(computeStreak(new Set(), "2026-09-20", [1]), 0);
  assert.equal(computeStreak(new Set(["2026-09-07", "2026-09-14"]), "2026-09-20", [1]), 2);
});
