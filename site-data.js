// EVERYTHING THAT CHANGES ON THE SITE LIVES IN THIS FILE.
// Edit the text between the quotes. Keep the commas, quotes and brackets where they are.

const SITE_DATA = {
  name: "Taunton Redemption Center",
  address: "449 Broadway, Taunton, MA 02780",
  mapsUrl: "https://www.google.com/maps/place/Taunton+Redemption+Center/data=!4m2!3m1!1s0x89e48c852c85c85b:0x7f1d019e48238219?sa=X&ved=1t:242&ictx=111",

  // PLACEHOLDER: replace null with the number in quotes, e.g. "508-555-0123"
  phone: "(508) 802-4920",

  timeZone: "America/New_York",

  // PLACEHOLDER HOURS. When the real hours are in, change true to false.
  // Times are 24-hour "HH:MM". An empty list [] means closed all day.
  // Two shifts in a day: [["09:00", "12:00"], ["13:00", "17:00"]]
  hoursArePlaceholder: false,
  hours: {
    mon: [["08:00", "15:00"]],
    tue: [["08:00", "15:00"]],
    wed: [["08:00", "15:00"]],
    thu: [["08:00", "15:00"]],
    fri: [["08:00", "15:00"]],
    sat: [["08:00", "15:00"]],
    sun: []
  },

  // EMERGENCY OR HOLIDAY CLOSURE. Leave as null for normal hours.
  // To close the shop, replace null with something like this (dates are YYYY-MM-DD):
  //   override: { message: "Closed today: power outage", start: "2026-11-27", end: "2026-11-27" },
  // "start" and "end" are optional. With no "end" it stays closed until you set it back to null.
  // After the end date passes, the site goes back to normal hours by itself.
  // override: null,

  // CLOSURES: emergencies, holidays, or anything planned. One entry per closure.
  // Dates are YYYY-MM-DD. "message" is the reason customers see.
  // - start and end are optional; with no end, the shop stays closed until you remove the entry.
  // - A closure shows in the "Upcoming closures" strip 14 days ahead and disappears
  //   by itself after its last day. The shop reopens by itself after it, too.
  // Example for a range: { start: "2026-12-01", end: "2026-12-02", message: "Closed for inventory" },
  closures: [
    { start: "2026-11-26", end: "2026-11-26", message: "Closed for Thanksgiving" },
  ],

  // How many days ahead customers see an upcoming closure.
  closureNoticeDays: 14,



  // TODO: SHOW EXACT DAY WHEN OPEN AGAIN WITH TIME
  // TODO: maybe let people know to try to get in before 2:45 since we start cleaning and leave by then?

  // Deposit rules.
  depositCents: 5,
  lastVerified: "2026-11-23",
  sourceUrl: "https://www.mass.gov/deposit-bottle-can-recycling",

  depositYes: [
    "Check for the 'MA' stamped on top of the can",
    "Soda and other carbonated soft drinks",
    "Beer and malt beverages, cans and bottles",
    "Sparkling water",
    "Hard seltzer",
  ],
  depositNo: [
    "Water bottles (Still water)",
    "Juice and iced tea",
    "Sports drinks (Gatorade, Powerade)",
    "Wine bottles",
    "Liquor bottles and nips",
    "High Noon, Sun Cruiser, Surfside, Arizona (Non-spiked)"
  ],

  // Shop rules, in the order they appear. {cents} is replaced by depositCents.
  rules: [
    "We pay {cents}¢ for every deposit container.",
    "Loose glass bottles of alcoholic drinks: limit of 25 per day. We turn away any beyond 25.",
    "Glass bottles still in their original box have no limit.",
    "Keep loose bottles separate from cans and plastic.",
    "Cans and plastic can share a bag, but separate bags are appreciated.",
    "Keep trash out of your bags. A bag with a lot of trash will be refused."
  ]
};
