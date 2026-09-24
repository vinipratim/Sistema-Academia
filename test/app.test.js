const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { spawnSync } = require("node:child_process");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

test("frontend has valid JavaScript syntax", () => {
  const result = spawnSync(process.execPath, ["--check", "app.js"], { cwd: root });
  assert.equal(result.status, 0, result.stderr.toString());
});

test("state persistence and workout manipulation handlers are wired", () => {
  assert.match(app, /localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(state\)\)/);
  assert.match(app, /function (saveWorkout|duplicateWorkout|addDay)\(/);
  assert.match(app, /persist\(\);/);
});

test("all export formats have controls and implementations", () => {
  assert.match(html, /id="downloadBtn"/);
  assert.match(html, /id="pdfBtn"/);
  assert.match(html, /id="backupBtn"/);
  assert.match(app, /function downloadDocx\(/);
  assert.match(app, /function downloadPdf\(/);
  assert.match(app, /function downloadBackup\(/);
});
