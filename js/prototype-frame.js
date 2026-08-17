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
      if (frame.dataset.prototypeKind === "part1") {
        return queryDeepAll(doc, '[data-screen-label="1a Broadcast"], [data-screen-label="1d Glass"]').length === 2;
      }
      return !readySelector || Boolean(doc.querySelector(readySelector));
    } catch (error) {
      return frame.dataset.loaded === "true";
    }
  }

  function setImportant(node, property, value) {
    if (node) node.style.setProperty(property, value, "important");
  }

  function collectDeepRoots(root, roots = []) {
    roots.push(root);
    root.querySelectorAll("*").forEach((node) => {
      if (node.shadowRoot) collectDeepRoots(node.shadowRoot, roots);
    });
    return roots;
  }

  function queryDeepAll(doc, selector) {
    return collectDeepRoots(doc).flatMap((root) => [...root.querySelectorAll(selector)]);
  }

  function simplifyPartOnePrototypes(doc) {
    const screens = queryDeepAll(doc, '[data-screen-label="1a Broadcast"], [data-screen-label="1d Glass"]');

    screens.forEach((screen) => {
      const wrapper = screen.parentElement;
      const showcase = wrapper && wrapper.parentElement;
      if (!wrapper) return;

      [...wrapper.children].forEach((node) => {
        if (node === screen) return;
        const copy = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
        if (copy.includes("full prototype") || copy.includes("play centered")) {
          setImportant(node, "display", "none");
        }
      });

      setImportant(wrapper, "gap", "0");
      setImportant(wrapper, "padding", "26px 30px 48px");
      setImportant(wrapper, "background", "transparent");
      setImportant(wrapper, "border", "0");
      setImportant(wrapper, "box-shadow", "none");

      if (showcase) {
        setImportant(showcase, "background", "transparent");
        setImportant(showcase, "border", "0");
        setImportant(showcase, "box-shadow", "none");
      }

      if (!screen.dataset.presentationShadow) {
        const existingShadow = frame.contentWindow.getComputedStyle(screen).boxShadow;
        screen.dataset.presentationShadow = existingShadow === "none" ? "" : existingShadow;
      }
      const shadowPrefix = screen.dataset.presentationShadow
        ? `${screen.dataset.presentationShadow}, `
        : "";
      setImportant(screen, "box-shadow", `${shadowPrefix}0 28px 32px rgba(41, 33, 23, .34), 0 8px 12px rgba(41, 33, 23, .18)`);
    });
  }

  function applyPaperTheme() {
    if (frame.dataset.paperTheme !== "shared") return;

    let doc;
    try {
      doc = frame.contentDocument;
    } catch (error) {
      return;
    }
    if (!doc || !doc.body) return;

    const backgroundImage = [
      "repeating-linear-gradient(0deg, rgba(62, 80, 92, .13) 0 1px, transparent 1px 34px)",
      "repeating-linear-gradient(90deg, rgba(62, 80, 92, .13) 0 1px, transparent 1px 34px)",
      "linear-gradient(rgba(102, 66, 31, .16), rgba(102, 66, 31, .16))",
      'url("assets/aged-paper.jpg")'
    ].join(", ");
    const paperNodes = [doc.documentElement, doc.body];
    const kind = frame.dataset.prototypeKind;
    const shell = [...doc.querySelectorAll("div")].find((node) => {
      if (node.style.minHeight !== "100vh") return false;
      const copy = node.textContent || "";
      return kind === "part1"
        ? copy.includes("Hockey app redesign")
        : copy.includes("The Jackpot Machine");
    });
    if (shell) paperNodes.push(shell);

    paperNodes.forEach((node) => {
      setImportant(node, "background-color", "#b58b57");
      setImportant(node, "background-image", backgroundImage);
      setImportant(node, "background-size", "34px 34px, 34px 34px, 100% 100%, cover");
      setImportant(node, "background-position", "0 0, 0 0, center, center");
      setImportant(node, "background-attachment", "fixed");
      setImportant(node, "background-blend-mode", "multiply, multiply, multiply, normal");
    });

    if (kind !== "part1") return;

    const textNodes = queryDeepAll(doc, "span, div");
    const findExact = (copy) => textNodes.find((node) => node.textContent.trim() === copy);
    const findStart = (copy) => textNodes.find((node) => node.textContent.trim().startsWith(copy));
    const title = findExact("Hockey app redesign — side by side");
    const summary = findStart("5-tab nav, Play centered");
    const variantTitles = [findExact("1a · Broadcast"), findExact("1d · Glass")];
    const variantNotes = [findExact("Dense, neutral, one accent"), findExact("Frosted layers, soft depth")];

    setImportant(title, "color", "#292117");
    setImportant(title, "font-family", 'Georgia, "Times New Roman", serif');
    setImportant(title, "font-size", "26px");
    setImportant(title, "font-weight", "700");
    setImportant(title, "letter-spacing", "-.025em");
    [summary, ...variantTitles, ...variantNotes].forEach((node) => {
      setImportant(node, "font-family", "Arial, Helvetica, sans-serif");
      setImportant(node, "font-weight", "700");
    });
    setImportant(summary, "font-size", "14px");
    variantTitles.forEach((node) => setImportant(node, "font-size", "16px"));
    variantNotes.forEach((node) => setImportant(node, "font-size", "13px"));
    [summary, ...variantNotes].forEach((node) => setImportant(node, "color", "#4f3f2f"));
    variantTitles.forEach((node) => {
      setImportant(node, "color", "#292117");
      setImportant(node, "font-weight", "800");
    });

    simplifyPartOnePrototypes(doc);
  }

  function reveal() {
    applyPaperTheme();
    stage.classList.add("is-ready");
    const loader = stage.querySelector(".prototype-loader");
    if (loader) loader.setAttribute("aria-hidden", "true");
    [150, 500, 1200, 2500].forEach((delay) => window.setTimeout(applyPaperTheme, delay));
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
