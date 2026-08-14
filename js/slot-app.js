(function initializeSlotLab() {
  "use strict";

  const config = window.SlotConfig;
  const engine = window.SlotEngine;
  const verification = engine.verifyModel(config);
  const randomInt = engine.createRandomIntSource();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const state = {
    balance: config.startingBalance,
    lastWin: 0,
    spinCount: 0,
    spinning: false,
    currentStops: [4, 9, 14],
  };

  const elements = {
    machine: document.querySelector(".slot-machine"),
    reels: [...document.querySelectorAll("[data-reel]")],
    spinButton: document.querySelector("#spin-button"),
    resetButton: document.querySelector("#reset-button"),
    balance: document.querySelector("#balance-value"),
    wager: document.querySelector("#wager-value"),
    lastWin: document.querySelector("#last-win-value"),
    spinCount: document.querySelector("#spin-count"),
    result: document.querySelector("#spin-result"),
    verificationBadge: document.querySelector("#verification-badge"),
    verificationErrors: document.querySelector("#verification-errors"),
    modelRtp: document.querySelector("#model-rtp"),
    modelHit: document.querySelector("#model-hit"),
    modelEdge: document.querySelector("#model-edge"),
    modelCombinations: document.querySelector("#model-combinations"),
    paytableBody: document.querySelector("#paytable-body"),
    auditSymbols: document.querySelector("#audit-symbols"),
    auditStops: document.querySelector("#audit-stops"),
    auditRule: document.querySelector("#audit-rule"),
    auditPayout: document.querySelector("#audit-payout"),
    auditBalance: document.querySelector("#audit-balance"),
    rngNote: document.querySelector("#rng-note"),
    simulationButton: document.querySelector("#simulation-button"),
    simulationProgress: document.querySelector("#simulation-progress"),
    observedRtp: document.querySelector("#observed-rtp"),
    observedHit: document.querySelector("#observed-hit"),
    theoreticalRtp: document.querySelector("#theoretical-rtp"),
    theoreticalHit: document.querySelector("#theoretical-hit"),
  };

  function formatCredits(value) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  }

  function formatPercent(value, minimumFractionDigits = 1, maximumFractionDigits = 3) {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  }

  function symbolMarkup(symbolId, extraClass = "") {
    const label = config.symbols[symbolId].label;
    return `
      <svg class="symbol-icon symbol-icon--${symbolId} ${extraClass}" aria-hidden="true" focusable="false">
        <use href="#symbol-${symbolId}"></use>
      </svg>
      <span class="visually-hidden">${label}</span>
    `;
  }

  function pluralizeSymbol(symbolId) {
    if (symbolId === "cherry") return "cherries";
    return `${config.symbols[symbolId].label.toLowerCase()}s`;
  }

  function renderReel(reelIndex, centerIndex, winning = false) {
    const reelElement = elements.reels[reelIndex];
    const reel = config.reels[reelIndex];
    const visible = engine.visibleStops(reel, centerIndex);
    const cells = visible.map((symbolId, cellIndex) => `
      <div class="reel-symbol ${cellIndex === 1 ? "reel-symbol--center" : ""} ${winning && cellIndex === 1 ? "is-winning" : ""}">
        ${symbolMarkup(symbolId)}
      </div>
    `).join("");

    reelElement.querySelector(".reel-track").innerHTML = cells;
    reelElement.setAttribute(
      "aria-label",
      `Reel ${reelIndex + 1}, center symbol ${config.symbols[visible[1]].label}, stop ${centerIndex + 1} of ${reel.length}`,
    );
  }

  function renderMachineValues() {
    elements.balance.textContent = formatCredits(state.balance);
    elements.wager.textContent = formatCredits(config.wager);
    elements.lastWin.textContent = formatCredits(state.lastWin);
    elements.spinCount.textContent = formatCredits(state.spinCount);

    const cannotAffordSpin = state.balance < config.wager;
    elements.spinButton.disabled = state.spinning || cannotAffordSpin || !verification.ok;
    elements.spinButton.setAttribute("aria-busy", String(state.spinning));
    elements.resetButton.hidden = !cannotAffordSpin;

    if (cannotAffordSpin && !state.spinning) {
      elements.result.textContent = "Balance below the 10-credit wager. Reset the prototype to continue.";
    }
  }

  function renderModel() {
    const model = verification.analysis;
    elements.modelRtp.textContent = formatPercent(model.rtp);
    elements.modelHit.textContent = formatPercent(model.hitFrequency, 3, 3);
    elements.modelEdge.textContent = formatPercent(model.houseEdge);
    elements.modelCombinations.textContent = formatCredits(model.totalCombinations);
    elements.theoreticalRtp.textContent = formatPercent(model.rtp);
    elements.theoreticalHit.textContent = formatPercent(model.hitFrequency, 3, 3);

    elements.paytableBody.innerHTML = config.symbolOrder.map((symbolId) => {
      const symbol = config.symbols[symbolId];
      const stats = model.symbolStats[symbolId];
      const stops = stats.stopsPerReel.join(" · ");

      return `
        <tr>
          <th scope="row">
            <span class="table-symbol">${symbolMarkup(symbolId)}</span>
            <span>${symbol.label}</span>
          </th>
          <td>${stops}</td>
          <td>${formatPercent(stats.probability, 3, 4)}</td>
          <td>${symbol.payout}×</td>
          <td>${formatPercent(stats.rtpContribution, 2, 2)}</td>
        </tr>
      `;
    }).join("");

    if (verification.ok) {
      elements.verificationBadge.innerHTML = `
        <span class="status-dot" aria-hidden="true"></span>
        Model verified · ${formatCredits(model.totalCombinations)} combinations checked
      `;
      return;
    }

    elements.verificationBadge.classList.add("verification-badge--error");
    elements.verificationBadge.textContent = "Model verification failed";
    elements.verificationErrors.hidden = false;
    elements.verificationErrors.textContent = verification.errors.join(" ");
    elements.machine.classList.add("has-model-error");
  }

  function renderAudit(outcome, settlement) {
    const labels = outcome.symbols.map((symbolId) => config.symbols[symbolId].label);
    elements.auditSymbols.textContent = labels.join(" · ");
    elements.auditStops.textContent = outcome.stopIndices
      .map((index) => `${String(index + 1).padStart(2, "0")} / 20`)
      .join(" · ");

    if (outcome.isWin) {
      elements.auditRule.textContent = `Win — exact match of three ${pluralizeSymbol(outcome.winningSymbol)}.`;
      elements.auditPayout.textContent = `${formatCredits(config.wager)} × ${outcome.payoutMultiplier} = ${formatCredits(settlement.payout)} credits returned`;
    } else {
      elements.auditRule.textContent = "No win — the three center symbols do not match.";
      elements.auditPayout.textContent = "No matching triple = 0 credits returned";
    }

    elements.auditBalance.textContent = [
      formatCredits(settlement.openingBalance),
      "−",
      formatCredits(settlement.wager),
      "+",
      formatCredits(settlement.payout),
      "=",
      formatCredits(settlement.closingBalance),
    ].join(" ");

    const ruleText = outcome.isWin
      ? `three ${pluralizeSymbol(outcome.winningSymbol)}`
      : "no match";
    elements.result.textContent = `${labels.join(" · ")} → ${ruleText} → ${formatCredits(settlement.payout)} credits`;
  }

  function animateOutcome(outcome) {
    if (reducedMotion.matches) {
      outcome.stopIndices.forEach((stopIndex, reelIndex) => {
        renderReel(reelIndex, stopIndex, outcome.isWin);
      });
      return Promise.resolve();
    }

    const stopDelays = [720, 920, 1120];
    const intervals = [];

    elements.reels.forEach((reelElement, reelIndex) => {
      reelElement.classList.remove("has-landed");
      reelElement.classList.add("is-spinning");
      let cursor = state.currentStops[reelIndex];
      intervals[reelIndex] = window.setInterval(() => {
        cursor = (cursor + 1 + reelIndex) % config.reels[reelIndex].length;
        renderReel(reelIndex, cursor);
      }, 64 + reelIndex * 7);
    });

    return new Promise((resolve) => {
      stopDelays.forEach((delay, reelIndex) => {
        window.setTimeout(() => {
          window.clearInterval(intervals[reelIndex]);
          renderReel(reelIndex, outcome.stopIndices[reelIndex], outcome.isWin);
          elements.reels[reelIndex].classList.remove("is-spinning");
          elements.reels[reelIndex].classList.add("has-landed");

          if (reelIndex === stopDelays.length - 1) resolve();
        }, delay);
      });
    });
  }

  async function playSpin() {
    if (state.spinning || state.balance < config.wager || !verification.ok) return;

    state.spinning = true;
    state.lastWin = 0;
    elements.machine.classList.remove("has-win");
    elements.result.textContent = "Result selected. Reels are revealing the three center stops…";
    renderMachineValues();

    // The outcome and balance settlement are fixed before the reveal animation begins.
    const outcome = engine.selectOutcome(randomInt, config);
    const settlement = engine.settleBalance(state.balance, outcome, config);

    await animateOutcome(outcome);

    state.balance = settlement.closingBalance;
    state.lastWin = settlement.payout;
    state.spinCount += 1;
    state.currentStops = [...outcome.stopIndices];
    state.spinning = false;
    elements.machine.classList.toggle("has-win", outcome.isWin);

    renderAudit(outcome, settlement);
    renderMachineValues();
    elements.spinButton.focus({ preventScroll: true });
  }

  function resetPrototype() {
    state.balance = config.startingBalance;
    state.lastWin = 0;
    state.spinCount = 0;
    state.currentStops = [4, 9, 14];
    elements.machine.classList.remove("has-win");
    state.currentStops.forEach((stopIndex, reelIndex) => renderReel(reelIndex, stopIndex));
    elements.result.textContent = "Prototype reset. Press Spin to select three independent stops.";
    elements.auditSymbols.textContent = "No spin yet";
    elements.auditStops.textContent = "—";
    elements.auditRule.textContent = "Three matching center symbols form a win.";
    elements.auditPayout.textContent = "—";
    elements.auditBalance.textContent = formatCredits(config.startingBalance);
    renderMachineValues();
    elements.spinButton.focus();
  }

  function runSimulation() {
    if (!verification.ok || elements.simulationButton.disabled) return;

    const totalSpins = 10000;
    const chunkSize = 500;
    const accumulator = engine.createSimulationAccumulator();
    const simulationRandomInt = engine.createRandomIntSource();

    elements.simulationButton.disabled = true;
    elements.simulationButton.textContent = "Checking model…";
    elements.simulationProgress.textContent = `0 / ${formatCredits(totalSpins)} spins`;

    function runChunk() {
      const remaining = totalSpins - accumulator.spins;
      engine.simulateInto(
        accumulator,
        Math.min(chunkSize, remaining),
        simulationRandomInt,
        config,
      );
      elements.simulationProgress.textContent = `${formatCredits(accumulator.spins)} / ${formatCredits(totalSpins)} spins`;

      if (accumulator.spins < totalSpins) {
        window.setTimeout(runChunk, 0);
        return;
      }

      const summary = engine.summarizeSimulation(accumulator);
      elements.observedRtp.textContent = formatPercent(summary.rtp);
      elements.observedHit.textContent = formatPercent(summary.hitFrequency, 3, 3);
      elements.simulationProgress.textContent = `${formatCredits(totalSpins)} spins complete · natural variation expected`;
      elements.simulationButton.disabled = false;
      elements.simulationButton.textContent = "Run again";
    }

    window.setTimeout(runChunk, 0);
  }

  function isInteractiveTarget(target) {
    return Boolean(target.closest("button, a, input, select, textarea, summary, [contenteditable='true']"));
  }

  elements.spinButton.addEventListener("click", playSpin);
  elements.resetButton.addEventListener("click", resetPrototype);
  elements.simulationButton.addEventListener("click", runSimulation);
  document.addEventListener("keydown", (event) => {
    if ((event.code === "Space" || event.code === "Enter") && !isInteractiveTarget(event.target)) {
      event.preventDefault();
      playSpin();
    }
  });

  state.currentStops.forEach((stopIndex, reelIndex) => renderReel(reelIndex, stopIndex));
  elements.rngNote.textContent = globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function"
    ? "Random source: Web Crypto with unbiased rejection sampling"
    : "Random source: documented Math.random compatibility fallback";
  renderModel();
  renderMachineValues();
})();
