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

  function enhanceSlotNotebook(doc) {
    const sectionNames = new Set([
      "How to win",
      "Last pull",
      "Why these odds?",
      "Change the model",
    ]);
    const sections = queryDeepAll(doc, "section").filter((section) => {
      const heading = section.querySelector("h2");
      return heading && sectionNames.has(heading.textContent.trim());
    });

    sections.forEach((section) => {
      setImportant(section, "padding", "clamp(17px, 2vw, 22px)");
      setImportant(section, "border-radius", "5px");
      setImportant(section, "background-color", "rgba(249, 235, 207, .42)");

      const heading = section.querySelector("h2");
      setImportant(heading, "font-size", "clamp(32px, 3.5vw, 42px)");
      setImportant(heading, "font-weight", "700");

      section.querySelectorAll("p").forEach((paragraph) => {
        setImportant(paragraph, "font-size", "16px");
        setImportant(paragraph, "font-weight", "700");
        setImportant(paragraph, "line-height", "1.65");
        setImportant(paragraph, "color", "#33291f");
      });
    });

    const mutedColors = new Set([
      "rgb(107, 100, 89)",
      "rgb(125, 118, 107)",
      "rgb(74, 69, 61)",
      "rgb(139, 131, 117)",
    ]);
    queryDeepAll(doc, "p, div, span, button").forEach((node) => {
      if (node.closest("slot-machine")) return;
      const hasDirectCopy = [...node.childNodes].some((child) => (
        child.nodeType === Node.TEXT_NODE && child.textContent.trim()
      ));
      if (!hasDirectCopy && !node.matches("p, button")) return;

      const styles = frame.contentWindow.getComputedStyle(node);
      const size = Number.parseFloat(styles.fontSize);
      if (Number.isFinite(size) && size < 13) {
        setImportant(node, "font-size", "13px");
      } else if (Number.isFinite(size) && size < 15.5) {
        setImportant(node, "font-size", "15px");
      }
      if (Number.parseInt(styles.fontWeight, 10) < 700) {
        setImportant(node, "font-weight", "700");
      }
      if (mutedColors.has(styles.color)) setImportant(node, "color", "#44362a");
    });

    queryDeepAll(doc, ".machine-status").forEach((status) => {
      setImportant(status, "left", "11%");
      setImportant(status, "top", "63.85%");
      setImportant(status, "transform", "skewX(-3deg) rotate(2.2deg)");
      setImportant(status, "font-size", "clamp(.76rem, 2.2vw, 1rem)");
      setImportant(status, "font-weight", "700");
      setImportant(status, "color", "#392f25");
      setImportant(status.querySelector("strong"), "color", "#541018");
      setImportant(status.querySelector("strong"), "font-weight", "800");
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

    if (kind === "slot") {
      enhanceSlotNotebook(doc);
      return;
    }
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
