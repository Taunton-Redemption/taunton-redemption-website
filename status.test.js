// Run with: node status.test.js
const assert = require("assert");
const { computeStatus } = require("./status.js");

const base = {
  timeZone: "America/New_York",
  override: null,
  hours: {
    mon: [["09:00", "17:00"]], tue: [["09:00", "17:00"]], wed: [["09:00", "17:00"]],
    thu: [["09:00", "17:00"]], fri: [["09:00", "17:00"]], sat: [["09:00", "17:00"]], sun: []
  }
};
const at = (iso) => new Date(iso);
const withOverride = (o) => Object.assign({}, base, { override: o });
let passed = 0;
function test(name, fn) { fn(); passed++; console.log("ok - " + name); }

// 2026-11-23 is a Monday; New York is UTC-5 in November, UTC-4 in July.
test("open during hours", () => {
  const s = computeStatus(base, at("2026-11-23T15:00:00Z")); // 10:00 AM
  assert.strictEqual(s.state, "open");
  assert.strictEqual(s.note, "Open until 5:00 PM today");
});
test("closed after hours, opens tomorrow", () => {
  const s = computeStatus(base, at("2026-11-23T23:00:00Z")); // 6:00 PM
  assert.strictEqual(s.state, "closed");
  assert.strictEqual(s.note, "Opens tomorrow at 9:00 AM");
});
test("closed before opening, opens today", () => {
  const s = computeStatus(base, at("2026-11-23T12:00:00Z")); // 7:00 AM
  assert.strictEqual(s.note, "Opens today at 9:00 AM");
});
test("closing time itself counts as closed", () => {
  const s = computeStatus(base, at("2026-11-23T22:00:00Z")); // 5:00 PM
  assert.strictEqual(s.state, "closed");
});
test("closed Sunday, opens tomorrow", () => {
  const s = computeStatus(base, at("2026-11-22T17:00:00Z")); // Sunday noon
  assert.strictEqual(s.state, "closed");
  assert.strictEqual(s.note, "Opens tomorrow at 9:00 AM");
});
test("Saturday evening opens Monday", () => {
  const s = computeStatus(base, at("2026-11-28T22:30:00Z")); // Sat 5:30 PM
  assert.strictEqual(s.note, "Opens Monday at 9:00 AM");
});
test("summer daylight time handled", () => {
  const s = computeStatus(base, at("2026-07-01T14:00:00Z")); // Wed 10:00 AM EDT
  assert.strictEqual(s.state, "open");
});
test("active override closes the shop and shows the message", () => {
  const s = computeStatus(withOverride({ message: "Closed today: power outage", start: "2026-11-23", end: "2026-11-23" }), at("2026-11-23T15:00:00Z"));
  assert.strictEqual(s.state, "closed");
  assert.strictEqual(s.override, true);
  assert.strictEqual(s.message, "Closed today: power outage");
  assert.strictEqual(s.note, "Opens tomorrow at 9:00 AM");
});
test("override without end date stays on until removed", () => {
  const s = computeStatus(withOverride({ message: "Closed" }), at("2026-12-15T15:00:00Z"));
  assert.strictEqual(s.state, "closed");
});
test("override that starts in the future is ignored for now", () => {
  const s = computeStatus(withOverride({ message: "Holiday", start: "2026-11-26", end: "2026-11-26" }), at("2026-11-23T15:00:00Z"));
  assert.strictEqual(s.state, "open");
});
test("override that already ended is ignored", () => {
  const s = computeStatus(withOverride({ message: "Old", start: "2026-11-20", end: "2026-11-22" }), at("2026-11-23T15:00:00Z"));
  assert.strictEqual(s.state, "open");
});
test("next opening skips days covered by the override", () => {
  const s = computeStatus(withOverride({ message: "Closed Tuesday", start: "2026-11-24", end: "2026-11-24" }), at("2026-11-23T23:00:00Z"));
  assert.strictEqual(s.state, "closed");
  assert.strictEqual(s.note, "Opens Wednesday at 9:00 AM");
});
console.log(passed + " tests passed");
