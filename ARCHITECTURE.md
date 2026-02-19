# IdeaGen — Full Architecture

## Pipeline Overview

The app is a **4-stage pipeline**: **Generate → Pick → Brainstorm → Roadmap**, with data passed between pages via `sessionStorage`.

```
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────┐
│ GENERATE │───►│   PICK   │───►│  BRAINSTORM  │───►│ ROADMAP  │
│ (Step 1) │    │ (Step 2) │    │   (Step 3)   │    │ (Step 4) │
└──────────┘    └──────────┘    └──────────────┘    └──────────┘
   Claaude           User           Grok (SSE)          Claude
  extract          selects       streaming chat     JSON roadmap
```

---

## Stage 1: Generate (`app/generate/page.tsx`)

**User inputs:** Domain (8 options), Skill Level (beginner/intermediate/advanced), Interest keyword

**Flow:**

1. Checks usage limits via `canGenerate()` from `lib/storage.ts` (5 free/week)
2. `POST /api/fetch` → `lib/sources/aggregator.ts` fires **4 scrapers in parallel**:

| Source | File | Method |
|---|---|---|
| Hacker News | `lib/sources/hn.ts` | Algolia API search |
| Reddit | `lib/sources/reddit.ts` | OAuth + subreddit search |
| Dev.to | `lib/sources/devto.ts` | Tag-based API query |
| Devpost | `lib/sources/devpost.ts` | HTML scraping via Cheerio |

3. Aggregator shuffles & caps at **20 `RawContent` items**
4. `POST /api/extract` → sends content + skill level to **Claude** (`claude-sonnet-4-20250514`)
5. Claude returns exactly **3 `ExtractedIdea`** objects (skill-level-adjusted complexity)
6. Results stored in `sessionStorage` → navigates to `/pick`

---

## Stage 2: Pick (`app/pick/page.tsx`)

**Displays** 3 idea cards from sessionStorage, each showing:

- Title, source platform badge, problem statement, solution concept
- Tech stack tags, "why interesting" callout

**User actions:**

- **Bookmark** — saves to `localStorage` via `lib/storage.ts`
- **"Explore This Idea"** — converts `ExtractedIdea` → `IdeaState` using `inferTechStack()` (heuristic detection) + 5 default features → stored in `sessionStorage` → navigates to `/brainstorm/[slug]`

---

## Stage 3: Brainstorm (`app/brainstorm/[id]/page.tsx`)

**Two-panel layout (60/40):**

| Left Panel | Right Panel |
|---|---|
| `BrainstormChat` — streaming chat with Grok | `LiveIdeaPanel` — live idea state preview |
| User sends messages to refine the idea | Shows title, problem, tech stack, features, scope |
| SSE stream via `POST /api/brainstorm` | Updates in real-time as Grok responds |

**How it works:**

1. User types a message (e.g., "add WebSocket support")
2. `POST /api/brainstorm` → `lib/ai/grok.ts` calls **Grok** (`grok-beta`) with streaming enabled
3. Grok returns `{ message, updatedIdeaState }` — the chat response + modified idea state
4. `LiveIdeaPanel` re-renders with the updated `IdeaState`
5. User can also toggle features and change scope directly in the panel

**"Build The Roadmap"** → saves `finalIdea` to sessionStorage → navigates to `/roadmap/[slug]`

---

## Stage 4: Roadmap (`app/roadmap/[id]/page.tsx`)

**Three phases:** Form → Loading → Complete

1. **Form** collects `UserProfile` (skill level, available time, team size)
2. `POST /api/roadmap` → **Claude** generates a full `ProjectRoadmap` JSON containing:
   - Refined tech stack + core features with priority levels
   - Week-by-week timeline with milestones and deliverables
   - Difficulty rating, risk analysis, similar products
   - "First thing to build" recommendation
3. Rendered via `RoadmapCard` component with `WeekTimeline` visualization
4. Print/PDF export via `window.print()`

---

## Saved Ideas (`app/saved/page.tsx`)

A standalone page listing all bookmarked ideas from `localStorage`. Users can:

- View all saved ideas with timestamps
- Delete bookmarks
- **"Continue with Idea"** → jumps directly to brainstorm stage

---

## Data Flow

```
                    sessionStorage                    sessionStorage
/generate ────────► "generatedIdeas" ────► /pick ───► "selectedIdea" ───► /brainstorm
   │                "ideagenDomain"                                            │
   │                "ideagenSkillLevel"                                         │
   │                                                                    sessionStorage
   │                                                                   "finalIdea"
   │                                                                           │
   │                                                                     /roadmap
   │
   └── localStorage: usage count (5/week), premium flag
   └── localStorage: saved/bookmarked ideas
```

---

## Type Definitions (`types/idea.ts`)

| Type | Purpose |
|---|---|
| `RawContent` | A scraped item from any source (title, text, url, source) |
| `ExtractedIdea` | An idea extracted by Claude (title, problem, concept, source info, rough tech, why_interesting) |
| `TechStack` | Frontend/backend/database/extras strings |
| `Feature` | A toggleable feature name + included boolean |
| `ProjectScope` | Union: `'solo-weekend' \| 'solo-2weeks' \| 'team-hackathon' \| 'mvp-startup'` |
| `IdeaState` | The mutable idea being brainstormed (title, problem, concept, tech_stack, features, scope, removed/added lists) |
| `ConversationMessage` | Chat message with `role` + `content` |
| `BrainstormRequest/Response` | API contract for the Grok brainstorm endpoint |
| `UserProfile` | Skill level, time available, team size — used for roadmap generation |
| `CoreFeature` | Feature with priority (must/should/nice) and estimated hours |
| `RoadmapWeek` | A week's milestone, tasks, and deliverable |
| `ProjectRoadmap` | The full roadmap output (tech stack, features, weekly plan, risks, difficulty, similar products, etc.) |
| `Domain` | Union of 8 domains (health, fintech, education, environment, productivity, social, gaming, logistics) |
| `SkillLevel` | `'beginner' \| 'intermediate' \| 'advanced'` |
| `SavedIdea` | `ExtractedIdea` extended with `id`, `savedAt`, `domain`, `skillLevel` |
| `UsageData` | Weekly generation counter + premium flag |

---

## AI Model Split

| Model | Used For | Mode | Files |
|---|---|---|---|
| **Claude** (`claude-sonnet-4-20250514`) | Idea extraction + Roadmap generation | Non-streaming JSON | `lib/ai/claude.ts`, `lib/ai/prompts.ts` |
| **Grok** (`grok-beta`) | Brainstorm chat | Streaming SSE | `lib/ai/grok.ts` |

---

## API Routes

| Route | Method | Input | Output | AI Model |
|---|---|---|---|---|
| `/api/fetch` | POST | `{ domain, interest }` | `{ content: RawContent[], sources, errors }` | — |
| `/api/extract` | POST | `{ domain, content, skillLevel? }` | `{ ideas: ExtractedIdea[] }` | Claude |
| `/api/brainstorm` | POST | `{ message, ideaState, conversationHistory }` | SSE stream `{ content }` | Grok |
| `/api/roadmap` | POST | `{ finalIdea, userProfile }` | `{ roadmap: ProjectRoadmap }` | Claude |

---

## Key Components

| Component | Location | Purpose |
|---|---|---|
| `BrainstormChat` | `components/generator/BrainstormChat.tsx` | Streaming chat UI — sends messages to `/api/brainstorm`, reads SSE stream, parses JSON response, calls `onIdeaUpdate` |
| `LiveIdeaPanel` | `components/generator/LiveIdeaPanel.tsx` | Right-side panel showing current `IdeaState` — title, problem, concept, tech stack, features, scope |
| `RoadmapCard` | `components/generator/RoadmapCard.tsx` | Renders full `ProjectRoadmap` — stats, tech stack, features table, week timeline, risks, similar products |
| `TechBadge` | `components/generator/TechBadge.tsx` | Styled pill badges for technology names |
| `FeatureList` | `components/generator/FeatureList.tsx` | Toggleable feature checklist |
| `WeekTimeline` | `components/generator/WeekTimeline.tsx` | Visual timeline rendering for `RoadmapWeek[]` |
| `AsciiDots` | `components/ui/AsciiDots.tsx` | Interactive ASCII dot animation with green glitter on hover |

---

## External Services

| Service | Env Var | Required |
|---|---|---|
| Anthropic Claude | `ANTHROPIC_API_KEY` | Yes |
| xAI Grok | `GROK_API_KEY` | Yes |
| Reddit OAuth | `REDDIT_CLIENT_ID` + `REDDIT_SECRET` | Yes |
| Dev.to | `DEVTO_API_KEY` | Optional |
| HN Algolia | *(none)* | Free |
| Devpost | *(none)* | Scraped |

---

## File Tree

```
IdeaGen/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind + custom styles
│   ├── generate/page.tsx           # Step 1 — domain/skill/interest form
│   ├── pick/page.tsx               # Step 2 — choose from 3 ideas
│   ├── brainstorm/[id]/page.tsx    # Step 3 — chat with Grok
│   ├── roadmap/[id]/page.tsx       # Step 4 — full project roadmap
│   ├── saved/page.tsx              # Bookmarked ideas
│   └── api/
│       ├── fetch/route.ts          # Aggregate 4 sources
│       ├── extract/route.ts        # Claude idea extraction
│       ├── brainstorm/route.ts     # Grok streaming chat (Edge)
│       └── roadmap/route.ts        # Claude roadmap generation
├── components/
│   ├── generator/
│   │   ├── BrainstormChat.tsx
│   │   ├── LiveIdeaPanel.tsx
│   │   ├── RoadmapCard.tsx
│   │   ├── FeatureList.tsx
│   │   ├── TechBadge.tsx
│   │   ├── WeekTimeline.tsx
│   │   ├── IdeaPickCard.tsx
│   │   └── index.ts
│   └── ui/
│       └── AsciiDots.tsx
├── lib/
│   ├── ai/
│   │   ├── claude.ts               # Anthropic SDK wrapper
│   │   ├── grok.ts                 # xAI streaming wrapper
│   │   └── prompts.ts              # All prompt templates
│   ├── sources/
│   │   ├── aggregator.ts           # Parallel source fetcher
│   │   ├── hn.ts                   # Hacker News scraper
│   │   ├── reddit.ts               # Reddit OAuth scraper
│   │   ├── devto.ts                # Dev.to API fetcher
│   │   └── devpost.ts              # Devpost HTML scraper
│   └── storage.ts                  # localStorage bookmarks + usage
├── types/
│   └── idea.ts                     # All TypeScript types
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Key Design Decisions

- **sessionStorage** for inter-page state — refreshing a downstream page redirects back to `/generate`
- **localStorage** for bookmarks + usage tracking — no auth needed, entirely client-side
- **Edge Runtime** on the brainstorm route for SSE streaming support
- **Skill level** adjusts Claude's extraction prompt (beginner = simple CRUD 1-7 days, intermediate = 3-5 features 1-4 weeks, advanced = complex architectures 1-3 months)
- **Freemium**: 5 generations/week free, resets Monday; premium upgrade is a UI placeholder (no payment integration yet)
- **Two AI models** serve distinct roles: Claude for structured JSON extraction (non-streaming), Grok for conversational brainstorming (streaming SSE)
