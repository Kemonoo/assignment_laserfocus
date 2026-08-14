# AI-assisted process

## Problem framing

The central design decision was to avoid another branded slot-machine reskin. Generating a familiar casino interface is straightforward; making the rules, selected outcome and long-run mathematics legible is the more relevant product and engineering challenge.

That led to the **Glass Box Slot Lab** concept: the playable object sits beside a transparent engine panel. The reviewer can see the model totals before playing, audit every completed spin, inspect each selected stop, and compare a random simulation with an exhaustive theoretical calculation.

The interaction uses fictional credits and deliberately excludes deposits, purchases, accounts, urgency, retention loops and other real-money or manipulative mechanics.

## Division of work

### Ideation

- Explored how Part 2 could demonstrate product judgment instead of visual theming alone.
- Selected the side-by-side machine and data-panel direction.
- Reduced the scope to one payline, a fixed wager and exact triple matches so every rule remains explainable.

### Implementation

- Kept configuration, mathematical logic and DOM behavior in separate readable files.
- Defined all 20 stops on every reel explicitly.
- Selected each outcome before animating its reveal.
- Used locally contained SVG symbols and no runtime dependencies.

### Testing and verification

- Exhaustively enumerated all 8,000 possible center-line outcomes from the actual configuration.
- Compared integer totals with the intended model invariants.
- Added deterministic Node checks for frequency totals, payouts, balance settlement and injected random values.
- Reviewed keyboard behavior, reduced motion, responsive layout and the separation between player and simulation state.

### Human review

Before submission, the candidate should:

- Review all product copy and visual details in the deployed site.
- Confirm Part 1 still behaves exactly as the original artifact.
- Test the final GitHub Pages URL on desktop and a physical mobile device.
- Confirm this disclosure lists only tools and prompt iterations that were genuinely used.

## AI tools actually used — candidate review required

Edit this list before submission so product names and model names are exact:

- **Gemini** — early exploration of the side-by-side playable-machine and explanatory-panel direction.
- **ChatGPT / Codex** — concept refinement, implementation, engine tests, responsive review and documentation.
- **Candidate:** add, remove or correct entries here; do not list a tool merely because it was considered.

## Prompt iterations — candidate review required

Replace or expand these summaries if the assignment requires verbatim prompts:

1. **Concept exploration:** Propose a distinctive, achievable slot-machine prototype for a job application, with the playable game and its data shown side by side.
2. **Scope and mathematics:** Define a small three-reel model whose exact hit frequency, RTP and house edge can be derived and verified.
3. **Implementation brief:** Preserve the existing Part 1 artifact; build a static “Glass Box Slot Lab” with explicit reel strips, one center payline, injected randomness, exhaustive enumeration, a last-spin audit and a separate 10,000-spin simulation.
4. **Quality pass:** Verify the mathematics, source separation, keyboard handling, reduced motion, mobile layout and documentation before publication.

Only include prompt text or summaries that reflect the real working process.
