(function exposeSlotEngine(root, factory) {
  const config = typeof module === "object" && module.exports
    ? require("./slot-config.js")
    : root.SlotConfig;
  const engine = factory(config);

  if (typeof module === "object" && module.exports) {
    module.exports = engine;
  }

  root.SlotEngine = engine;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSlotEngine(defaultConfig) {
  "use strict";

  const UINT32_RANGE = 0x100000000;

  function assertConfig(config) {
    if (!config || !Array.isArray(config.reels) || config.reels.length !== 3) {
      throw new Error("The slot model requires exactly three reel strips.");
    }

    for (const [reelIndex, reel] of config.reels.entries()) {
      if (!Array.isArray(reel) || reel.length !== 20) {
        throw new Error(`Reel ${reelIndex + 1} must contain exactly 20 stops.`);
      }

      for (const symbolId of reel) {
        if (!config.symbols[symbolId]) {
          throw new Error(`Reel ${reelIndex + 1} contains unknown symbol “${symbolId}”.`);
        }
      }
    }
  }

  function createRandomIntSource() {
    if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
      const bucket = new Uint32Array(1);

      return function secureRandomInt(maxExclusive) {
        if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
          throw new RangeError("maxExclusive must be a positive safe integer.");
        }

        const acceptanceLimit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
        let value;

        do {
          globalThis.crypto.getRandomValues(bucket);
          value = bucket[0];
        } while (value >= acceptanceLimit);

        return value % maxExclusive;
      };
    }

    // Documented compatibility fallback for older or restricted browsers.
    return function fallbackRandomInt(maxExclusive) {
      if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
        throw new RangeError("maxExclusive must be a positive safe integer.");
      }

      return Math.floor(Math.random() * maxExclusive);
    };
  }

  function symbolAt(reel, index) {
    const wrappedIndex = (index + reel.length) % reel.length;
    return reel[wrappedIndex];
  }

  function visibleStops(reel, centerIndex) {
    return [
      symbolAt(reel, centerIndex - 1),
      symbolAt(reel, centerIndex),
      symbolAt(reel, centerIndex + 1),
    ];
  }

  function evaluateStops(stopIndices, config = defaultConfig) {
    assertConfig(config);

    if (!Array.isArray(stopIndices) || stopIndices.length !== config.reels.length) {
      throw new Error("One selected stop index is required for every reel.");
    }

    const symbols = stopIndices.map((stopIndex, reelIndex) => {
      const reel = config.reels[reelIndex];

      if (!Number.isInteger(stopIndex) || stopIndex < 0 || stopIndex >= reel.length) {
        throw new RangeError(`Stop ${stopIndex} is outside reel ${reelIndex + 1}.`);
      }

      return reel[stopIndex];
    });

    const isWin = symbols.every((symbolId) => symbolId === symbols[0]);
    const winningSymbol = isWin ? symbols[0] : null;
    const payoutMultiplier = winningSymbol ? config.symbols[winningSymbol].payout : 0;

    return Object.freeze({
      stopIndices: Object.freeze([...stopIndices]),
      symbols: Object.freeze(symbols),
      isWin,
      winningSymbol,
      payoutMultiplier,
    });
  }

  function selectOutcome(randomInt = createRandomIntSource(), config = defaultConfig) {
    assertConfig(config);
    const stopIndices = config.reels.map((reel) => randomInt(reel.length));
    return evaluateStops(stopIndices, config);
  }

  function settleBalance(balance, outcome, config = defaultConfig) {
    if (!Number.isFinite(balance) || balance < config.wager) {
      throw new Error("The balance cannot cover the fixed wager.");
    }

    const payout = config.wager * outcome.payoutMultiplier;
    return Object.freeze({
      openingBalance: balance,
      wager: config.wager,
      payout,
      closingBalance: balance - config.wager + payout,
    });
  }

  function countFrequencies(reel, symbolOrder) {
    return symbolOrder.reduce((counts, symbolId) => {
      counts[symbolId] = reel.reduce(
        (total, stopSymbol) => total + Number(stopSymbol === symbolId),
        0,
      );
      return counts;
    }, {});
  }

  function analyzeModel(config = defaultConfig) {
    assertConfig(config);

    const totalCombinations = config.reels.reduce((total, reel) => total * reel.length, 1);
    const contributionNumerators = Object.fromEntries(
      config.symbolOrder.map((symbolId) => [symbolId, 0]),
    );
    let winningCombinations = 0;
    let returnedMultiplierSum = 0;

    for (let first = 0; first < config.reels[0].length; first += 1) {
      for (let second = 0; second < config.reels[1].length; second += 1) {
        for (let third = 0; third < config.reels[2].length; third += 1) {
          const outcome = evaluateStops([first, second, third], config);

          if (outcome.isWin) {
            winningCombinations += 1;
            returnedMultiplierSum += outcome.payoutMultiplier;
            contributionNumerators[outcome.winningSymbol] += outcome.payoutMultiplier;
          }
        }
      }
    }

    const reelFrequencies = config.reels.map((reel) => (
      countFrequencies(reel, config.symbolOrder)
    ));
    const symbolStats = Object.fromEntries(config.symbolOrder.map((symbolId) => {
      const winningWays = reelFrequencies.reduce(
        (ways, frequencies) => ways * frequencies[symbolId],
        1,
      );

      return [symbolId, Object.freeze({
        stopsPerReel: Object.freeze(reelFrequencies.map((frequencies) => frequencies[symbolId])),
        winningWays,
        probability: winningWays / totalCombinations,
        payoutMultiplier: config.symbols[symbolId].payout,
        contributionNumerator: contributionNumerators[symbolId],
        rtpContribution: contributionNumerators[symbolId] / totalCombinations,
      })];
    }));
    const rtp = returnedMultiplierSum / totalCombinations;

    return Object.freeze({
      totalCombinations,
      winningCombinations,
      returnedMultiplierSum,
      hitFrequency: winningCombinations / totalCombinations,
      expectedReturnedMultiplier: rtp,
      rtp,
      houseEdge: 1 - rtp,
      reelFrequencies: Object.freeze(reelFrequencies),
      symbolStats: Object.freeze(symbolStats),
    });
  }

  function verifyModel(config = defaultConfig) {
    const analysis = analyzeModel(config);
    const expected = config.intendedModel;
    const errors = [];

    if (analysis.totalCombinations !== expected.totalCombinations) {
      errors.push(`Expected ${expected.totalCombinations} combinations; derived ${analysis.totalCombinations}.`);
    }
    if (analysis.winningCombinations !== expected.winningCombinations) {
      errors.push(`Expected ${expected.winningCombinations} wins; derived ${analysis.winningCombinations}.`);
    }
    if (analysis.returnedMultiplierSum !== expected.returnedMultiplierSum) {
      errors.push(`Expected a returned-multiplier sum of ${expected.returnedMultiplierSum}; derived ${analysis.returnedMultiplierSum}.`);
    }

    const expectedFrequencies = [1, 2, 3, 5, 9];
    for (const [reelIndex, frequencies] of analysis.reelFrequencies.entries()) {
      config.symbolOrder.forEach((symbolId, symbolIndex) => {
        if (frequencies[symbolId] !== expectedFrequencies[symbolIndex]) {
          errors.push(
            `Reel ${reelIndex + 1} has ${frequencies[symbolId]} ${symbolId} stops; expected ${expectedFrequencies[symbolIndex]}.`,
          );
        }
      });
    }

    return Object.freeze({
      ok: errors.length === 0,
      errors: Object.freeze(errors),
      analysis,
    });
  }

  function createSimulationAccumulator() {
    return { spins: 0, wins: 0, returnedMultiplierSum: 0 };
  }

  function simulateInto(accumulator, spinCount, randomInt, config = defaultConfig) {
    if (!Number.isInteger(spinCount) || spinCount < 0) {
      throw new RangeError("spinCount must be a non-negative integer.");
    }

    for (let spin = 0; spin < spinCount; spin += 1) {
      const outcome = selectOutcome(randomInt, config);
      accumulator.spins += 1;
      accumulator.wins += Number(outcome.isWin);
      accumulator.returnedMultiplierSum += outcome.payoutMultiplier;
    }

    return accumulator;
  }

  function summarizeSimulation(accumulator) {
    if (accumulator.spins === 0) {
      return Object.freeze({ spins: 0, wins: 0, hitFrequency: 0, rtp: 0 });
    }

    return Object.freeze({
      spins: accumulator.spins,
      wins: accumulator.wins,
      hitFrequency: accumulator.wins / accumulator.spins,
      rtp: accumulator.returnedMultiplierSum / accumulator.spins,
    });
  }

  return Object.freeze({
    createRandomIntSource,
    visibleStops,
    evaluateStops,
    selectOutcome,
    settleBalance,
    analyzeModel,
    verifyModel,
    createSimulationAccumulator,
    simulateInto,
    summarizeSimulation,
  });
});
