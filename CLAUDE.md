# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: Understanding AG UI Protocol

### What AG UI Actually Is
AG UI (Agent-User Interaction Protocol) is about **dynamic, real-time UI generation** based on conversation context. It is NOT about switching between pre-made views.

### ✅ Current Implementation Status (WORKING AS OF 2025-08-01)
The app now correctly implements AG UI with:
- **Split-screen layout**: Main content area (left) + Chat sidebar (right) - matching the dojo example
- **Dynamic component generation**: Components created on-the-fly based on conversation
- **Main screen rendering**: UI components appear in the main area, NOT in the chat
- **Server-Sent Events (SSE)**: Real-time streaming using fetch API, not HttpAgent from @ag-ui/client
- **Proper event format**: Uses AG UI event types (RUN_STARTED, STATE_DELTA, etc.)

### 🔑 Key Implementation Details

#### 1. Frontend Architecture (app/page.tsx)
```typescript
// CRITICAL: Direct fetch implementation for SSE - DO NOT use HttpAgent
const response = await fetch("/api/agent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages, threadId, runId })
});

// Parse SSE events manually
const reader = response.body?.getReader();
const decoder = new TextDecoder();
let buffer = "";

// Process events with proper event.type handling
switch (event.type) {
  case "TEXT_MESSAGE_CONTENT":
    // Update assistant message in chat
    break;
  case "STATE_DELTA":
    // Add components to main screen
    break;
}
```

#### 2. Backend Event Streaming (app/api/agent/route.ts)
```typescript
// CRITICAL: STATE_DELTA events update the UI
await writer.write(encoder.encode(formatSSE({
  type: EventType.STATE_DELTA,
  delta: [{
    op: "add",
    path: "/components/-",
    value: {
      component: {
        id: generateId("comp"),
        type: toolCall.name,        // matches function name
        props: parsedArgs,           // from OpenAI function call
        timestamp: new Date().toISOString()
      }
    }
  }]
})));
```

#### 3. Component Rendering Pattern
- Components have a `type` that matches the tool name (e.g., "generateVisualization")
- Components have `props` containing all configuration from the AI
- Components are added to state via STATE_DELTA events
- ComponentRenderer switches on type to render the appropriate component

### 🎯 Critical Learnings from Implementation

1. **DO NOT USE @ag-ui/client HttpAgent** 
   - It doesn't work as expected for this use case
   - Use direct fetch with manual SSE parsing instead
   - The HttpAgent might be for different AG UI patterns

2. **Chat Sidebar Positioning**
   - Chat goes on the RIGHT side (like dojo example)
   - Main content area on the LEFT
   - This is the expected AG UI pattern

3. **Component Rendering Location**
   - Components MUST render on main screen
   - NEVER render components in the chat
   - Chat is purely for conversation

4. **OpenAI Tool Definitions**
   - Must have precise JSON schemas
   - Arrays need item definitions
   - Objects need property definitions
   - Use additionalProperties for flexible objects

5. **SSE Event Format**
   - Convert snake_case to camelCase for JavaScript
   - Handle buffering for incomplete lines
   - Parse "data: " prefix correctly
   - Process multiple events in one chunk

6. **State Management**
   - Keep messages array for chat history
   - Keep components array for rendered UI
   - Track assistant message separately while streaming
   - Update both in real-time

### ❌ What NOT to Do
- **DON'T use CopilotKit** - It renders in chat, not main screen
- **DON'T create static mock data** - Everything should be dynamic
- **DON'T use HttpAgent from @ag-ui/client** - Use fetch
- **DON'T put chat on the left** - It goes on the right
- **DON'T render components in chat** - Main screen only
- **DON'T forget to handle SSE errors** - Connection can drop

### 🚀 How It Works Now
1. User types in chat (right sidebar)
2. Message sent to `/api/agent` endpoint
3. OpenAI processes and calls tools
4. Backend streams SSE events back
5. Frontend parses events:
   - TEXT_MESSAGE_CONTENT → Updates chat
   - STATE_DELTA → Adds components to main screen
6. Components render dynamically on left side
7. Chat shows conversation history on right

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

### 🚀 SERVER MANAGEMENT - 100% EFFICIENT
**Use EXACTLY these commands. No variations. No creativity.**

```bash
# ✅ CHECK STATUS (always run first)
lsof -i :3004

# ✅ START SERVER (only if nothing running on port 3004)
NEXT_LINT=false PORT=3004 npm run dev &

# ✅ KILL SERVER (if needed to restart)
lsof -ti:3004 | xargs kill -9

# ✅ RESTART SERVER (kill then start)
lsof -ti:3004 | xargs kill -9 && sleep 2 && NEXT_LINT=false PORT=3004 npm run dev &

# ✅ VERIFY RUNNING (after start/restart)
curl -I http://localhost:3004 --max-time 5

# ❌ NEVER USE THESE:
# - kill -9 <pid> (manual process hunting)
# - PORT=3004 npm run dev (without NEXT_LINT=false)
# - Background processes without &
# - Multiple server start attempts
# - ps aux | grep commands
```

### 🛠 DEVELOPMENT COMMANDS

```bash
# Build & Validation
npm run build            # Production build (has issues - use dev)
npm run lint             # Run ESLint
npm run typecheck        # Type checking

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
- **OpenAI SDK** for AI tool calling and responses
- **Server-Sent Events (SSE)** for real-time streaming
- **Tailwind CSS v4** for styling
- **Lucide React** for icons

### Current Structure (WORKING)
```
/app
  /api/agent/route.ts         # SSE endpoint for AI agent
  page.tsx                    # Split-screen layout with dynamic components
  providers.tsx               # Simple wrapper (no longer uses CopilotKit)
  layout.tsx                  # Root layout
```

### Key Files Explained

#### `/app/api/agent/route.ts`
- Handles POST requests with message history
- Streams SSE events back to client
- Calls OpenAI with tool definitions
- Emits STATE_DELTA events for UI updates
- Properly formats events with camelCase conversion

#### `/app/page.tsx`
- Split-screen layout (content left, chat right)
- Direct fetch implementation for SSE
- Manual event parsing and buffering
- Component state management
- Dynamic component rendering based on type

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

## 🔧 Troubleshooting Common Issues

### Components Not Appearing
1. Check browser console for SSE parsing errors
2. Verify STATE_DELTA events are being sent
3. Ensure component type matches renderer case
4. Check that props are valid JSON

### Chat Not Working
1. Verify OPENAI_API_KEY is set in .env.local
2. Check network tab for 200 response
3. Look for streaming events in console
4. Ensure messages array includes role/content

### SSE Connection Drops
1. Check for server errors in terminal
2. Verify no timeout on long responses
3. Ensure proper error handling in try/catch
4. Check CORS headers if deployed

### TypeScript Errors
1. Run `npm run typecheck` to see all errors
2. Check tool definition schemas match usage
3. Ensure all component props are typed
4. Verify event types match AG UI protocol

## Potential Enhancements

1. **Add more component types**: Maps, timelines, kanban boards, etc.
2. **Implement component interactions**: Click handlers, data updates
3. **Add component persistence**: Save/load generated UIs
4. **Enhance animations**: More sophisticated transitions
5. **Add component editing**: Allow users to modify generated components
6. **Implement export functionality**: Export components as code/images

## 🎨 Thesys-Inspired Premium Design System

### Theme Configuration
The app uses a comprehensive CSS variable system for consistent theming:

```css
/* Light mode (default) */
:root {
  --background: 255 255 255;
  --foreground: 0 0 0;
  --primary: 147 51 234;      /* Purple accent #9333ea */
  --purple-600: #9333ea;       /* Main purple for accents */
}

/* Dark mode */
.dark {
  --background: 15 15 15;     /* Near black */
  --foreground: 245 245 245;  /* Near white */
  --primary: 147 51 234;      /* Same purple works in both modes */
}
```

### Design Principles
1. **Purple Accent Theme**: All primary actions and highlights use purple (#9333ea)
2. **Card-Based Layout**: All components use rounded-2xl with shadow-xl
3. **Dark Mode First**: Designed primarily for dark mode with elegant light mode
4. **Smooth Transitions**: All interactive elements have duration-150 or duration-300
5. **Hover Effects**: Scale transforms (hover:scale-[1.02]) and shadow increases

### Component Styling Pattern
```typescript
// Standard component wrapper
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 
                border border-gray-200 dark:border-gray-700 
                hover:shadow-2xl dark:hover:shadow-purple-500/10 
                transition-all duration-300">
```

## 📊 Component Implementation Patterns

### KPI Card Component
```typescript
function KPICard({ title, value, change, icon, trend }: {
  title: string;        // e.g., "Total Revenue"
  value: string;        // e.g., "$1,200,000"
  change: string;       // e.g., "+15%"
  icon: "revenue" | "users" | "sales" | "products" | "activity";
  trend: "up" | "down";
}) {
  // Color coding based on trend
  const changeColor = trend === "up" 
    ? "text-green-600 dark:text-green-400" 
    : "text-red-600 dark:text-red-400";
  
  // Icon with purple background
  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl 
                  text-purple-600 dark:text-purple-400">
    {getIcon()}
  </div>
}
```

### Chart Styling Updates
- Replace all blue colors with purple gradients
- Use `from-purple-600 to-purple-400` for gradients
- Apply `toLocaleString()` for number formatting
- Add hover states for interactive elements

### Dashboard Component Fix
```typescript
// CRITICAL: When rendering nested components in a dashboard
<ComponentRenderer component={{ 
  ...comp, 
  id: `${i}`,
  type: comp.type || "generateVisualization",  // Ensure type is set
  props: comp.props || comp,                   // Handle both formats
  timestamp: new Date().toISOString()
}} />
```

## 🎭 Animation Classes

### Custom Animations (in globals.css)
```css
/* Slide up animation for cards */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slide-up 0.6s ease-out forwards; }

/* Count up for numbers */
@keyframes count-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-count-up { animation: countUp 0.8s ease-out forwards; }

/* Expand animation for bars */
@keyframes expand {
  from { width: 0%; opacity: 0; }
  to { width: var(--target-width); opacity: 1; }
}
.animate-expand { animation: expand 1s ease-out forwards; }
```

### Animation Usage Pattern
```typescript
// Stagger animations with delay
{items.map((item, i) => (
  <div 
    key={i} 
    className="animate-fade-in" 
    style={{ animationDelay: `${i * 0.1}s` }}
  >
    {item}
  </div>
))}
```

## 🐛 Known Issues and Solutions

### Issue 1: Dashboard Components Not Rendering
**Problem**: Nested components in dashboards don't appear
**Solution**: Ensure each nested component has proper type and props structure
```typescript
// In DynamicDashboard component
type: comp.type || "generateVisualization",
props: comp.props || comp,
```

### Issue 2: Dark Mode Toggle
**Solution**: Apply dark class to root element
```typescript
<div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
```

### Issue 3: OpenAI Multiple Tool Calls
**Current Limitation**: OpenAI typically only calls one tool at a time
**Workaround**: Request specific components individually or use dashboard for multiple

## 🔧 Backend Tool Definition Pattern

### Adding New Tools (e.g., generateKPI)
1. Add to TypeScript ComponentType union:
```typescript
type ComponentType = "generateVisualization" | "generateDashboard" | 
                    "generateForm" | "generateTable" | "generateKPI";
```

2. Add tool definition in route.ts:
```typescript
{
  type: "function",
  function: {
    name: "generateKPI",
    description: "Generate a KPI (Key Performance Indicator) card",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "KPI title/label" },
        value: { type: "string", description: "Main value" },
        change: { type: "string", description: "Change %" },
        icon: { type: "string", enum: ["revenue", "users", "sales"] },
        trend: { type: "string", enum: ["up", "down"] }
      },
      required: ["title", "value", "change", "trend"]
    }
  }
}
```

3. Add to ComponentRenderer switch:
```typescript
case "generateKPI":
  return <KPICard {...component.props} />;
```

4. Add description helper:
```typescript
case "generateKPI":
  return `I've created a KPI card showing "${props.title}" with a value of ${props.value}.`;
```

## 🎯 Visual Development Best Practices

### Iterative Design Process
1. **Always use Playwright** for visual verification
2. **Take screenshots** after every significant change
3. **Test both light and dark modes** for each component
4. **Verify hover states** with browser_hover
5. **Check responsive behavior** at different viewport sizes

### Testing Workflow
```bash
# 1. Make component changes
# 2. Take screenshot
mcp__playwright__browser_take_screenshot --filename "before-styling.png"

# 3. Apply styling updates
# 4. Take comparison screenshot
mcp__playwright__browser_take_screenshot --filename "after-styling.png"

# 5. Test interactions
mcp__playwright__browser_hover --element "KPI card" --ref "e123"

# 6. Toggle dark mode
mcp__playwright__browser_click --element "Theme toggle" --ref "e13"
```

## 📦 Complete Working Stack

### Core Dependencies (Confirmed Working)
```json
{
  "dependencies": {
    "next": "15.4.5",           // App Router + Turbopack
    "react": "19.1.0",          // Latest React
    "openai": "^4.104.0",       // Tool calling support
    "lucide-react": "^0.536.0", // Icon library
    "tailwindcss": "^4"         // v4 with new features
  }
}
```

### Tailwind Configuration
- Uses Tailwind CSS v4 with `@import "tailwindcss"`
- Custom animations defined in globals.css
- CSS variables for theming with RGB values
- Dark mode with class strategy

## Important Context

This project successfully demonstrates the AG UI protocol's power for dynamic, generative UI with a premium Thesys-inspired design. The implementation features:

1. **Complete theming system** with CSS variables for easy customization
2. **Purple accent theme** throughout all components
3. **Smooth dark mode** transitions with proper contrast
4. **Professional animations** that enhance user experience
5. **Working SSE implementation** without @ag-ui/client dependencies
6. **Visual-first development** using Playwright for quality assurance

The key insight is that visual iteration with Playwright is essential for achieving premium UI quality. Every change should be visually verified, tested in both themes, and refined until it meets professional standards.