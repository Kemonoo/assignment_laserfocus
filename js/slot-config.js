(function exposeSlotConfig(root, factory) {
  const config = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = config;
  }

  root.SlotConfig = config;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSlotConfig() {
  "use strict";

  const SYMBOLS = Object.freeze({
    seven: Object.freeze({ id: "seven", label: "Seven", payout: 500 }),
    diamond: Object.freeze({ id: "diamond", label: "Diamond", payout: 100 }),
    bell: Object.freeze({ id: "bell", label: "Bell", payout: 40 }),
    cherry: Object.freeze({ id: "cherry", label: "Cherry", payout: 16 }),
    lemon: Object.freeze({ id: "lemon", label: "Lemon", payout: 4 }),
  });

  // Each strip has the same frequency model but a deliberately different order.
  // The explicit arrays make every selectable stop inspectable in source.
  const REELS = Object.freeze([
    Object.freeze([
      "seven", "lemon", "cherry", "lemon", "bell",
      "lemon", "diamond", "lemon", "cherry", "lemon",
      "bell", "lemon", "diamond", "lemon", "cherry",
      "lemon", "bell", "lemon", "cherry", "cherry",
    ]),
    Object.freeze([
      "lemon", "cherry", "lemon", "diamond", "lemon",
      "bell", "lemon", "cherry", "lemon", "seven",
      "lemon", "cherry", "lemon", "bell", "lemon",
      "diamond", "lemon", "bell", "cherry", "cherry",
    ]),
    Object.freeze([
      "cherry", "lemon", "bell", "lemon", "diamond",
      "lemon", "cherry", "lemon", "seven", "lemon",
      "bell", "lemon", "cherry", "lemon", "diamond",
      "lemon", "bell", "lemon", "cherry", "cherry",
    ]),
  ]);

  return Object.freeze({
    startingBalance: 1000,
    wager: 10,
    symbols: SYMBOLS,
    symbolOrder: Object.freeze(["seven", "diamond", "bell", "cherry", "lemon"]),
    reels: REELS,
    intendedModel: Object.freeze({
      totalCombinations: 8000,
      winningCombinations: 890,
      returnedMultiplierSum: 7296,
    }),
  });
});
