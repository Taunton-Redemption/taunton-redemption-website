// Works out whether the shop is open, using the weekly hours and the list of closures.
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

  function longDate(dateStr) {
    var p = dateStr.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).toLocaleDateString("en-US", {
      timeZone: "UTC", weekday: "long", month: "long", day: "numeric"
    });
  }

  // The list of closures. Still understands the older single "override" field.
  function closuresOf(data) {
    if (data.closures) return data.closures;
    return data.override ? [data.override] : [];
  }

  // A closure covers a date when it has started and not yet ended (both are optional).
  function covers(c, dateStr) {
    if (c.start && dateStr < c.start) return false;
    if (c.end && dateStr > c.end) return false;
    return true;
  }

  function findClosure(data, dateStr) {
    var list = closuresOf(data);
    for (var i = 0; i < list.length; i++) if (covers(list[i], dateStr)) return list[i];
    return null;
  }

  // Describes the next time the shop opens, skipping days covered by a closure.
  function nextOpening(data, n) {
    for (var k = 0; k <= 7; k++) {
      var d = addDays(n.date, k);
      if (findClosure(data, d.date)) continue;
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
    var c = findClosure(data, n.date);
    if (c) {
      return { state: "closed", closure: true, message: c.message || "", note: nextOpening(data, n) };
    }
    var ranges = data.hours[KEYS[n.dayIndex]] || [];
    for (var i = 0; i < ranges.length; i++) {
      if (n.minutes >= toMinutes(ranges[i][0]) && n.minutes < toMinutes(ranges[i][1])) {
        return { state: "open", closure: false, message: "", note: "Open until " + formatTime(ranges[i][1]) + " today" };
      }
    }
    return { state: "closed", closure: false, message: "", note: nextOpening(data, n) };
  }

  function closureLabel(c) {
    if (c.start && c.end) return c.start === c.end ? longDate(c.start) : longDate(c.start) + " to " + longDate(c.end);
    if (c.start) return "Starting " + longDate(c.start) + ", until further notice";
    return c.end ? "Today through " + longDate(c.end) : "Today, until further notice";
  }

  // Closures to show in the notice: not yet over, and starting within the next
  // closureNoticeDays days (14 if not set). Closures happening today are included.
  function upcomingClosures(data, now) {
    var n = shopNow(now || new Date(), data.timeZone);
    var limit = addDays(n.date, data.closureNoticeDays || 14).date;
    var shown = closuresOf(data).filter(function (c) {
      return (!c.end || c.end >= n.date) && (!c.start || c.start <= limit);
    });
    shown.sort(function (a, b) {
      var x = a.start || n.date, y = b.start || n.date;
      return x < y ? -1 : x > y ? 1 : 0;
    });
    return shown.map(function (c) {
      return { label: closureLabel(c), message: c.message || "Closed" };
    });
  }

  return {
    computeStatus: computeStatus, upcomingClosures: upcomingClosures,
    formatTime: formatTime, KEYS: KEYS, NAMES: NAMES, shopNow: shopNow
  };
});