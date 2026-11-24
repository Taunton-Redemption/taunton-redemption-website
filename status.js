// Works out whether the shop is open, using the weekly hours and the closure override.
// Used by the page in the browser and by status.test.js in Node.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ShopStatus = factory();
})(typeof self !== "undefined" ? self : this, function () {
  var KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function toMinutes(hhmm) {
    var p = hhmm.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function formatTime(hhmm) {
    var m = toMinutes(hhmm), h = Math.floor(m / 60), mm = m % 60;
    var suffix = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + (mm < 10 ? "0" : "") + mm + " " + suffix;
  }

  // Current day, date (YYYY-MM-DD) and minutes since midnight in the shop's time zone.
  function shopNow(date, tz) {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, weekday: "short", year: "numeric", month: "2-digit",
      day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(date);
    var p = {};
    parts.forEach(function (x) { p[x.type] = x.value; });
    return {
      dayIndex: SHORT.indexOf(p.weekday),
      date: p.year + "-" + p.month + "-" + p.day,
      minutes: parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10)
    };
  }

  // The calendar date k days after dateStr, with its weekday index.
  function addDays(dateStr, k) {
    var p = dateStr.split("-");
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + k));
    return { date: d.toISOString().slice(0, 10), dayIndex: d.getUTCDay() };
  }

  function overrideCovers(o, dateStr) {
    if (!o) return false;
    if (o.start && dateStr < o.start) return false;
    if (o.end && dateStr > o.end) return false;
    return true;
  }

  // Describes the next time the shop opens, skipping days covered by the override.
  function nextOpening(data, n) {
    for (var k = 0; k <= 7; k++) {
      var d = addDays(n.date, k);
      if (overrideCovers(data.override, d.date)) continue;
      var ranges = data.hours[KEYS[d.dayIndex]] || [];
      for (var i = 0; i < ranges.length; i++) {
        if (k === 0 && toMinutes(ranges[i][0]) <= n.minutes) continue;
        var when = k === 0 ? "today" : k === 1 ? "tomorrow" : NAMES[d.dayIndex];
        return "Opens " + when + " at " + formatTime(ranges[i][0]);
      }
    }
    return "";
  }

  function computeStatus(data, now) {
    var n = shopNow(now || new Date(), data.timeZone);
    if (overrideCovers(data.override, n.date)) {
      return { state: "closed", override: true, message: data.override.message || "", note: nextOpening(data, n) };
    }
    var ranges = data.hours[KEYS[n.dayIndex]] || [];
    for (var i = 0; i < ranges.length; i++) {
      if (n.minutes >= toMinutes(ranges[i][0]) && n.minutes < toMinutes(ranges[i][1])) {
        return { state: "open", override: false, message: "", note: "Open until " + formatTime(ranges[i][1]) + " today" };
      }
    }
    return { state: "closed", override: false, message: "", note: nextOpening(data, n) };
  }

  return { computeStatus: computeStatus, formatTime: formatTime, KEYS: KEYS, NAMES: NAMES, shopNow: shopNow };
});
