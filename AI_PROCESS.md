# AI-assisted design process

## Starting point

The assignment required two distinct outcomes: a UI/UX redesign and a working slot-machine prototype whose winning rules, source code, and AI-assisted process could be clearly explained.

For Part 2, the first concept was a “Glass Box Slot Lab”: a playable machine beside an explanation of the probability model. The first implementation proved the engine and mathematics, but its dark dashboard styling felt generic and did not establish a memorable art direction. I rejected that presentation and changed the workflow from code-first generation to reference-led iteration.

## Establishing the visual direction

I supplied a vintage one-armed-bandit reference and explored two directions with AI:

1. A clean monochrome editorial interface.
2. An industrial-design sketchbook presentation.

I selected the sketchbook direction because it gave the machine stronger physical proportions and turned the supporting explanation into part of the concept. Sections such as “How to win,” “Last pull,” and “Why these odds?” make the page read like an annotated prototype rather than a casino landing page.

A fully modelled 3D implementation was considered, but it would have required mesh cleanup, separated moving parts, rigging, and a WebGL renderer. For the assignment scope, I chose a lighter 2.5D method: generated and reconstructed visual layers are animated with HTML, CSS transforms, and vanilla JavaScript.

## Interaction and mechanical iteration

The machine was refined through repeated visual and interaction feedback:

- The cabinet, reel symbols, and winning zone were aligned to the same perspective.
- The symbol strip was moved vertically until the selected objects landed clearly inside the center rectangles.
- The initial lever rotated away from the cabinet. Its path was corrected to travel parallel to the right side and approximate the crank mechanism around the side wheel.
- The lever supports dragging on desktop and tap/click interaction on mobile. Touch suppression is limited to the interactive lever so the surrounding notebook can still scroll.
- The complete result is selected before animation. Reels then stop one by one, with a longer delay on the final reel, so the animation creates anticipation without affecting the outcome.
- Browser-generated sounds provide lever, spin, reel-stop, and payout feedback without requiring an audio service.
- Winning coins appear in the lower tray, with a larger display for high-value wins.

The slot machine was ultimately isolated as a self-contained artifact so its interaction could be developed independently and inserted into the final presentation without coupling it to an unsuccessful earlier page design.

## Game design and mathematical verification

The Classic model uses five symbols distributed across 20 virtual stops per reel:

| Symbol | Stops | Payout |
|---|---:|---:|
| Seven | 1 | 500× |
| Diamond | 2 | 100× |
| Bell | 3 | 40× |
| Cherry | 5 | 16× |
| Lemon | 9 | 4× |

With three independently sampled reels there are `20³ = 8,000` equally likely stop combinations. A win requires three identical center symbols, so the number of winning combinations is:

```text
1³ + 2³ + 3³ + 5³ + 9³ = 890
```

This produces an 11.125% hit rate. Applying the payout multipliers to every winning combination produces 7,296 returned wager units across 8,000 unit wagers: a theoretical RTP of 91.2% and a house edge of 8.8%.

The result is not selected by the animation. The engine samples exact reel stops first, settles the wager, and only then animates the reels to reveal those stops. The readable reference engine is tested by exhaustively enumerating all 8,000 Classic outcomes instead of trusting manually written interface labels or a finite random simulation.

## Division of work

- **Gemini:** strategic planning, early concept evaluation, prompt engineering, workflow architecture, and mathematical cross-checking.
- **Claude Design:** visual ideation, Part 1 interface recreation, layout exploration, and final sketchbook notebook assembly.
- **ChatGPT / Codex:** slot engine implementation, tests, 2.5D asset work, mechanical and perspective corrections, mobile interaction, custom audio triggers, documentation, and repository integration.
- **Human direction:** selected the visual direction, supplied references, rejected weak outputs, explained the mechanical corrections, prioritized revisions, and verified whether the interface communicated each result clearly.

The project therefore did not come from a single prompt. AI accelerated exploration and implementation, while human review determined which outputs were kept, corrected, combined, or discarded. The runtime game itself is a conventional explicit probability engine; AI helped build it but does not decide live outcomes.
