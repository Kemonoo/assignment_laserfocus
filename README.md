# UI/UX Redesign & Playable Slot Machine Prototype

Technical assessment submission by **Michal Petruf**. The repository combines a modern UI/UX application redesign with a playable 2.5D mechanical slot machine and documents the AI-assisted process behind both parts.

## Live demo

**[Open the complete presentation on GitHub Pages](https://kemonoo.github.io/assignment_laserfocus/)**

- [Part 1 — Navigation & Layout Modernization](https://kemonoo.github.io/assignment_laserfocus/part1.html)
- [Part 2 — Industrial Sketchbook Slot Prototype](https://kemonoo.github.io/assignment_laserfocus/slot.html)

Both presentations include a **Behind the Design** button with the relevant process, design decisions, and AI workflow.

## Project breakdown

### Part 1 — UI/UX app redesign

The redesign restructures the main application navigation around a cohesive bottom bar. It explores clearer hierarchy, reduced visual noise, thumb-zone ergonomics, and fast access to Shop, Competitions, Profile, Team, Play, and Settings.

### Part 2 — playable 2.5D slot machine

The slot machine is presented as an industrial-design sketchbook rather than a conventional casino dashboard.

- **Layered 2.5D construction:** cabinet, reels, lever, symbols, and coin tray are separated visual layers animated with browser-native technology.
- **Responsive interaction:** pull the lever by dragging it, or use click/tap on smaller screens.
- **Pre-calculated results:** the mathematical outcome is selected before animation; sequential reel stops reveal that result without changing it.
- **Feedback:** lever, reel, stop, and payout audio cues accompany the visual animation, while winning coins appear in the tray.
- **Transparent model:** the paytable, latest outcome, hit rate, RTP, and house edge are explained beside the machine.

## Game mechanics and mathematical model

A pull costs **10 fictional coins**. The game uses three independently sampled reels with 20 virtual stops per reel, producing `20 × 20 × 20 = 8,000` equally likely stop combinations. Only three identical symbols on the marked center line win; pairs, diagonals, and neighbouring rows do not pay.

| Symbol | Stops per reel | Three-match outcomes | Payout multiplier |
|---|---:|---:|---:|
| Seven | 1 | 1 | 500× |
| Diamond | 2 | 8 | 100× |
| Bell | 3 | 27 | 40× |
| Cherry | 5 | 125 | 16× |
| Lemon | 9 | 729 | 4× |

The total number of winning outcomes is:

```text
1³ + 2³ + 3³ + 5³ + 9³ = 890
```

| Metric | Classic model |
|---|---:|
| Winning outcomes | 890 / 8,000 |
| Hit rate | 11.125% |
| Theoretical RTP | 91.2% |
| House edge | 8.8% |

The prototype also lets the reviewer compare alternative reel-strip presets. Whenever the strip changes, the displayed statistics are recalculated from the selected configuration.

## How the prototype works

The playable notebook is a self-contained browser artifact. On each normal pull:

1. The engine deducts the fixed wager.
2. It independently samples one virtual stop for each reel.
3. It settles the result from the three selected symbols.
4. The lever and reels animate to reveal the already-selected outcome.
5. The balance, last-pull explanation, session totals, sounds, and coin tray are updated.

The Classic model is independently represented by the readable configuration and engine files in `js/`. `tests/slot-engine.test.js` exhaustively checks all 8,000 Classic outcomes and verifies its hit rate, payout return, balance settlement, and deterministic random injection.

## AI toolchain and process

- **Gemini:** strategic planning, concept evaluation, prompt engineering, workflow architecture, and mathematical cross-checking.
- **Claude Design:** visual ideation, UI recreation, component exploration, and final notebook layout assembly.
- **ChatGPT / Codex:** engine implementation, 2.5D asset separation, probability verification, perspective alignment, mechanical animation tuning, responsive interaction, audio integration, repository integration, and testing.
- **Human direction:** selected the visual direction, supplied references and mechanical feedback, rejected weak iterations, verified clarity and playability, and decided how the tools' outputs should be combined.

AI assisted the design and implementation; it does not generate outcomes while the game is running. Runtime outcomes come from explicit reel configurations and random stop selection.

For a longer account of the iterative workflow, see [`AI_PROCESS.md`](AI_PROCESS.md).

## Repository structure

```text
index.html                Assignment landing page
part1.html                Part 1 presentation shell and methodology modal
part1-original.html       Original Part 1 interactive artifact
slot.html                 Part 2 presentation shell and methodology modal
jackpot-notebook.html     Self-contained playable slot machine artifact
css/                      Presentation and prototype styles
js/                       Process modal plus readable Classic engine source
tests/                    Deterministic and exhaustive engine checks
AI_PROCESS.md             Detailed AI-assisted design process
```

## Run locally

No installation or build step is required.

```bash
git clone https://github.com/Kemonoo/assignment_laserfocus.git
cd assignment_laserfocus
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) in a modern browser. Serving the directory is recommended because the presentation pages embed their interactive artifacts in same-origin frames.

## Verify the probability engine

Node.js is only required for the automated checks:

```bash
node --test tests/slot-engine.test.js
```

The site itself uses only HTML, CSS, and vanilla JavaScript, with no runtime package dependencies.
