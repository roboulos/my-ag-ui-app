# AI Handoff Prompt - AG UI App

## Project Overview
You are working on an AG UI (Agent-User Interaction) protocol implementation using Next.js 15.4.5 and CopilotKit 1.9.3. The app demonstrates bi-directional communication between an AI agent and users through a sidebar interface.

**GitHub Repository**: https://github.com/roboulos/my-ag-ui-app

## Current State
- ✅ Basic AG UI implementation working
- ✅ CopilotKit integration complete
- ✅ Development server runs successfully on port 3004
- ✅ OpenAI API key configured in .env.local
- ✅ Two demo features: message updater and counter
- ⚠️ Production build has issues with routes manifest (use dev server)

## Technical Stack
- Next.js 15.4.5 with App Router and Turbopack
- React 19.1.0 with TypeScript 5.x
- CopilotKit 1.9.3 for agent interactions
- AG UI libraries (@ag-ui/client, core, encoder, proto) v0.0.35
- Tailwind CSS v4 for styling

## Key Files Structure
```
/app
  /api/copilotkit/route.ts    # API endpoint for agent communication
  page.tsx                    # Main demo with useCopilotReadable/Action hooks
  providers.tsx               # CopilotKit wrapper with sidebar
  layout.tsx                  # Root layout with providers
```

## Current Features
1. **Message Display**: Agent can update displayed message via `updateMessage` action
2. **Counter**: Agent can increment counter by specified amount via `incrementCounter` action
3. **State Sync**: Two-way binding using `useCopilotReadable` hooks
4. **Sidebar**: Persistent agent interface with custom instructions

## Running the App
```bash
# Install dependencies
npm install

# Set up environment (requires OpenAI API key)
cp .env.local.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

# Run on default port 3000
npm run dev

# Run on custom port 3004 (recommended)
PORT=3004 npm run dev
```

## Known Issues & Solutions
1. **Production build fails**: Use development server instead
2. **ESLint quote escaping**: Fixed in page.tsx using `&quot;` and `&apos;`
3. **Connection refused**: Ensure OpenAI API key is set in .env.local

## Next Steps Suggestions
1. **Add more agent actions**: 
   - Color theme switcher
   - Data persistence
   - Complex UI generation
   
2. **Enhance AG UI features**:
   - Implement tool-based generative UI
   - Add predictive state updates
   - Create more complex state management examples

3. **Production deployment**:
   - Fix routes manifest issue for production build
   - Deploy to Vercel or similar platform
   - Add proper error handling for API failures

4. **Testing & Documentation**:
   - Add unit tests for agent actions
   - Create user documentation
   - Add more inline code comments

## Important Context
- The app demonstrates the AG UI protocol, which standardizes agent-human interactions
- CopilotKit provides the infrastructure for real-time streaming and state management
- The sidebar is always open by default to showcase the agent interface
- All agent interactions go through `/api/copilotkit` endpoint

## Development Tips
- Use the CLAUDE.md file in the project root for detailed architecture info
- The dev server hot-reloads changes automatically
- Check browser console for CopilotKit debugging information
- Agent actions must return success status and can include additional data

To continue development, focus on extending the agent capabilities while maintaining the clean separation between UI state and agent actions. The current implementation provides a solid foundation for building more complex AG UI features.