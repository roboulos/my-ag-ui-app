# AI Handoff Prompt - AG UI App

## 🚨 CRITICAL UNDERSTANDING REQUIRED

### The Core Problem
**The current implementation fundamentally misunderstands AG UI.** It shows static, pre-made charts and documents instead of generating UI dynamically based on conversation. This MUST be fixed.

### What AG UI Actually Is
AG UI (Agent-User Interaction Protocol) enables **dynamic, real-time UI generation** where components are created on-the-fly as the conversation evolves. It's NOT about switching between pre-made views.

### What Needs to Change
- ❌ **Remove all static mock data** (mockDocuments array)
- ❌ **Remove pre-defined chart components** 
- ✅ **Implement true generative UI** using render methods
- ✅ **Generate components dynamically** based on conversation

## Project Overview
**GitHub Repository**: https://github.com/roboulos/my-ag-ui-app

An AG UI protocol implementation that SHOULD demonstrate dynamic UI generation but currently shows static views with world-class styling.

## Current State (As of Last Session)

### What Works
- ✅ Beautiful dashboard with glassmorphism effects
- ✅ Smooth animations and transitions
- ✅ World-class visual polish
- ✅ CopilotKit integration configured
- ✅ Development server runs on port 3004

### What's Wrong
- ❌ Shows 4 pre-made document types instead of generating dynamically
- ❌ Uses static mockDocuments array
- ❌ Switches between fixed views instead of creating them
- ❌ Doesn't leverage AG UI's streaming capabilities
- ❌ UI doesn't evolve with conversation

## Technical Stack
- Next.js 15.4.5 with App Router and Turbopack
- React 19.1.0 with TypeScript 5.x
- CopilotKit 1.9.3 for agent interactions
- AG UI libraries (@ag-ui/client, core, encoder, proto) v0.0.35
- Tailwind CSS v4 for styling

## Essential Development Workflow

### 1. Always Use Playwright MCP
```bash
# Visual development loop - USE THIS CONSTANTLY
mcp__playwright__browser_navigate        # Go to http://localhost:3004
mcp__playwright__browser_take_screenshot  # Capture current state
mcp__playwright__browser_click           # Test interactions
mcp__playwright__browser_snapshot        # Analyze structure
```

**Every change should be:**
1. Implemented
2. Screenshot with Playwright
3. Visually evaluated
4. Iterated until perfect

### 2. Use Subagents for Complex Tasks
When implementing complex features, use the Task tool with subagents that:
- Use Playwright MCP extensively
- Iterate based on visual feedback
- Achieve world-class polish through iteration

## How to Fix the Core Problem

### Step 1: Remove Static Implementation
```typescript
// DELETE THIS - it's wrong!
const mockDocuments = [...] // Remove entire array
```

### Step 2: Implement Dynamic Generation
```typescript
useCopilotAction({
  name: "generateVisualization",
  description: "Dynamically generate visualizations",
  parameters: [
    { name: "type", type: "string" },
    { name: "data", type: "object" },
  ],
  render: ({ status, args }) => {
    // Generate component based on conversation
    // Create data on-the-fly
    // Build UI dynamically
    return <DynamicComponent {...args} />;
  }
});
```

### Step 3: Test with Real Conversations
- Start with blank screen
- Let UI build as conversation evolves
- Components appear/morph based on discussion
- Infinite possibilities, not 4 fixed options

## Running the App
```bash
# Always use port 3004
PORT=3004 npm run dev

# Environment setup
cp .env.local.example .env.local
# Add OPENAI_API_KEY to .env.local
```

## Key Files to Modify
```
/app/page.tsx         # Remove all mock data, implement dynamic generation
/app/providers.tsx    # Keep as-is
/app/api/copilotkit/route.ts  # Keep as-is
```

## Testing the Correct Implementation

### Wrong Behavior (Current)
1. User: "Show me revenue"
2. App: Switches to pre-made revenue chart
3. Result: Same chart every time

### Correct Behavior (Target)
1. User: "Show me revenue"
2. App: Generates unique chart based on context
3. User: "What if we increased by 20%?"
4. App: Modifies/regenerates chart dynamically
5. Result: Infinite variations based on conversation

## Development Principles

### Visual Excellence
- Use Playwright screenshots constantly
- Iterate until world-class
- Test all animations and transitions
- Verify at multiple viewport sizes

### Dynamic Generation
- No hardcoded data
- No pre-made components
- Everything created in real-time
- UI evolves with conversation

### AG UI Protocol
- Stream UI updates
- Generate components on-demand
- Allow infinite possibilities
- React to conversation context

## Common Mistakes to Avoid

1. **Creating mock data arrays** - Everything should be generated
2. **Building fixed layouts** - Layouts should be dynamic
3. **Switching views** - Should be generating/morphing
4. **Not using Playwright** - Visual verification is crucial
5. **Not using subagents** - Complex tasks need specialized agents

## Success Criteria

You'll know it's working when:
- Starting screen is minimal/blank
- UI builds as you talk to the agent
- Every conversation creates unique visualizations
- Components morph and evolve in real-time
- No two sessions look the same

## Important Resources

- **CLAUDE.md**: Contains critical workflow and implementation details
- **Playwright MCP**: Essential for visual development
- **Task tool**: Use for complex implementations with subagents

## Final Note

The current implementation has world-class styling but completely misses the point of AG UI. The next session should focus entirely on making the UI truly dynamic and generative, not just beautiful. Use Playwright constantly to verify changes and achieve visual excellence while implementing the correct dynamic behavior.