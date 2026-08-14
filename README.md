# Laserfocus design assignment

This repository contains two static, responsive parts of a job-application assignment:

- **[Part 1 · UI/UX redesign](part1.html):** two directions for a hockey product, presented side by side.
- **[Part 2 · Glass Box Slot Lab](slot.html):** a playable slot-machine prototype beside a live explanation of its probability model.

The root [`index.html`](index.html) is a lightweight overview linking to both experiences. Part 1 remains the original bundled artifact; Part 2 uses semantic HTML, hand-written CSS and vanilla JavaScript with no runtime dependencies.

## Run locally

The project has no build step. From the repository root, either open `index.html` directly or serve the folder with any static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

To run the pure engine checks, use:

```bash
node tests/slot-engine.test.js
```

## Glass Box Slot Lab

The prototype uses fictional credits and a fixed 10-credit wager. Every spin:

1. Independently selects one of 20 stops on each of three reels.
2. Fixes the complete outcome before the animation begins.
3. Deducts the 10-credit wager.
4. Evaluates only the illuminated center line.
5. Returns `wager × multiplier` for an exact three-symbol match; the wager is not added a second time.

Mixed symbols, pairs, other rows and diagonals do not pay. When the balance falls below the wager, spinning is disabled until the reviewer explicitly resets the prototype.

### Reel frequencies and paytable

Every reel contains the same frequencies in a different explicit order:

| Symbol | Stops per reel | Triple combinations | Triple probability | Return |
|---|---:|---:|---:|---:|
| Seven | 1 | 1 | 0.0125% | 500× |
| Diamond | 2 | 8 | 0.1000% | 100× |
| Bell | 3 | 27 | 0.3375% | 40× |
| Cherry | 5 | 125 | 1.5625% | 16× |
| Lemon | 9 | 729 | 9.1125% | 4× |

### RTP and hit frequency

The interface does not rely on typed-in percentage labels. At startup, the engine exhaustively enumerates all `20³ = 8,000` possible center-line combinations from the actual reel arrays and paytable.

Winning combinations:

```text
1³ + 2³ + 3³ + 5³ + 9³ = 890
890 / 8,000 = 11.125% hit frequency
```

Expected returned multiplier:

```text
(1 × 500 + 8 × 100 + 27 × 40 + 125 × 16 + 729 × 4) / 8,000
= 7,296 / 8,000
= 91.2% theoretical RTP
```

The corresponding house edge is `100% − 91.2% = 8.8%`. The separate 10,000-spin model check uses the same engine and configuration, runs in non-blocking chunks, and does not touch the player balance. Its random result should vary around the theoretical values.

## Source architecture

| File | Responsibility |
|---|---|
| `index.html` | Assignment overview and navigation |
| `part1.html` | Original bundled Part 1 artifact, preserved unchanged |
| `slot.html` | Semantic Part 2 structure and inline SVG symbol definitions |
| `css/showcase.css` | Overview presentation and responsive cards |
| `css/slot.css` | Slot-lab layout, machine styling and responsive behavior |
| `js/slot-config.js` | Explicit reel strips, symbol metadata, wager and intended invariants |
| `js/slot-engine.js` | Pure selection, evaluation, settlement, enumeration and simulation functions |
| `js/slot-app.js` | DOM rendering, animation, keyboard behavior and simulation scheduling |
| `tests/slot-engine.test.js` | Deterministic checks for model totals, payouts and injected randomness |
| `AI_PROCESS.md` | Problem framing, AI-assisted workflow and candidate disclosure checklist |

Playable spins prefer Web Crypto. The engine uses rejection sampling over 32-bit integers so reel indices are unbiased, and accepts an injected integer source for deterministic tests. A documented `Math.random()` fallback keeps the interaction functional in restricted older browsers.

## Accessibility

- Native buttons, headings, tables, descriptions and expandable details
- Visible keyboard focus and a skip link
- `aria-live` feedback for completed spin results and simulation completion
- Space/Enter shortcut that does not hijack interactive controls
- Semantic disabled states during reel animation
- Sufficient color contrast without relying on color alone
- Reduced-motion mode that reveals a selected outcome effectively immediately
- Responsive layouts down to approximately 360 px without page-level horizontal overflow

## GitHub Pages

1. Open **Settings → Pages** in the repository.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose the final branch, the `/ (root)` folder, and save.
4. Open the Pages URL after the deployment completes. No environment variables or build command are required.

## Limitations

- The prototype intentionally has one fixed wager, one payline and no bonus features.
- Session balance and history are not persisted after a reload.
- Simulation results vary because they are sampled; the exhaustive verifier is the authoritative model check.
- No backend, account, payments, deposits, analytics or real-money functionality is included.

This is an educational interaction prototype using fictional credits only.
