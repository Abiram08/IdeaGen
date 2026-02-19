# IdeaGen - Project Idea Generator

A 5-stage linear flow application that helps developers discover and plan project ideas from trending content across multiple platforms.

## Features

- **Stage 1 - Fetch & Extract**: Search across Reddit, Hacker News, Dev.to, and Devpost for trending content, then extract project ideas using Claude AI
- **Stage 2 - Pick**: View 3 distinct project ideas and select one to explore
- **Stage 3 - Brainstorm**: Refine your idea through a chat interface powered by Grok with real-time streaming
- **Stage 5 - Roadmap**: Get a complete project blueprint including timeline, features, and technical guidance

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **AI**: 
  - Anthropic Claude (claude-sonnet-4-20250514) for idea extraction and roadmap generation
  - xAI Grok (grok-beta) for brainstorm chat with streaming
- **Data Sources**: Reddit, Hacker News, Dev.to, Devpost

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ideagen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Fill in your API keys in `.env`:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
GROK_API_KEY=your_grok_api_key
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_SECRET=your_reddit_secret
DEVTO_API_KEY=your_devto_api_key  # Optional
```

### API Key Setup

#### Anthropic API
- Visit [console.anthropic.com](https://console.anthropic.com)
- Create an account and generate an API key

#### Grok API (xAI)
- Visit [x.ai/api](https://x.ai/api)
- Create an account and generate an API key

#### Reddit API
1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Create a new app (select "script" type)
3. Use the client ID and secret

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app
  /api
    /fetch/route.ts       # Fetches content from all sources
    /extract/route.ts     # Extracts ideas using Claude
    /brainstorm/route.ts  # Grok streaming chat endpoint
    /roadmap/route.ts     # Generates roadmap with Claude
  /generate/page.tsx      # Stage 1: Domain & interest form
  /pick/page.tsx          # Stage 2: Idea selection
  /brainstorm/[id]/page.tsx  # Stage 3: Chat & refine
  /roadmap/[id]/page.tsx     # Stage 5: Final blueprint

/components/generator
  /IdeaPickCard.tsx       # Idea card for selection
  /BrainstormChat.tsx     # Chat interface
  /LiveIdeaPanel.tsx      # Real-time idea preview
  /RoadmapCard.tsx        # Full roadmap display
  /TechBadge.tsx          # Tech stack badges
  /FeatureList.tsx        # Feature toggles
  /WeekTimeline.tsx       # Weekly milestone timeline

/lib
  /ai
    /claude.ts            # Claude API client
    /grok.ts              # Grok streaming client
    /prompts.ts           # AI prompt templates
  /sources
    /hn.ts                # Hacker News fetcher
    /reddit.ts            # Reddit OAuth + fetcher
    /devto.ts             # Dev.to fetcher
    /devpost.ts           # Devpost scraper
    /aggregator.ts        # Combines all sources

/types
  /idea.ts                # TypeScript interfaces
```

## Usage Flow

1. **Generate** (`/generate`): Select a domain and enter an interest keyword
2. **Pick** (`/pick`): Review 3 extracted project ideas and select one
3. **Brainstorm** (`/brainstorm/[id]`): Chat with AI to refine your idea
   - Modify tech stack, features, or scope
   - Ask questions about the project
4. **Roadmap** (`/roadmap/[id]`): Enter your profile and receive a complete project plan

## License

MIT
