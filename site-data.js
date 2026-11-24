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
  override: null,

  // Deposit rules.
  depositCents: 5,
  lastVerified: "2026-11-23",
  sourceUrl: "https://www.mass.gov/deposit-bottle-can-recycling",

  depositYes: [
    "Check for the 'MA' stamped on top of the can",
    "Soda and other carbonated soft drinks (Coke, Pepsi, Polar, etc.)",
    "Beer and malt beverages, cans and bottles",
    "Some seltzer and sparkling water"
  ],
  depositNo: [
    "Water bottles (still water)",
    "Juice and iced tea",
    "Sports drinks (Gatorade, Powerade)",
    "Wine bottles (we don’t take these)",
    "Liquor bottles and nips (we don’t take these)",
    "High Noon, Sun Cruiser, Surfside"
  ],

  // Shop rules, in the order they appear. {cents} is replaced by depositCents.
  rules: [
    "We pay {cents}¢ for every deposit container.",
    "Loose glass bottles of alcoholic drinks: limit of 25 per day. We turn away any beyond 25.",
    "Bottles still in their original box have no limit.",
    "Keep loose bottles separate from cans and plastic.",
    "Cans and plastic can share a bag, but separate bags are easier for everyone.",
    "Keep trash out of your bags. A bag with a lot of trash will be refused."
  ]
};
