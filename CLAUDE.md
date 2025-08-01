# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: Understanding AG UI Protocol

### What AG UI Actually Is
AG UI (Agent-User Interaction Protocol) is about **dynamic, real-time UI generation** based on conversation context. It is NOT about switching between pre-made views.

### Current Implementation Issue
⚠️ **The current implementation is INCORRECT** - it shows static, pre-made charts and documents instead of generating them dynamically. This needs to be fixed.

### What Should Happen
- **UI components generated on-the-fly** as conversation evolves
- **No pre-defined charts or layouts** - everything created dynamically
- **Real-time streaming** of UI updates based on discussion
- **Infinite possibilities** not limited to 4 pre-made documents

### Correct Implementation Pattern
```typescript
// Use render method in useCopilotAction for dynamic generation
useCopilotAction({
  name: "generateVisualization",
  render: ({ status, args }) => {
    // Dynamically generate ANY component based on conversation
    // Not switching to pre-made views!
    return <DynamicallyGeneratedComponent data={args.data} />;
  }
});
```

## 🎨 Development Workflow

### Visual Development with Playwright MCP
**ALWAYS use Playwright MCP for visual verification:**

1. **Make a change** → Take screenshot
2. **Evaluate visually** → Is it world-class?
3. **Iterate** → Refine until perfect
4. **Test interactions** → Verify animations/hover states
5. **Document** → Screenshot final result

```bash
# Essential Playwright commands to use frequently
mcp__playwright__browser_navigate       # Navigate to http://localhost:3004
mcp__playwright__browser_take_screenshot # Capture current state
mcp__playwright__browser_click          # Test interactions
mcp__playwright__browser_snapshot       # Get page structure
```

### Using Subagents for Complex Tasks
For complex implementations, use the Task tool with subagents:
- Subagents should use Playwright MCP extensively
- They should iterate based on visual feedback
- Goal: Achieve world-class polish through iteration

## Commands

```bash
# Development
PORT=3004 npm run dev    # Always use port 3004 for consistency
npm run build            # Production build (has issues - use dev)
npm run lint             # Run ESLint

# Git Workflow
git add -A && git status
git commit -m "feat: [description]"
git push origin main

# Environment Setup
cp .env.local.example .env.local
# Add OPENAI_API_KEY to .env.local
```

## Architecture

### Core Stack
- **Next.js 15.4.5** with App Router and Turbopack
- **React 19.1.0** with TypeScript 5.x
- **CopilotKit 1.9.3** for agent-UI interactions
- **AG UI libraries** (@ag-ui/client, core, encoder, proto) v0.0.35
- **Tailwind CSS v4** for styling

### Current Structure (Needs Refactoring)
```
/app
  /api/copilotkit/route.ts    # API endpoint for agent
  page.tsx                    # Main page (currently has static mock data - WRONG!)
  providers.tsx               # CopilotKit wrapper
  layout.tsx                  # Root layout
```

## Key Development Principles

### 1. Dynamic Over Static
- **Never** create mock data arrays
- **Never** build pre-defined chart components
- **Always** generate UI based on conversation context

### 2. Visual Excellence Through Iteration
- Use Playwright to see every change
- Take before/after screenshots
- Iterate until the UI looks premium
- Test all hover states and animations

### 3. Proper AG UI Implementation
- Components should stream in as conversation evolves
- UI morphs and changes based on discussion
- Infinite possibilities, not limited options
- Real-time generation, not view switching

## Common Pitfalls to Avoid

❌ **DON'T:**
- Create static mockDocuments arrays
- Build pre-made chart components
- Switch between fixed views
- Hardcode data structures

✅ **DO:**
- Generate components dynamically
- Create data based on conversation
- Stream UI updates in real-time
- Allow infinite UI possibilities

## Testing Strategy

1. **Start dev server:** `PORT=3004 npm run dev`
2. **Open Playwright:** Navigate to http://localhost:3004
3. **Screenshot baseline:** Capture initial state
4. **Make changes:** Implement features
5. **Visual verification:** Screenshot and compare
6. **Test interactions:** Click, hover, type
7. **Iterate:** Refine until world-class

## Next Steps for This Project

1. **Remove all static mock data** from page.tsx
2. **Implement true generative UI** with render methods
3. **Create dynamic component generator** system
4. **Add real-time streaming** of UI updates
5. **Test with Playwright** to ensure quality

## Important Context

This project is meant to demonstrate the AG UI protocol's power for dynamic, generative UI. The current implementation shows beautiful styling but misses the core concept. Future work should focus on making the UI truly dynamic and conversation-driven, not just switching between pre-made views.