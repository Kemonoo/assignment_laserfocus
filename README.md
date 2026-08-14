# Laserfocus UI/UX & Slot Prototype

A completed technical assignment covering a UI/UX game-interface redesign and a playable, mathematically transparent slot-machine prototype.

## 🚀 Live Demo

The easiest way to review both parts is through the GitHub Pages deployment:

**[View the Live Prototype on GitHub Pages](https://kemonoo.github.io/assignment_laserfocus/)**

- [Part 1: UI/UX review and redesign](https://kemonoo.github.io/assignment_laserfocus/part1.html)
- [Part 2: One-Armed Bandit prototype](https://kemonoo.github.io/assignment_laserfocus/slot.html)

## Assignment Overview

- Review and redesign the provided game interface.
- Produce two distinct UI/UX design directions.
- Build a functional slot-machine prototype.
- Document the mechanics, source code, probability model, and AI tools used.

## Game Mechanics & Probabilities

The prototype uses three independent reels with 20 equally likely stops per reel. A pull costs 10 fictional credits, and only the center payline is evaluated.

A win requires three matching center symbols. Pairs, mixed symbols, other rows, and diagonals do not pay.

| Symbol | Stops per reel | Payout |
|---|---:|---:|
| Seven | 1 | 500× |
| Diamond | 2 | 100× |
| Bell | 3 | 40× |
| Cherry | 5 | 16× |
| Lemon | 9 | 4× |

The engine enumerates all `20³ = 8,000` possible outcomes from the reel configuration:

- **Winning outcomes:** 890
- **Hit frequency:** 11.125%
- **Theoretical RTP:** 91.2%
- **House edge:** 8.8%

The complete outcome is selected before the reel animation begins. The on-page figures are derived from the same reel arrays and paytable used by the playable machine.

## AI Toolchain & Tech Stack

- **Claude Design:** Recreated the supplied interface, explored design variations, and generated the initial Part 1 HTML/CSS.
- **Gemini:** Developed the high-level concept, transparent slot-machine framing, and project workflow.
- **ChatGPT:** Implemented the slot logic and mathematics engine, integrated the repository, and created the pull requests.
- **GitHub Pages:** Hosts the final static deployment.
- **Vanilla HTML, CSS, SVG, and JavaScript:** Powers the project without frameworks, runtime dependencies, or a build step.

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Kemonoo/assignment_laserfocus.git
   ```
2. Open the project directory:
   ```bash
   cd assignment_laserfocus
   ```
3. Open `index.html` in a modern browser.
