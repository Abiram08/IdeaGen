# IdeaGen — Full Project Documentation

> **Last updated:** February 19, 2026  
> **Build status:** ✅ Compiles successfully (`next build` passes)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Environment Setup](#4-environment-setup)
5. [Project Structure](#5-project-structure)
6. [Core Flow — How It Works](#6-core-flow--how-it-works)
7. [Data Types & Schemas](#7-data-types--schemas)
8. [Source Fetchers (Stage 0)](#8-source-fetchers-stage-0)
9. [AI Layer](#9-ai-layer)
10. [API Routes](#10-api-routes)
11. [Client Storage](#11-client-storage)
12. [UI Components](#12-ui-components)
13. [Pages](#13-pages)
14. [Styling & Theme](#14-styling--theme)
15. [Configuration Files](#15-configuration-files)
16. [Running the Project](#16-running-the-project)

---

## 1. Overview

**IdeaGen** is a 4-stage AI-powered idea generation web app. It scans trending content from Reddit, Hacker News, Dev.to, and Devpost, then uses **three different AI models** to extract ideas, brainstorm refinements, and produce a complete project roadmap.

| Stage | Action | AI Model |
|-------|--------|----------|
| 1 - Fetch | Aggregate raw posts from 4 platforms | None (HTTP) |
| 2 - Extract | Analyze posts → 3 buildable ideas | **Gemini 2.0 Flash** |
| 3 - Brainstorm | Interactive chat to refine chosen idea | **Grok (grok-beta)** |
| 4 - Roadmap | Generate full project blueprint | **Claude (claude-sonnet-4-20250514)** |

Users can also bookmark ideas to localStorage and are limited to 5 free generations per week (resets on Monday) unless premium.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 3.4 + custom CSS |
| UI Components | Radix UI primitives, class-variance-authority, clsx, tailwind-merge |
| AI — Extraction | `@google/generative-ai` (Gemini 2.0 Flash) |
| AI — Brainstorm | xAI fetch API (Grok) with SSE streaming |
| AI — Roadmap | `@anthropic-ai/sdk` (Claude Sonnet) |
| Scraping | cheerio (Devpost) |
| Icons | lucide-react |
| Font | Inter (Google Fonts) |
| Storage | Browser localStorage + sessionStorage |
| Runtime | Node.js (API routes) / Edge (brainstorm route only) |

### Dependencies (`package.json`)

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.1",
    "@google/generative-ai": "^0.24.1",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "cheerio": "^1.0.0-rc.12",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "14.2.18",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.17.10",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.18",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.7.2"
  }
}
```

---

## 3. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                      │
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌────────┐ │
│  │ /generate │──▶│  /pick   │──▶│/brainstorm │──▶│/roadmap│ │
│  │  (form)   │   │ (3 cards)│   │  (chat)    │   │(result)│ │
│  └────┬─────┘   └──────────┘   └─────┬──────┘   └───┬────┘ │
│       │                               │              │       │
│  sessionStorage                  sessionStorage   sessionStorage
│  ┌────────────────────────────────────────────────────────┐  │
│  │              localStorage                              │  │
│  │  ideagen_saved (bookmarks)   ideagen_usage (usage)    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────┬──────────────────────┬────────────────┬───────────┘
           │                      │                │
     ┌─────▼─────┐         ┌─────▼─────┐   ┌─────▼─────┐
     │ /api/fetch │         │/api/brain-│   │/api/road- │
     │ /api/extract│        │  storm    │   │   map     │
     └─────┬─────┘         └─────┬─────┘   └─────┬─────┘
           │                      │                │
  ┌────────▼────────┐      ┌─────▼─────┐   ┌─────▼─────┐
  │  4 Source APIs   │      │  Grok API │   │ Claude API│
  │ (HN/Reddit/     │      │  (SSE)    │   │           │
  │  DevTo/Devpost)  │      │  (Edge)   │   │           │
  └────────┬────────┘      └───────────┘   └───────────┘
           │
     ┌─────▼─────┐
     │ Gemini API │
     │ (extract)  │
     └───────────┘
```

---

## 4. Environment Setup

Create a `.env` file at root (see `.env.example`):

```env
# Required — Gemini for idea extraction (Stage 2)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here

# Required — Claude for roadmap generation (Stage 4)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Required — Grok for brainstorm chat (Stage 3)
GROK_API_KEY=your_grok_api_key_here

# Required — Reddit OAuth
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_SECRET=your_reddit_secret_here

# Optional — Dev.to reads work without it
DEVTO_API_KEY=your_devto_api_key_here
```

### How to get each key:

| Key | Where |
|-----|-------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com/) |
| `GROK_API_KEY` | [xAI Console](https://console.x.ai/) |
| `REDDIT_CLIENT_ID` / `REDDIT_SECRET` | [Reddit Apps](https://www.reddit.com/prefs/apps) — create a "script" type app |
| `DEVTO_API_KEY` | [Dev.to Settings → API Keys](https://dev.to/settings/extensions) |

---

## 5. Project Structure

```
IdeaGen/
├── .env.example                    # Environment variable template
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config (strict, @/* paths)
├── tailwind.config.ts              # Tailwind — darkMode: 'class', green palette
├── postcss.config.js               # PostCSS with Tailwind + Autoprefixer
├── next.config.js                  # Next.js config (reactStrictMode)
│
├── types/
│   └── idea.ts                     # All TypeScript types & constants
│
├── lib/
│   ├── storage.ts                  # localStorage: bookmarks + usage tracking
│   ├── ai/
│   │   ├── prompts.ts              # System prompts + user prompt builders
│   │   ├── gemini.ts               # Gemini 2.0 Flash — extractIdeas()
│   │   ├── grok.ts                 # Grok streaming — streamBrainstorm()
│   │   └── claude.ts               # Claude Sonnet — generateRoadmap()
│   └── sources/
│       ├── hn.ts                   # Hacker News (Algolia API)
│       ├── reddit.ts               # Reddit (OAuth + search)
│       ├── devto.ts                # Dev.to (public API)
│       ├── devpost.ts              # Devpost (cheerio scraping)
│       └── aggregator.ts           # Fires all 4 in parallel, dedupes, shuffles
│
├── components/
│   ├── ui/
│   │   └── AsciiDots.tsx           # Interactive dot grid background
│   └── generator/
│       ├── index.ts                # Barrel exports
│       ├── TechBadge.tsx           # Pill badge for tech labels
│       ├── IdeaPickCard.tsx        # Idea card with bookmark + source badge
│       ├── LiveIdeaPanel.tsx       # Real-time idea state display
│       ├── BrainstormChat.tsx      # Streaming chat UI (SSE)
│       ├── FeatureList.tsx         # Feature table with priority badges
│       ├── WeekTimeline.tsx        # Vertical timeline with green circles
│       └── RoadmapCard.tsx         # Full roadmap blueprint renderer
│
├── app/
│   ├── globals.css                 # 400+ lines: glass effects, animations, print
│   ├── layout.tsx                  # Root layout with AsciiDots + Inter font
│   ├── page.tsx                    # Landing page (/)
│   ├── generate/
│   │   └── page.tsx                # Step 1: Domain + skill + interest form
│   ├── pick/
│   │   └── page.tsx                # Step 2: Pick from 3 extracted ideas
│   ├── brainstorm/
│   │   └── [id]/
│   │       └── page.tsx            # Step 3: Chat with Grok (60/40 split)
│   ├── roadmap/
│   │   └── [id]/
│   │       └── page.tsx            # Step 4: User profile → generate blueprint
│   ├── saved/
│   │   └── page.tsx                # Bookmarked ideas collection
│   └── api/
│       ├── fetch/route.ts          # POST — aggregate sources
│       ├── extract/route.ts        # POST — Gemini extraction
│       ├── brainstorm/route.ts     # POST — Grok SSE stream (Edge runtime)
│       └── roadmap/route.ts        # POST — Claude roadmap
```

---

## 6. Core Flow — How It Works

### Stage 1: Fetch + Extract (Generate Page)

1. User selects a **domain** (health, fintech, education, etc.), **skill level** (beginner/intermediate/advanced), and types an **interest keyword**
2. Client sends `POST /api/fetch` with `{ domain, interest }`
3. Server fires 4 source fetchers in parallel:
   - **Hacker News** — Algolia API, searches Ask HN / Show HN
   - **Reddit** — OAuth token → searches SideProject, hackathon, learnprogramming, startups, webdev
   - **Dev.to** — public API, tagged by domain mapping
   - **Devpost** — HTML scraping with cheerio
4. Results are deduplicated by URL, shuffled, capped at 20 items
5. Client sends `POST /api/extract` with `{ domain, interest, skillLevel, content }`
6. Server sends all content to **Gemini 2.0 Flash** with a scoring rubric prompt
7. Gemini returns exactly 3 `ExtractedIdea` objects as JSON
8. Ideas are stored in `sessionStorage('generatedIdeas')` and user is redirected to `/pick`

### Stage 2: Pick (Pick Page)

1. Page loads the 3 ideas from sessionStorage
2. Each idea is displayed as an `IdeaPickCard` with title, problem, concept, tech stack chips, source badge, and a "why interesting" callout
3. User can **bookmark** any idea (saves to localStorage via `saveIdea()`)
4. User clicks "Explore This Idea" on their chosen card
5. An `IdeaState` is constructed from the `ExtractedIdea` (inferring frontend/backend/database from rough_tech) and stored in `sessionStorage('selectedIdea')`
6. User is redirected to `/brainstorm/[id]`

### Stage 3: Brainstorm (Brainstorm Page)

1. Two-panel layout: **left 60%** = chat, **right 40%** = live idea state display
2. User types messages like "Change the backend to Python" or "Add real-time notifications"
3. Client sends `POST /api/brainstorm` (Edge runtime) with `{ message, ideaState, conversationHistory }`
4. Server calls **Grok API** with streaming enabled, pipes the SSE response back
5. Client reads the stream chunk-by-chunk, displays tokens in real-time
6. When streaming completes, the full response is parsed as JSON `{ message, updatedIdeaState }`
7. If `updatedIdeaState` is non-null, the right panel updates live (tech stack, features, added/removed lists)
8. When satisfied, user clicks "Build The Roadmap" → stores `finalIdea` in sessionStorage → navigates to `/roadmap/[id]`

### Stage 4: Roadmap (Roadmap Page)

1. **Phase 1 — Form:** User fills in skill level, time available (1 day / 1 week / 2 weeks / 1 month), team size (solo / 2 people / 3-4 people)
2. **Phase 2 — Loading:** Client sends `POST /api/roadmap` with `{ finalIdea, userProfile }`. Displays "Claude is analyzing your idea..."
3. Server calls **Claude Sonnet** with the roadmap system prompt. Claude returns a `ProjectRoadmap` JSON
4. **Phase 3 — Complete:** The `RoadmapCard` component renders the full blueprint:
   - Title + tagline
   - **"First thing to build"** highlighted CTA (green box)
   - Problem statement + target user + unique angle
   - Tech stack grid (frontend, backend, database, auth, hosting, extras)
   - Difficulty bar (1-10 scale)
   - Core features table with priority badges (must/should/nice) and hour estimates
   - Weekly timeline (vertical with green circles and task lists)
   - Technical risks (amber warning box)
   - Similar products
   - Print / Save as PDF button

### Bookmarks (Saved Page)

- Ideas are saved to `localStorage('ideagen_saved')` with `crypto.randomUUID()` IDs
- Deduplication by `source_url`
- Cap of 50 saved ideas
- User can delete individual ideas or click to continue brainstorming any saved idea

---

## 7. Data Types & Schemas

**File:** `types/idea.ts`

### Core Types

```typescript
type Domain = 'health' | 'fintech' | 'education' | 'environment' |
              'productivity' | 'social' | 'gaming' | 'logistics';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

type ProjectScope = 'solo-weekend' | 'solo-2weeks' | 'team-hackathon' | 'mvp-startup';
```

### Data Flow Types

```typescript
// Raw content from source fetchers
type RawContent = {
  title: string;
  text: string;
  url: string;
  source: 'reddit' | 'hackernews' | 'devto' | 'devpost';
};

// Output from Gemini extraction
type ExtractedIdea = {
  title: string;
  problem: string;
  concept: string;
  target_user: string;
  source_platform: 'reddit' | 'hackernews' | 'devto' | 'devpost';
  source_url: string;
  rough_tech: string[];
  why_interesting: string;
};

// Mutable state during brainstorm
type IdeaState = {
  title: string;
  problem: string;
  concept: string;
  tech_stack: TechStack;       // { frontend, backend, database, extra[] }
  features: Feature[];         // { name, included }
  scope: ProjectScope;
  removed: string[];           // Tracks removed items across brainstorm turns
  added: string[];             // Tracks added items across brainstorm turns
};

// User profile for roadmap customization
type UserProfile = {
  skill_level: SkillLevel;
  time_available: '1 day' | '1 week' | '2 weeks' | '1 month';
  team_size: 'solo' | '2 people' | '3-4 people';
};

// Final roadmap output from Claude
type ProjectRoadmap = {
  title: string;
  tagline: string;
  problem_statement: string;
  target_user: string;
  unique_angle: string;
  tech_stack: { frontend, backend, database, auth, hosting, extras: string[] };
  core_features: CoreFeature[];     // { name, description, priority, est_hours }
  roadmap: RoadmapWeek[];           // { week, milestone, tasks[], deliverable }
  technical_risks: string[];
  difficulty_score: number;         // 1-10
  estimated_total_hours: number;
  similar_products: string[];
  first_thing_to_build: string;
};

// Bookmark storage
type SavedIdea = ExtractedIdea & {
  id: string;           // crypto.randomUUID()
  savedAt: string;      // ISO date string
  domain: Domain;
  skillLevel: SkillLevel;
};

// Usage tracking
type UsageData = {
  count: number;        // generations used this week
  weekStart: string;    // ISO string of Monday 00:00
  isPremium: boolean;
};
```

---

## 8. Source Fetchers (Stage 0)

All fetchers return `RawContent[]`. The aggregator calls all 4 in parallel with `Promise.allSettled`.

### Hacker News (`lib/sources/hn.ts`)

- **API:** `https://hn.algolia.com/api/v1/search`
- **Query:** User's interest keyword
- **Tags filter:** `(ask_hn,show_hn)` — only Ask HN and Show HN posts
- **Limit:** 10 results, filters where `story_text.length > 30`
- **Export:** `fetchFromHN(interest: string)`

### Reddit (`lib/sources/reddit.ts`)

- **Auth:** OAuth client_credentials grant with cached token
- **Subreddits:** `SideProject+hackathon+learnprogramming+startups+webdev`
- **Sort:** top, limit 10
- **Filter:** `selftext.length > 50`
- **User-Agent:** `IdeaGen/1.0`
- **Export:** `fetchFromReddit(interest: string)`

### Dev.to (`lib/sources/devto.ts`)

- **API:** `https://dev.to/api/articles`
- **Tag mapping:** Domain → tag (health→healthtech, fintech→fintech, education→edtech, etc.)
- **Params:** `top=10, per_page=10`
- **Filter:** `description.length > 20`
- **Optional API key** via `DEVTO_API_KEY`
- **Export:** `fetchFromDevTo(domain: string)`

### Devpost (`lib/sources/devpost.ts`)

- **Method:** HTML scraping with cheerio
- **URL:** `https://devpost.com/software/search?query=...`
- **Selectors:** `.software-entry`, `.gallery-item`, `[data-software-id]`, fallback to `a[href*="/software/"]`
- **Cap:** 8 results
- **Export:** `fetchFromDevpost(interest: string)`

### Aggregator (`lib/sources/aggregator.ts`)

```typescript
export async function fetchAllSources(domain: string, interest: string):
  Promise<{ content: RawContent[]; sources: string[]; errors: string[] }>
```

- Fires all 4 fetchers with `Promise.allSettled`
- Deduplicates by URL
- Shuffles randomly (so no single source dominates)
- Caps at 20 total items
- Returns which sources were active and any errors

---

## 9. AI Layer

### Prompts (`lib/ai/prompts.ts`)

The prompt file exports 3 system prompts and 3 user prompt builders:

| Export | Used By | Purpose |
|--------|---------|---------|
| `EXTRACT_SYSTEM_PROMPT` | Gemini | Scoring rubric (+3/-3 system), rules for extraction |
| `buildExtractPrompt(domain, interest, skillLevel, content)` | Gemini | Skill-adjusted extraction instructions + raw content |
| `BRAINSTORM_SYSTEM_PROMPT` | Grok | Rules for tracking removed[]/added[], JSON response format |
| `buildBrainstormPrompt(ideaState, message)` | Grok | Current idea state + user message |
| `ROADMAP_SYSTEM_PROMPT` | Claude | "Senior project architect" — one input → one structured output |
| `buildRoadmapPrompt(ideaState, userProfile)` | Claude | Confirmed idea + user profile → ProjectRoadmap schema |

**Extraction scoring rubric** (internal, never shown to user):
```
+3 named specific problem stated in content
+2 multiple people reference same frustration
+2 no obvious existing solution mentioned
+2 buildable with standard web/mobile tech
+1 clear identifiable target user
-3 generic or vague ("build an AI app")
-3 already saturated product category
-2 requires hardware or blockchain
```

### Gemini (`lib/ai/gemini.ts`)

```typescript
export async function extractIdeas(
  domain: string, interest: string, skillLevel: string, content: RawContent[]
): Promise<ExtractedIdea[]>
```

- Model: **`gemini-2.0-flash`**
- Combines system prompt + user prompt into a single string (Gemini doesn't have a separate system role)
- Strips markdown fences from response before JSON parsing
- **Retry logic:** If first parse fails, retries with stricter "return ONLY JSON" instruction
- Returns exactly 3 ideas (accepts 1-3 on retry)

### Grok (`lib/ai/grok.ts`)

```typescript
export async function streamBrainstorm(
  message: string, ideaState: IdeaState, conversationHistory: ConversationMessage[]
): Promise<Response>
```

- Model: **`grok-beta`**
- Endpoint: `https://api.x.ai/v1/chat/completions`
- **Streaming enabled** (`stream: true`)
- Returns the raw `Response` object — the API route pipes `response.body` directly
- Message format: system prompt + conversation history + current user prompt

### Claude (`lib/ai/claude.ts`)

```typescript
export async function generateRoadmap(
  ideaState: IdeaState, userProfile: UserProfile
): Promise<ProjectRoadmap>
```

- Model: **`claude-sonnet-4-20250514`**
- Max tokens: 4000
- Uses proper system / user message separation
- Strips markdown fences before JSON parsing
- Validates that `title`, `core_features`, and `roadmap` exist in response

---

## 10. API Routes

### `POST /api/fetch`

**Body:** `{ domain: string, interest: string }`  
**Handler:** Calls `fetchAllSources()` from aggregator  
**Returns:** `{ content: RawContent[], sources: string[], errors: string[] }`

### `POST /api/extract`

**Body:** `{ domain: string, interest: string, content: RawContent[], skillLevel: string }`  
**Handler:** Calls `extractIdeas()` from Gemini client  
**Returns:** `{ ideas: ExtractedIdea[] }`  
**Validates:** `GOOGLE_GENERATIVE_AI_API_KEY` exists

### `POST /api/brainstorm` (Edge Runtime)

**Body:** `{ message: string, ideaState: IdeaState, conversationHistory: ConversationMessage[] }`  
**Handler:** Calls `streamBrainstorm()` from Grok client, pipes response body as SSE  
**Returns:** `text/event-stream` (Server-Sent Events)  
**Runtime:** `export const runtime = 'edge'`

### `POST /api/roadmap`

**Body:** `{ finalIdea: IdeaState, userProfile: UserProfile }`  
**Handler:** Calls `generateRoadmap()` from Claude client  
**Returns:** `{ roadmap: ProjectRoadmap }`  
**Validates:** `ANTHROPIC_API_KEY` exists

---

## 11. Client Storage

**File:** `lib/storage.ts`

### Usage Tracking

| Key | `ideagen_usage` |
|-----|-----------------|
| Shape | `{ count: number, weekStart: string, isPremium: boolean }` |
| Limit | 5 free generations per week |
| Reset | Every Monday at midnight (ISO week comparison) |

| Function | Signature | Description |
|----------|-----------|-------------|
| `canGenerate()` | `→ boolean` | True if premium or count < 5 |
| `incrementUsage()` | `→ void` | Bumps count by 1 |
| `getRemainingGenerations()` | `→ number` | Returns `Infinity` if premium, else `max(0, 5 - count)` |

### Bookmarks

| Key | `ideagen_saved` |
|-----|-----------------|
| Shape | `SavedIdea[]` (sorted newest-first) |
| Max | 50 items |
| Dedup | By `source_url` |

| Function | Signature | Description |
|----------|-----------|-------------|
| `getSavedIdeas()` | `→ SavedIdea[]` | Returns sorted list |
| `saveIdea(idea, domain, skillLevel)` | `→ void` | Adds with `crypto.randomUUID()` ID, ISO `savedAt` |
| `deleteIdea(id)` | `→ void` | Removes by ID |
| `isIdeaSaved(source_url)` | `→ boolean` | Checks if URL already bookmarked |

### Session Storage Keys

| Key | Written By | Read By | Content |
|-----|-----------|---------|---------|
| `generatedIdeas` | Generate page | Pick page | `ExtractedIdea[]` (JSON) |
| `ideagenDomain` | Generate page | Pick page | Domain string |
| `ideagenSkillLevel` | Generate page | Pick page | SkillLevel string |
| `searchParams` | Generate page | — | `{ domain, interest, skillLevel }` |
| `selectedIdea` | Pick page | Brainstorm page | `IdeaState` (JSON) |
| `finalIdea` | Brainstorm page | Roadmap page | `IdeaState` (JSON) |

---

## 12. UI Components

### `AsciiDots` (`components/ui/AsciiDots.tsx`)

Interactive dot grid background. Dots glow green (#07D160) when the mouse cursor is within 80px. Uses `requestAnimationFrame` for smooth per-frame updates. Rebuilds the grid on window resize.

### `TechBadge` (`components/generator/TechBadge.tsx`)

Simple pill badge: `<span>` with zinc-800 background, zinc-300 text, zinc-700 border. Takes `{ label: string }`.

### `IdeaPickCard` (`components/generator/IdeaPickCard.tsx`)

Full idea card used on the Pick page. Props:
- `idea: ExtractedIdea` — the idea data
- `index: number` — for staggered animation delay
- `onSelect: () => void` — "Explore This Idea" click
- `onBookmark: () => void` — bookmark toggle click
- `isBookmarked: boolean` — controls bookmark icon state

Features: source platform badge (color-coded per platform), tech chips, "why interesting" callout box, external source link, bookmark toggle.

### `LiveIdeaPanel` (`components/generator/LiveIdeaPanel.tsx`)

Right panel on the brainstorm page. Takes `{ idea: IdeaState }`. Displays:
- Title + scope badge
- Problem & concept text
- Tech stack breakdown (frontend/backend/database/extras) with icons
- Feature checklist (green check / gray X)
- Added items list (green + icons)
- Removed items list (red - icons)

### `BrainstormChat` (`components/generator/BrainstormChat.tsx`)

Streaming chat interface. Props:
- `ideaState: IdeaState` — current state
- `onIdeaUpdate: (newState: IdeaState) => void` — called when Grok returns updatedIdeaState
- `onConfirm: () => void` — "Build The Roadmap" button
- `onStartOver: () => void` — reset button

Features:
- SSE streaming with real-time token display
- Suggestion chips when chat is empty ("Change the backend to Python", etc.)
- JSON response parsing to extract `{ message, updatedIdeaState }`
- Animated typing indicator (3 pulsing dots)
- Enter to send, Shift+Enter for newline

### `FeatureList` (`components/generator/FeatureList.tsx`)

Table rendering `CoreFeature[]`. Columns: Feature name, Description (hidden on mobile), Priority badge, Hours. Priority colors:
- `must` → red
- `should` → amber
- `nice` → zinc

### `WeekTimeline` (`components/generator/WeekTimeline.tsx`)

Vertical timeline rendering `RoadmapWeek[]`. Each week shows a numbered green circle, connecting vertical line, milestone title, deliverable subtitle, and task bullet list.

### `RoadmapCard` (`components/generator/RoadmapCard.tsx`)

Full blueprint renderer for `ProjectRoadmap`. Sections:
1. Title + tagline (centered)
2. "First Thing to Build" — green highlighted box with ⚡ icon
3. Problem statement + unique angle (2-column grid)
4. Tech stack grid (6 fields + extras as TechBadges)
5. Difficulty bar (1-10 with gradient fill)
6. Core features table (FeatureList component)
7. Weekly roadmap (WeekTimeline component)
8. Technical risks (amber warning box)
9. Similar products (TechBadge list)
10. Print / Save as PDF button

---

## 13. Pages

### Landing Page (`app/page.tsx` — Route: `/`)

- Hero section with animated gradient text "Your smart idea generator"
- "Powered by 3 AI Models" badge
- 4-step "How it works" cards (Fetch → Extract → Brainstorm → Roadmap)
- Step 02 description: "Gemini AI analyzes the content..."
- Sources section (Reddit, Hacker News, Dev.to, Devpost)
- CTA to `/generate`
- Footer: "Built with Next.js, Gemini, Grok & Claude"

### Generate Page (`app/generate/page.tsx` — Route: `/generate`)

- Step 1 of 4 badge
- Form: Domain dropdown (8 options with emoji icons), Skill Level dropdown (3 levels), Interest text input
- Usage counter showing remaining free generations (or "Premium — Unlimited")
- Loading state with source scanning animation, then "Gemini is analyzing and extracting 3 unique ideas..."
- Upgrade modal when weekly limit reached (5/week free, Premium $9/month placeholder)
- On success: stores ideas in sessionStorage → redirects to `/pick`

### Pick Page (`app/pick/page.tsx` — Route: `/pick`)

- Step 2 of 4 badge
- Loads generated ideas from sessionStorage
- Renders 3 `IdeaPickCard` components in a grid
- Bookmark toggle saves/removes via `saveIdea()` / `deleteIdea()`
- "Explore This Idea" constructs `IdeaState` and navigates to brainstorm

### Brainstorm Page (`app/brainstorm/[id]/page.tsx` — Route: `/brainstorm/:id`)

- Step 3 of 4 badge
- Full-height layout: header → two-panel main → bottom bar
- Left 60%: `BrainstormChat` component (streaming SSE chat)
- Right 40%: `LiveIdeaPanel` component (real-time state display)
- Bottom bar: "Start Over" (back to pick) and "I'm Happy — Build The Roadmap" buttons
- The bottom bar buttons AND the chat component both have confirm/startOver actions

### Roadmap Page (`app/roadmap/[id]/page.tsx` — Route: `/roadmap/:id`)

- Step 4 of 4 badge
- Three phases:
  1. **Form**: Selected idea summary + skill level / time / team size dropdowns → "Generate My Roadmap"
  2. **Loading**: Spinner + "Claude is analyzing your idea and creating a detailed project plan..."
  3. **Complete**: Full `RoadmapCard` rendering + footer with "Generate New Ideas" and "Print / Save as PDF"

### Saved Page (`app/saved/page.tsx` — Route: `/saved`)

- "Your Collection" badge
- Loads bookmarks from `getSavedIdeas()`
- Grid of cards showing: saved date, title, problem, concept, tech stack chips, "why interesting" callout
- Delete button (trash icon) → calls `deleteIdea(id)`
- "Continue with Idea" button → constructs IdeaState → navigates to brainstorm
- Empty state with "Generate Ideas" CTA

### Layout (`app/layout.tsx`)

- Root layout wrapping all pages
- Inter font from Google Fonts
- AsciiDots background layer
- Noise overlay texture
- Dark background `#08080c`, white text

---

## 14. Styling & Theme

### Color Palette

| Role | Value |
|------|-------|
| Background | `#08080c` (near-black) |
| Accent green | `#07D160` |
| Accent green light | `#00FF80` |
| Accent cyan | `#22d3b4` |
| Text primary | white |
| Text secondary | `zinc-400` |
| Text muted | `zinc-500` |
| Glass background | `rgba(255,255,255, 0.02-0.05)` |

### CSS Classes (from `globals.css`)

| Class | Effect |
|-------|--------|
| `.glass` | 3% white bg, 20px blur, 8% white border |
| `.glass-card` | 2% white bg, 12px blur, hover lifts up + green border glow |
| `.glow-button` | White bg, black text, green glow on hover |
| `.green-button` | Transparent bg, green border, green glow on hover |
| `.gradient-text` | Green gradient clipped to text |
| `.gradient-text-animated` | Shimmer animation on gradient text |
| `.orb` / `.orb-green` | Floating blurred green gradient circles |
| `.ascii-dot` / `.ascii-dot.glitter` | Dot grid base + glowing state |
| `.input-dark` | Dark input with green focus ring |
| `.badge` | Light badge with hover-to-green transition |
| `.spinner` | Green spinning circle |
| `.typing-cursor` | Blinking green cursor |
| `.noise` | Full-screen noise texture overlay (2% opacity) |
| `.fade-in-up` | Entrance animation (0→30px translateY + opacity) |

### Print Styles

```css
@media print {
  /* Hides: noise, orbs, dots, header, footer, .print:hidden */
  /* Glass cards → white bg, black border, no backdrop-filter */
  /* All text → black, no text-shadow */
}
```

### Tailwind Config

```typescript
// tailwind.config.ts
darkMode: 'class',
theme.extend.colors: {
  green: { 400: '#07D160', 500: '#07D160', 600: '#06B050' }
}
```

---

## 15. Configuration Files

### `tsconfig.json`

- Strict mode enabled
- Module resolution: `bundler`
- Path alias: `@/*` → `./*`
- JSX: `preserve` (Next.js handles compilation)
- Incremental compilation enabled

### `next.config.js`

```javascript
const nextConfig = { reactStrictMode: true };
module.exports = nextConfig;
```

### `postcss.config.js`

```javascript
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

---

## 16. Running the Project

### Install & Dev

```bash
npm install
cp .env.example .env     # Then fill in your API keys
npm run dev               # → http://localhost:3000
```

### Build & Start

```bash
npm run build             # Type-checks + compiles
npm start                 # Production server
```

### Available Scripts

| Script | Command |
|--------|---------|
| `npm run dev` | `next dev` — development server with hot reload |
| `npm run build` | `next build` — production build with type checking |
| `npm start` | `next start` — serve production build |
| `npm run lint` | `next lint` — ESLint check |

### Build Output

```
Route (app)                              Size     First Load JS
┌ ○ /                                    176 B    94.1 kB
├ ○ /generate                            5.84 kB  99.8 kB
├ ○ /pick                                4.79 kB  98.7 kB
├ ƒ /brainstorm/[id]                     5.09 kB  99 kB
├ ƒ /roadmap/[id]                        5.54 kB  99.5 kB
├ ○ /saved                               4.58 kB  98.5 kB
├ ƒ /api/brainstorm                      0 B      0 B (Edge)
├ ƒ /api/extract                         0 B      0 B
├ ƒ /api/fetch                           0 B      0 B
└ ƒ /api/roadmap                         0 B      0 B

○ = Static    ƒ = Dynamic (server-rendered)
```
