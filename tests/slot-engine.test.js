"use strict";

const assert = require("node:assert/strict");
const config = require("../js/slot-config.js");
const engine = require("../js/slot-engine.js");

function run() {
  assert.equal(config.reels.length, 3);
  assert.deepEqual(config.reels.map((reel) => reel.length), [20, 20, 20]);

  const verification = engine.verifyModel(config);
  assert.equal(verification.ok, true, verification.errors.join("\n"));
  assert.equal(verification.analysis.totalCombinations, 8000);
  assert.equal(verification.analysis.winningCombinations, 890);
  assert.equal(verification.analysis.returnedMultiplierSum, 7296);
  assert.equal(verification.analysis.hitFrequency, 0.11125);
  assert.equal(verification.analysis.rtp, 0.912);
  assert.ok(Math.abs(verification.analysis.houseEdge - 0.088) < Number.EPSILON);

  const contributionSum = config.symbolOrder.reduce(
    (total, symbolId) => total + verification.analysis.symbolStats[symbolId].contributionNumerator,
    0,
  );
  assert.equal(contributionSum, verification.analysis.returnedMultiplierSum);

  const sevens = engine.evaluateStops([0, 9, 8], config);
  assert.equal(sevens.isWin, true);
  assert.equal(sevens.winningSymbol, "seven");
  assert.equal(sevens.payoutMultiplier, 500);

  const mixed = engine.evaluateStops([1, 1, 1], config);
  assert.equal(mixed.isWin, false);
  assert.equal(mixed.payoutMultiplier, 0);

  const losingSettlement = engine.settleBalance(1000, mixed, config);
  assert.equal(losingSettlement.closingBalance, 990);
  assert.equal(losingSettlement.payout, 0);

  const winningSettlement = engine.settleBalance(1000, sevens, config);
  assert.equal(winningSettlement.closingBalance, 5990);
  assert.equal(winningSettlement.payout, 5000);

  const deterministicValues = [0, 9, 8];
  const deterministicOutcome = engine.selectOutcome(() => deterministicValues.shift(), config);
  assert.equal(deterministicOutcome.winningSymbol, "seven");

  const accumulator = engine.createSimulationAccumulator();
  const fixedLemonStops = [1, 0, 1];
  let cursor = 0;
  engine.simulateInto(accumulator, 10, () => {
    const value = fixedLemonStops[cursor % fixedLemonStops.length];
    cursor += 1;
    return value;
  }, config);
  const simulation = engine.summarizeSimulation(accumulator);
  assert.equal(simulation.spins, 10);
  assert.equal(simulation.wins, 10);
  assert.equal(simulation.hitFrequency, 1);
  assert.equal(simulation.rtp, 4);

  console.log("slot-engine: all tests passed");
}

run();
