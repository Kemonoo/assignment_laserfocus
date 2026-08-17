(function initPrototypeFrame() {
  "use strict";

  const frame = document.querySelector("[data-prototype-frame]");
  if (!frame) return;

  const stage = frame.closest(".prototype-stage");
  const readySelector = frame.dataset.readySelector;
  const timeoutAt = Date.now() + 20000;
  let readySince = 0;

  function bundleIsReady() {
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.documentElement || !doc.body) return false;
      if (doc.getElementById("__bundler_thumbnail") || doc.getElementById("__bundler_loading")) return false;
      return !readySelector || Boolean(doc.querySelector(readySelector));
    } catch (error) {
      return frame.dataset.loaded === "true";
    }
  }

  function applyVintagePaperTheme() {
    if (frame.dataset.pageTheme !== "vintage-paper") return;

    let doc;
    try {
      doc = frame.contentDocument;
    } catch (error) {
      return;
    }
    if (!doc || doc.getElementById("presentation-vintage-paper")) return;

    const style = doc.createElement("style");
    style.id = "presentation-vintage-paper";
    style.textContent = `
      html,
      body {
        background: #b8a989 !important;
      }

      x-dc > div:first-child {
        color: #29251d !important;
        background:
          radial-gradient(circle at 18% 10%, rgba(255, 247, 221, .38) 0 1px, transparent 2px),
          repeating-linear-gradient(0deg, transparent 0 31px, rgba(72, 58, 35, .12) 32px),
          #b8a989 !important;
        background-size: 43px 47px, 100% 32px, auto !important;
      }

      x-dc > div > div > div:first-child > span:first-child {
        color: #29251d !important;
        font-family: Georgia, "Times New Roman", serif !important;
        font-weight: 400 !important;
        letter-spacing: -.025em !important;
      }

      x-dc > div > div > div:first-child > span:last-child,
      x-dc > div > div > div:nth-child(2) > div > div:first-child > div:first-child > div {
        color: #5f5748 !important;
        font-family: "Courier New", Courier, monospace !important;
      }

      x-dc > div > div > div:nth-child(2) > div > div:first-child > div:first-child > div:first-child {
        color: #29251d !important;
        font-weight: 700 !important;
      }
    `;
    doc.head.appendChild(style);
  }

  function reveal() {
    applyVintagePaperTheme();
    stage.classList.add("is-ready");
    const loader = stage.querySelector(".prototype-loader");
    if (loader) loader.setAttribute("aria-hidden", "true");
  }

  function checkReadiness() {
    if (bundleIsReady()) {
      if (!readySince) readySince = Date.now();
      if (Date.now() - readySince >= 180) {
        reveal();
        return;
      }
    } else {
      readySince = 0;
    }

    if (Date.now() >= timeoutAt) {
      reveal();
      return;
    }

    window.setTimeout(checkReadiness, 50);
  }

  frame.addEventListener("load", function markLoaded() {
    frame.dataset.loaded = "true";
  });

  checkReadiness();
})();
