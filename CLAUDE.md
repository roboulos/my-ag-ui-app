# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL UPDATE (2025-08-02): Complete Rewrite Based on AG UI Dojo

### 🔴 BREAKING DISCOVERY: AG UI Does NOT Support Charting Libraries
After extensive investigation and attempting multiple implementations, we discovered that **AG UI fundamentally does not work with charting libraries like Recharts, Chart.js, or any other visualization libraries**. The AG UI dojo example uses **ONLY CSS-based visualizations**.

### ✅ NEW FOUNDATION: Dojo Recipe Example
We've completely rewritten the app using the working recipe example from `ag-ui-protocol/ag-ui` repository. This is now our foundation because:
1. **It actually works** - No hydration errors, no WebSocket issues
2. **Proper CopilotKit integration** - Uses `useCoAgent` for state management
3. **CSS-only visualizations** - All UI is pure CSS/Tailwind
4. **Mobile-responsive** - Pull-up chat for mobile, sidebar for desktop

## 🎓 HARD-WON LEARNINGS FROM AG UI INVESTIGATION

### 1. **Recharts/Charting Libraries DON'T WORK in AG UI**
- Spent hours trying to make Recharts work - it fundamentally doesn't
- AG UI dojo has ZERO charting library dependencies
- All visualizations must be CSS-based (progress bars, cards, etc.)
- This is likely due to SSR/hydration issues with dynamic chart rendering

### 2. **CopilotKit Pattern is Different**
The dojo uses a specific pattern with CopilotKit 1.9.2:
```typescript
// They use useCoAgent for state management
const { state: agentState, setState: setAgentState } = useCoAgent<RecipeAgentState>({
  name: "recipe_agent",
  initialState: INITIAL_STATE,
});

// NOT the useCopilotAction with parameters we were trying
```

### 3. **Mobile Chat Implementation**
The mobile chat is a sophisticated pull-up drawer with:
- Custom drag-to-resize functionality
- Separate mobile detection hook
- Different UI components for mobile vs desktop
- CSS transforms for smooth animations

### 4. **File Structure from Dojo**
```
/app/page.tsx              # Main component with CopilotKit wrapper
/app/recipe.css            # All custom CSS (no Tailwind components)
/utils/use-mobile-view.ts  # Mobile detection
/utils/use-mobile-chat.ts  # Pull-up chat logic
```

### 5. **API Route Pattern**
The CopilotKit API route for direct OpenAI integration:
```typescript
const runtime = new CopilotRuntime();

export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new OpenAIAdapter({ 
      model: "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY!
    }),
    endpoint: "/api/copilotkit"
  });

  return handleRequest(req);
}
```

### 6. **CSS-Only Visualizations Examples**
From the dojo recipe app:
- Progress indicators: CSS circles with connecting lines
- Cards: Box shadows and hover transforms
- Animations: Pure CSS keyframes
- Ping effects: CSS animation for state changes
- No external visualization libraries whatsoever

### What AG UI Actually Is
AG UI (Agent-User Interaction Protocol) is about **dynamic, real-time UI generation** based on conversation context. It is NOT about switching between pre-made views.

## 🚀 CURRENT STATUS: Recipe Foundation Working (2025-08-02)

### What We Have Now
- **Working Recipe App**: Direct copy from AG UI dojo that actually works
- **CopilotKit 1.9.3**: Latest version with proper integration
- **Mobile-Responsive**: Pull-up chat for mobile, sidebar for desktop
- **CSS-Only UI**: No charting libraries, pure CSS visualizations
- **Clean Foundation**: Ready to build upon with AG UI patterns
- **AI Functionality**: "Improve with AI" button works with OpenAI integration

### Next Steps
1. **Understand the Recipe Pattern**: Study how the dojo implements state management
2. **Create CSS Visualizations**: Build charts using CSS/Tailwind instead of libraries
3. **Extend Component Types**: Add more dynamic components beyond recipes
4. **Implement True AG UI**: Dynamic component generation based on conversation

## 🔧 How to Work with This Codebase

### Starting Point
We now have the AG UI dojo recipe example as our foundation. This is a working implementation that you can build upon.

### Key Files to Understand
1. **app/page.tsx** - Main component with CopilotKit wrapper and recipe UI
2. **app/recipe.css** - All the CSS styles (study the CSS-only patterns)
3. **utils/use-mobile-*.ts** - Mobile responsive hooks
4. **app/api/copilotkit/route.ts** - Simple CopilotKit API endpoint

### When Adding New Features
1. **NO CHARTING LIBRARIES** - Use CSS/Tailwind for all visualizations
2. **Follow the Recipe Pattern** - Study how state management works with useCoAgent
3. **Mobile First** - Always test on mobile view
4. **CSS Animations** - Use keyframes and transforms for all animations

## Commands

### 🚀 SERVER MANAGEMENT
```bash
# Check if server is running
lsof -i :3004

# Start server
NEXT_LINT=false PORT=3004 npm run dev &

# Kill server
lsof -ti:3004 | xargs kill -9

# Restart server
lsof -ti:3004 | xargs kill -9 && sleep 2 && NEXT_LINT=false PORT=3004 npm run dev &
```

### 🛠 DEVELOPMENT COMMANDS
```bash
# Install dependencies
npm install

# Type checking
npm run typecheck

# Linting
npm run lint

# Git workflow
git add -A && git status
git commit -m "feat: [description]"
git push origin [branch-name]
```

## 🎨 Visual Development with Playwright MCP

**ALWAYS use Playwright MCP for visual verification:**

1. **Make a change** → Take screenshot
2. **Evaluate visually** → Is it world-class?
3. **Iterate** → Refine until perfect
4. **Test interactions** → Verify animations/hover states
5. **Document** → Screenshot final result

```bash
# Essential Playwright commands
mcp__playwright__browser_navigate       # Navigate to http://localhost:3004
mcp__playwright__browser_take_screenshot # Capture current state
mcp__playwright__browser_click          # Test interactions
mcp__playwright__browser_resize         # Test mobile view (400x800)
```

## Architecture

### Core Stack
- **Next.js 15.4.5** with App Router and Turbopack
- **React 19.1.0** with TypeScript 5.x
- **CopilotKit 1.9.3** for AI integration
- **Tailwind CSS v4** for styling (CSS-only visualizations)
- **NO CHARTING LIBRARIES** - Pure CSS for all visualizations

### Current Structure
```
/app
  /api/copilotkit/route.ts    # CopilotKit API endpoint
  page.tsx                    # Recipe app with mobile/desktop UI
  recipe.css                  # All custom CSS styles
  providers.tsx               # Simple wrapper (no longer complex)
  layout.tsx                  # Root layout
/utils
  use-mobile-view.ts          # Mobile detection hook
  use-mobile-chat.ts          # Pull-up chat functionality
```

## Key Development Principles

### 1. CSS-Only Visualizations
- **Never** use charting libraries (Recharts, Chart.js, etc.)
- **Always** create visualizations with CSS/Tailwind
- Study the recipe app's CSS patterns for examples

### 2. Mobile-First Development
- Test on mobile view (400x800) frequently
- Ensure pull-up chat works smoothly
- Desktop is secondary - mobile must be perfect

### 3. Follow Dojo Patterns
- Use `useCoAgent` for state management
- Keep API routes simple
- CSS animations over JavaScript animations
- Pure components without external dependencies

## 🐛 Common Issues and Solutions

### Issue: "Agent 'recipe_assistant' was not found"
**Solution**: This is a console warning that doesn't affect functionality when using direct OpenAI integration. The AI features work despite this error. The dojo uses external agent services (pydantic-ai, langgraph, etc.) but we've adapted it for direct OpenAI usage.

### Issue: Components not rendering
**Solution**: Make sure you're not using any charting libraries. All visualizations must be CSS-based.

### Issue: Mobile chat not working
**Solution**: Check that both mobile hooks are imported and the viewport is under 768px width.

## 🔄 Key Differences: Dojo vs Our Implementation

### Dojo Architecture
- Uses **external agent services** (pydantic-ai, langgraph, etc.)
- Has **dynamic integration routing** `/api/copilotkit/[integrationId]`
- Requires **agent configuration** for each integration
- Uses **ExperimentalEmptyAdapter** expecting external services

### Our Implementation
- Uses **direct OpenAI integration** via OpenAIAdapter
- Simple **static API route** `/api/copilotkit`
- **No agent configuration needed** (hence the console warning)
- **Works despite the agent warning** - AI functionality is fully operational

### Why This Works
CopilotKit is flexible enough to work with direct OpenAI integration even though the dojo example expects external agent services. The "agent not found" warning is non-critical - the AI features work perfectly.

## Important Context

This project represents a complete pivot from trying to force charting libraries into AG UI (which doesn't work) to embracing the CSS-only approach demonstrated in the official AG UI dojo. The recipe example is our foundation because it's the only working example we found that properly implements AG UI patterns.

The key insight is that AG UI requires a different mindset - instead of reaching for visualization libraries, we must craft everything with CSS. This ensures compatibility with the SSR/hydration requirements of the AG UI protocol.