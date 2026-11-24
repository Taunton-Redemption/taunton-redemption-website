// Run with: node status.test.js
const assert = require("assert");
const { computeStatus, upcomingClosures } = require("./status.js");

const base = {
  timeZone: "America/New_York",
  closures: [],
  hours: {
    mon: [["09:00", "17:00"]], tue: [["09:00", "17:00"]], wed: [["09:00", "17:00"]],
    thu: [["09:00", "17:00"]], fri: [["09:00", "17:00"]], sat: [["09:00", "17:00"]], sun: []
  }
};
const at = (iso) => new Date(iso);
const withClosures = (list, extra) => Object.assign({}, base, { closures: list }, extra);
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
  const s = computeStatus(base, at("2026-11-22T17:00:00Z"));
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

// Closures and the banner
test("closure today closes the shop and shows the message", () => {
  const d = withClosures([{ message: "Closed today: power outage", start: "2026-11-23", end: "2026-11-23" }]);
  const s = computeStatus(d, at("2026-11-23T15:00:00Z"));
  assert.strictEqual(s.state, "closed");
  assert.strictEqual(s.closure, true);
  assert.strictEqual(s.message, "Closed today: power outage");
  assert.strictEqual(s.note, "Opens tomorrow at 9:00 AM");
});
test("closure with no end stays on until removed", () => {
  const s = computeStatus(withClosures([{ message: "Closed" }]), at("2026-12-15T15:00:00Z"));
  assert.strictEqual(s.state, "closed");
});
test("closure that starts later does not close the shop yet", () => {
  const s = computeStatus(withClosures([{ message: "Holiday", start: "2026-11-26", end: "2026-11-26" }]), at("2026-11-23T15:00:00Z"));
  assert.strictEqual(s.state, "open");
});
test("closure that already ended is ignored", () => {
  const s = computeStatus(withClosures([{ message: "Old", start: "2026-11-20", end: "2026-11-22" }]), at("2026-11-23T15:00:00Z"));
  assert.strictEqual(s.state, "open");
});
test("next opening skips days covered by a closure", () => {
  const s = computeStatus(withClosures([{ message: "Closed Tuesday", start: "2026-11-24", end: "2026-11-24" }]), at("2026-11-23T23:00:00Z"));
  assert.strictEqual(s.note, "Opens Wednesday at 9:00 AM");
});
test("Thanksgiving Thursday: closed all day, reopens Friday", () => {
  const d = withClosures([{ message: "Closed for Thanksgiving", start: "2026-11-26", end: "2026-11-26" }]);
  const s = computeStatus(d, at("2026-11-26T15:00:00Z")); // Thu 10:00 AM
  assert.strictEqual(s.state, "closed");
  assert.strictEqual(s.message, "Closed for Thanksgiving");
  assert.strictEqual(s.note, "Opens tomorrow at 9:00 AM");
});
test("two closures: the one covering today wins", () => {
  const d = withClosures([
    { message: "Thanksgiving", start: "2026-11-26", end: "2026-11-26" },
    { message: "Inventory", start: "2026-11-23", end: "2026-11-23" }
  ]);
  assert.strictEqual(computeStatus(d, at("2026-11-23T15:00:00Z")).message, "Inventory");
});
test("the older single override field still works", () => {
  const d = Object.assign({}, base, { override: { message: "Closed", start: "2026-11-23", end: "2026-11-23" } });
  delete d.closures;
  assert.strictEqual(computeStatus(d, at("2026-11-23T15:00:00Z")).state, "closed");
});

// The upcoming-closures notice
const tg = { message: "Closed for Thanksgiving", start: "2026-11-26", end: "2026-11-26" };
test("notice shows a closure later this week with day and reason", () => {
  const u = upcomingClosures(withClosures([tg]), at("2026-11-23T15:00:00Z"));
  assert.deepStrictEqual(u, [{ label: "Thursday, November 26", message: "Closed for Thanksgiving" }]);
});
test("notice still shows the closure on the day itself", () => {
  assert.strictEqual(upcomingClosures(withClosures([tg]), at("2026-11-26T15:00:00Z")).length, 1);
});
test("notice drops the closure once its last day is over", () => {
  assert.strictEqual(upcomingClosures(withClosures([tg]), at("2026-11-27T15:00:00Z")).length, 0);
});
test("notice appears 14 days ahead, not before", () => {
  const far = [{ message: "Inventory", start: "2026-12-07", end: "2026-12-07" }];
  assert.strictEqual(upcomingClosures(withClosures(far), at("2026-11-22T15:00:00Z")).length, 0); // 15 days out
  assert.strictEqual(upcomingClosures(withClosures(far), at("2026-11-23T15:00:00Z")).length, 1); // 14 days out
});
test("a closure entered on Saturday for next week shows right away", () => {
  const next = [{ message: "Closed for inventory", start: "2026-11-30", end: "2026-11-30" }];
  assert.strictEqual(upcomingClosures(withClosures(next), at("2026-11-28T15:00:00Z")).length, 1);
});
test("notice sorts by start date and formats ranges", () => {
  const list = [
    { message: "Inventory", start: "2026-12-01", end: "2026-12-02" },
    tg
  ];
  const u = upcomingClosures(withClosures(list), at("2026-11-24T15:00:00Z"));
  assert.strictEqual(u[0].label, "Thursday, November 26");
  assert.strictEqual(u[1].label, "Tuesday, December 1 to Wednesday, December 2");
});
test("notice uses plain \"Closed\" when no reason is given", () => {
  const u = upcomingClosures(withClosures([{ start: "2026-11-26", end: "2026-11-26" }]), at("2026-11-24T15:00:00Z"));
  assert.strictEqual(u[0].message, "Closed");
});
test("notice label: no start and no end", () => {
  const u = upcomingClosures(withClosures([{ message: "Closed for repairs" }]), at("2026-11-24T15:00:00Z"));
  assert.strictEqual(u[0].label, "Today, until further notice");
});
test("notice label: start date only", () => {
  const u = upcomingClosures(withClosures([{ start: "2026-11-26", message: "Closed for repairs" }]), at("2026-11-24T15:00:00Z"));
  assert.strictEqual(u[0].label, "Starting Thursday, November 26, until further notice");
});
test("notice label: end date only", () => {
  const u = upcomingClosures(withClosures([{ end: "2026-11-26", message: "Closed for repairs" }]), at("2026-11-24T15:00:00Z"));
  assert.strictEqual(u[0].label, "Today through Thursday, November 26");
});
test("closureNoticeDays changes the window", () => {
  const far = [{ message: "Inventory", start: "2026-12-07", end: "2026-12-07" }];
  assert.strictEqual(upcomingClosures(withClosures(far, { closureNoticeDays: 30 }), at("2026-11-22T15:00:00Z")).length, 1);
});
console.log(passed + " tests passed");