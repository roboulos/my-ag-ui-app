# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 FINAL IMPLEMENTATION STATUS (2025-08-02)

### ✅ FULLY WORKING: Recipe App with Real-Time AI Updates
We've successfully implemented a working AG UI recipe application that demonstrates the complete CopilotKit pattern. **The AI now updates the UI in real-time** when users interact with it.

### 🔑 THE CRITICAL BREAKTHROUGH: useCopilotAction Hook
The key missing piece was the `useCopilotAction` hook. This is **THE MOST IMPORTANT PATTERN** in CopilotKit:

```typescript
useCopilotAction({
  name: "generate_recipe",
  description: "Generate a recipe based on user input...",
  parameters: [
    {
      name: "recipe",
      type: "object", 
      attributes: [
        // Complete schema for recipe fields
      ]
    }
  ],
  render: ({args}) => {
    useEffect(() => {
      updateRecipe(args?.recipe || {})  // This updates the UI!
    }, [args.recipe])
    return <></>
  }
})
```

**This hook enables AI → UI updates automatically!**

## 🧠 MASTER UNDERSTANDING: How CopilotKit Really Works

### The Complete Flow
1. **User types**: "Add garlic to the ingredients"
2. **CopilotKit AI**: Processes the request and calls the `generate_recipe` action
3. **Action renders**: The `render` function triggers with updated recipe data
4. **UI updates**: `updateRecipe()` is called automatically, form fields change
5. **User sees**: Garlic appears in the ingredients list instantly

### The Three Essential CopilotKit Hooks

#### 1. `useCoAgent` - Shared State Management
```typescript
const { state: agentState, setState: setAgentState } = useCoAgent<RecipeAgentState>({
  name: "recipe_assistant",
  initialState: INITIAL_STATE,
});
```
- **Purpose**: Manages bidirectional state between UI and AI
- **Critical**: The AI can read current state, UI changes update the AI context

#### 2. `useCopilotAction` - AI → UI Updates (THE MAGIC)
```typescript
useCopilotAction({
  name: "generate_recipe",
  // ... parameters schema
  render: ({args}) => {
    useEffect(() => {
      updateRecipe(args?.recipe || {})
    }, [args.recipe])
    return <></>
  }
})
```
- **Purpose**: Enables AI to call functions that update the UI
- **Critical**: The `render` function with `useEffect` automatically applies changes
- **THIS IS WHY THE UI UPDATES IN REAL-TIME**

#### 3. `useCopilotChat` - Chat Interface  
```typescript
const { appendMessage, isLoading } = useCopilotChat();
```
- **Purpose**: Manages chat interaction and loading states
- **Critical**: Provides the conversation interface

### The CopilotKit Magic Formula
```
useCoAgent (state sync) + useCopilotAction (AI updates) + useCopilotChat (interface) = Working AI App
```

## 🚨 CRITICAL LESSONS LEARNED

### 1. CopilotKit vs AG UI Protocol
- **CopilotKit**: High-level framework that makes AI integration easy
- **AG UI Protocol**: Lower-level event-streaming protocol (STATE_DELTA, etc.)
- **Our discovery**: CopilotKit handles AG UI complexity for you
- **Lesson**: Use CopilotKit for easy development, not raw AG UI protocol

### 2. Why Our First Attempts Failed
- **Missing useCopilotAction**: We had state management but no AI → UI updates
- **Wrong mental model**: We thought we needed complex AG UI implementation
- **Field name mismatches**: `special_preferences` vs `dietary_preferences`
- **Missing action definitions**: AI had no way to modify the UI

### 3. The Dojo Pattern Works Because
- **Complete implementation**: Has ALL required hooks (useCoAgent + useCopilotAction)
- **Proper schema**: Parameter definitions match exactly with UI fields
- **Field name consistency**: UI field names match action parameter names
- **Render function**: Actually applies the AI changes to the UI

## 🛠 WORKING IMPLEMENTATION DETAILS

### Required Package.json Dependencies
```json
{
  "dependencies": {
    "@copilotkit/react-core": "^1.9.3",
    "@copilotkit/react-ui": "^1.9.3", 
    "@copilotkit/runtime": "^1.9.3",
    "@copilotkit/runtime-client-gql": "^1.9.3",
    "next": "15.4.5",
    "react": "19.1.0",
    "openai": "^4.104.0"
  }
}
```

### Required API Route (/app/api/copilotkit/route.ts)
```typescript
import { 
  CopilotRuntime, 
  OpenAIAdapter, 
  copilotRuntimeNextJSAppRouterEndpoint 
} from "@copilotkit/runtime";

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

### Required Frontend Pattern (/app/page.tsx)
```typescript
// 1. CopilotKit wrapper
<CopilotKit runtimeUrl="/api/copilotkit">
  <YourApp />
  <CopilotSidebar />
</CopilotKit>

// 2. In your component
function YourApp() {
  // State management
  const { state: agentState, setState: setAgentState } = useCoAgent({
    name: "your_agent",
    initialState: INITIAL_STATE,
  });

  // AI → UI updates (CRITICAL!)
  useCopilotAction({
    name: "update_your_data",
    parameters: [/* your schema */],
    render: ({args}) => {
      useEffect(() => {
        updateYourUI(args?.data || {})
      }, [args.data])
      return <></>
    }
  });

  // Chat interface
  const { appendMessage, isLoading } = useCopilotChat();
}
```

## 🎯 EXACT WORKING RECIPE IMPLEMENTATION

### Interface Definitions (Critical - Names Must Match)
```typescript
interface Recipe {
  title: string;
  skill_level: SkillLevel;
  cooking_time: CookingTime;
  dietary_preferences: string[];  // ← MUST match action parameter
  ingredients: Ingredient[];
  instructions: string[];
}

const dietaryOptions = [
  "Vegetarian", "Nut-free", "Dairy-free", 
  "Gluten-free", "Vegan", "Low-carb"
];
```

### The Working useCopilotAction Hook
```typescript
useCopilotAction({
  name: "generate_recipe",
  description: `Generate a recipe based on the user's input...`,
  parameters: [
    {
      name: "recipe",
      type: "object",
      attributes: [
        {
          name: "title",
          type: "string",
          description: "The title of the recipe"
        },
        {
          name: "dietary_preferences",  // ← Must match interface
          type: "string[]",
          enum: dietaryOptions
        },
        // ... all other fields
      ]
    }
  ],
  render: ({args}) => {
    useEffect(() => {
      console.log(args, "args.recipe")  // Debug log
      updateRecipe(args?.recipe || {})  // Updates the UI
    }, [args.recipe])
    return <></>
  }
})
```

### The State Update Function
```typescript
const updateRecipe = (partialRecipe: Partial<Recipe>) => {
  setAgentState({
    ...agentState,
    recipe: {
      ...recipe,
      ...partialRecipe,
    },
  });
  setRecipe({
    ...recipe,
    ...partialRecipe,
  });
};
```

## 🚀 COMMANDS & DEVELOPMENT

### Server Management
```bash
# Start server (use exactly this)
NEXT_LINT=false PORT=3004 npm run dev &

# Check status
lsof -i :3004

# Kill and restart
lsof -ti:3004 | xargs kill -9 && sleep 2 && NEXT_LINT=false PORT=3004 npm run dev &
```

### Testing AI Updates
1. Navigate to http://localhost:3004
2. Click "Improve with AI" 
3. Type "Add garlic to the ingredients"
4. Watch the ingredients list update automatically
5. Verify console shows `{recipe: Object} args.recipe` logs

### Environment Setup
```bash
# Required in .env.local
OPENAI_API_KEY=your_key_here
```

## 🔧 TROUBLESHOOTING GUIDE

### Issue: AI Responds But UI Doesn't Update
**Root Cause**: Missing or broken `useCopilotAction` hook
**Solution**: Ensure the `render` function calls your update function
```typescript
render: ({args}) => {
  useEffect(() => {
    updateYourData(args?.data || {})  // This line is critical
  }, [args.data])
  return <></>
}
```

### Issue: "Agent not found" Console Warning
**Solution**: Ignore it - this is normal with direct OpenAI integration
- The dojo expects external agent services
- Our direct OpenAI setup works despite this warning
- AI functionality is unaffected

### Issue: Parameter Schema Errors
**Solution**: Ensure action parameters exactly match your TypeScript interfaces
```typescript
// Interface field name
dietary_preferences: string[];

// Must match action parameter name
{
  name: "dietary_preferences",  // ← Same name!
  type: "string[]"
}
```

### Issue: useCoAgent State Not Syncing
**Solution**: Check that both state updates happen:
```typescript
const updateRecipe = (partialRecipe: Partial<Recipe>) => {
  // Update agent state (for AI context)
  setAgentState({
    ...agentState,
    recipe: { ...recipe, ...partialRecipe }
  });
  
  // Update local state (for UI)
  setRecipe({
    ...recipe,
    ...partialRecipe
  });
};
```

## 🎨 VISUAL DEVELOPMENT

### Always Use Playwright for Testing
```bash
# Test AI updates visually
mcp__playwright__browser_navigate --url "http://localhost:3004"
mcp__playwright__browser_take_screenshot --filename "before.png"
mcp__playwright__browser_click --element "Improve with AI button"
# Wait for AI response
mcp__playwright__browser_take_screenshot --filename "after.png"
```

### Key Visual Verification Points
1. **Recipe title changes** when AI modifies it
2. **Ingredients appear/update** automatically 
3. **Instructions change** based on AI suggestions
4. **No page refresh** needed for updates
5. **Ping animations** show when fields change

## 🏗 ARCHITECTURE INSIGHTS

### Why This Stack Works
- **Next.js 15.4.5**: Stable foundation with App Router
- **React 19.1.0**: Latest React with concurrent features
- **CopilotKit 1.9.3**: Mature framework with working patterns
- **OpenAI GPT-4o-mini**: Fast, reliable model for real-time updates
- **TypeScript**: Type safety prevents parameter mismatches

### The Mobile-Responsive Pattern
- **Desktop**: Sidebar chat (CopilotSidebar)
- **Mobile**: Pull-up drawer with drag-to-resize
- **Responsive**: Auto-detects viewport and switches UI

### CSS-Only Visualizations (No Recharts!)
- **Progress bars**: CSS width animations
- **Cards**: Box shadows and transforms
- **Charts**: CSS gradients and positioning
- **Animations**: CSS keyframes and transitions

## 💡 EXTENDING THE PATTERN

### Adding New AI Actions
1. **Define interface** for your data structure
2. **Create useCopilotAction** with matching parameter schema
3. **Implement render function** that calls your update function
4. **Test with specific prompts** to verify updates work

### Example: Adding Calendar Action
```typescript
useCopilotAction({
  name: "update_calendar",
  parameters: [
    {
      name: "calendar_data",
      type: "object",
      attributes: [
        { name: "events", type: "object[]" },
        { name: "selected_date", type: "string" }
      ]
    }
  ],
  render: ({args}) => {
    useEffect(() => {
      updateCalendar(args?.calendar_data || {})
    }, [args.calendar_data])
    return <></>
  }
})
```

## 🎯 SUCCESS CRITERIA

### How to Know It's Working
1. ✅ **Chat responds** to user messages
2. ✅ **UI updates automatically** when AI suggests changes  
3. ✅ **Console shows** `args.recipe` logs during updates
4. ✅ **No manual refresh** needed for changes
5. ✅ **Real-time synchronization** between chat and form

### Performance Indicators
- **Response time**: < 3 seconds for AI updates
- **UI updates**: Immediate after AI response
- **State consistency**: Agent state matches UI state
- **Error handling**: Graceful failures, no crashes

## 🚨 NEVER FORGET THESE LESSONS

1. **useCopilotAction is mandatory** for AI → UI updates
2. **Field names must match exactly** between interface and action parameters  
3. **The render function must call your update function** via useEffect
4. **CopilotKit makes AG UI easy** - don't implement raw AG UI protocol
5. **Test with Playwright** to verify visual changes
6. **Direct OpenAI works** despite "agent not found" warnings
7. **CSS-only visualizations** - no charting libraries in AG UI
8. **Real-time updates are the goal** - everything should be immediate

## 🎉 FINAL VERDICT

**This implementation successfully demonstrates a fully working CopilotKit application** where:
- Users can chat with AI about recipes
- AI responses automatically update the recipe form
- All interactions happen in real-time without page refreshes
- The pattern is extensible to any type of structured data

**The hard-won knowledge in this document represents weeks of trial and error condensed into working patterns. Follow these patterns exactly to avoid the confusion we experienced.**