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
