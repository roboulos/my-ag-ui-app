# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack on http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint with Next.js config

# Environment Setup
cp .env.local.example .env.local    # Copy environment variables template
# Set OPENAI_API_KEY in .env.local for CopilotKit backend

# Custom Port Deployment (Working Method)
PORT=3004 npm run dev    # Start dev server on custom port
# Note: Production build had issues with dataRoutes manifest
# Use development server for stable deployment
```

## Architecture

### Core Stack
- **Next.js 15.4.5** with App Router and Turbopack
- **React 19.1.0** with TypeScript 5.x
- **CopilotKit 1.9.3** for agent-UI interactions
- **AG UI libraries** (@ag-ui/client, core, encoder, proto) v0.0.35
- **Tailwind CSS v4** for styling

### Application Structure

The app demonstrates AG UI protocol implementation through CopilotKit integration:

1. **API Endpoint** (`app/api/copilotkit/route.ts`)
   - CopilotRuntime with OpenAIAdapter (GPT-4)
   - Handles agent communication via POST requests

2. **Providers** (`app/providers.tsx`)
   - CopilotKit wrapper with runtime URL configuration
   - CopilotSidebar with custom labels and instructions
   - Client-side component wrapping entire app

3. **Main Page** (`app/page.tsx`)
   - Two-way state binding with `useCopilotReadable` hooks
   - Agent actions via `useCopilotAction`:
     - `updateMessage`: Modify displayed message
     - `incrementCounter`: Adjust counter by specified amount
   - Interactive UI with manual controls alongside agent capabilities

### Key Patterns

**State Management**
- React useState for local state (message, counter)
- State exposed to agent via `useCopilotReadable`
- Actions return success status and results

**Agent Integration**
- All agent interactions go through `/api/copilotkit`
- Actions defined with typed parameters and handlers
- Sidebar provides persistent agent interface

**TypeScript Configuration**
- Strict mode enabled
- Path alias: `@/*` maps to project root
- Module resolution: bundler mode for Next.js compatibility

## Troubleshooting

### OpenAI API Key Required
The app requires a valid OpenAI API key in `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-xxxxx...
```
Without this, the CopilotKit integration will fail.

### ESLint Fixes
Production builds require proper quote escaping in JSX:
- Use `&quot;` for double quotes
- Use `&apos;` for apostrophes

### Port Configuration
To run on a custom port:
```bash
PORT=3004 npm run dev
```
Note: The production server (`npm run start`) may have issues with the routes manifest. Use the development server for stable deployment.