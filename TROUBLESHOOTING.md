# Troubleshooting Guide - AG UI Dashboard

This comprehensive troubleshooting guide helps you diagnose and resolve common issues with the AG UI Dashboard, from setup problems to production deployment issues.

## 🆘 Quick Diagnostic Checklist

Before diving into specific issues, run through this quick checklist:

- [ ] Node.js 18+ installed and active
- [ ] All dependencies installed (`npm install` completed successfully)
- [ ] OpenAI API key configured in environment variables
- [ ] Internet connection stable
- [ ] Browser JavaScript enabled
- [ ] Browser console shows no critical errors
- [ ] Development server running on correct port

## 🚀 Installation and Setup Issues

### Issue: `npm install` Fails

**Symptoms:**
- Package installation errors
- Dependency resolution conflicts
- Permission errors during installation

**Solutions:**

1. **Clear npm cache and retry:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Check Node.js version:**
```bash
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

3. **Fix permission issues (macOS/Linux):**
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

4. **Use yarn as alternative:**
```bash
npm install -g yarn
yarn install
```

---

### Issue: TypeScript Errors on Build

**Symptoms:**
- Build fails with TypeScript compilation errors
- Type checking fails in development
- IDE shows type errors

**Solutions:**

1. **Check TypeScript version:**
```bash
npx tsc --version  # Should be 5.x
npm run typecheck  # Run type checking
```

2. **Common type fixes:**
```typescript
// Fix: Property 'X' does not exist on type 'Y'
// Add proper type definitions or use type assertion
const data = apiResponse as ExpectedType;

// Fix: Cannot find module or its type declarations
// Install type definitions
npm install --save-dev @types/module-name
```

3. **Reset TypeScript cache:**
```bash
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

---

### Issue: Environment Variables Not Loading

**Symptoms:**
- OpenAI API key not recognized
- Environment variables undefined
- Features not working in production

**Solutions:**

1. **Check file naming and location:**
```bash
# Development
.env.local          ✅ Correct
.env               ❌ Wrong for Next.js local development

# Production (platform specific)
.env.production    ✅ Correct for manual deployment
```

2. **Verify variable format:**
```bash
# Correct format
OPENAI_API_KEY=sk-your-key-here

# Incorrect formats
OPENAI_API_KEY="sk-your-key-here"    ❌ No quotes needed
OPENAI_API_KEY = sk-your-key-here    ❌ No spaces around =
```

3. **Test environment loading:**
```javascript
// Add to any React component for testing
console.log('API Key loaded:', !!process.env.OPENAI_API_KEY);
```

4. **Platform-specific configuration:**
```bash
# Vercel: Set in dashboard under Environment Variables
# Netlify: Set in Site Settings > Environment Variables
# AWS: Use AWS Secrets Manager or Parameter Store
```

## 🤖 AI and CopilotKit Issues

### Issue: AI Chat Not Responding

**Symptoms:**
- Chat interface shows but no AI responses
- Loading indicators stuck
- API errors in browser console

**Diagnostic Steps:**

1. **Check browser console for errors:**
```javascript
// Look for these error patterns:
"Failed to fetch"           // Network/CORS issue
"401 Unauthorized"          // API key issue
"429 Too Many Requests"     // Rate limiting
"500 Internal Server Error" // Server issue
```

2. **Verify API key validity:**
```bash
# Test API key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

3. **Check network connectivity:**
```javascript
// Test from browser console
fetch('/api/copilotkit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ test: true })
}).then(r => console.log(r.status));
```

**Solutions:**

1. **API key issues:**
```bash
# Regenerate API key at platform.openai.com
# Update environment variable
OPENAI_API_KEY=sk-new-key-here

# Restart development server
npm run dev
```

2. **CORS issues:**
```typescript
// Add to next.config.ts
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
      ],
    },
  ];
}
```

3. **Rate limiting:**
```typescript
// Implement client-side retry logic
const retryWithBackoff = async (fn: Function, retries: number = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
};
```

---

### Issue: CopilotKit Actions Not Working

**Symptoms:**
- AI acknowledges commands but doesn't execute actions
- State changes don't occur
- Actions return errors

**Diagnostic Steps:**

1. **Check action registration:**
```typescript
// Verify actions are properly registered
console.log('Actions registered:', 
  // List all useCopilotAction calls in your components
);
```

2. **Validate action parameters:**
```typescript
// Add logging to action handlers
useCopilotAction({
  name: "testAction",
  handler: (params) => {
    console.log('Action called with:', params);
    return "Action executed successfully";
  }
});
```

**Solutions:**

1. **Fix action parameter types:**
```typescript
// Ensure parameter types match AI expectations
parameters: [
  {
    name: "value",
    type: "number",        // ✅ Correct
    // type: "int",        ❌ Wrong - use "number"
    required: true
  }
]
```

2. **Handle async actions properly:**
```typescript
handler: async ({ params }) => {
  try {
    await updateStateAsync(params);
    return "Success message";
  } catch (error) {
    console.error('Action failed:', error);
    return `Error: ${error.message}`;
  }
}
```

3. **Check context availability:**
```typescript
// Ensure actions are inside CopilotKit provider
<CopilotKit runtimeUrl="/api/copilotkit">
  <ComponentWithActions />  {/* ✅ Actions work here */}
</CopilotKit>
{/* <ComponentWithActions />  ❌ Actions won't work here */}
```

## 🔗 Real-Time Collaboration Issues

### Issue: WebSocket Connection Fails

**Symptoms:**
- Multi-user features not working
- Changes not syncing between users
- Connection errors in console

**Diagnostic Steps:**

1. **Check WebSocket URL:**
```javascript
// Verify WebSocket URL format
console.log('WS URL:', process.env.NEXT_PUBLIC_WS_URL);
// Should be: ws://localhost:3001 (dev) or wss://domain.com (prod)
```

2. **Test WebSocket connection:**
```javascript
// Test from browser console
const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
ws.onopen = () => console.log('WebSocket connected');
ws.onerror = (error) => console.log('WebSocket error:', error);
```

**Solutions:**

1. **Fix WebSocket URL configuration:**
```bash
# Development
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Production (secure WebSocket)
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

2. **Implement connection retry logic:**
```typescript
const connectWebSocket = (retries = 3, delay = 1000) => {
  const connect = (attempt: number) => {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => console.log('Connected');
    
    ws.onerror = () => {
      if (attempt < retries) {
        setTimeout(() => connect(attempt + 1), delay * attempt);
      }
    };
  };
  
  connect(1);
};
```

3. **Handle proxy issues in development:**
```typescript
// Add to next.config.ts for development proxy
async rewrites() {
  return [
    {
      source: '/api/ws/:path*',
      destination: 'http://localhost:3001/api/ws/:path*',
    },
  ];
}
```

---

### Issue: State Sync Conflicts

**Symptoms:**
- Users see different data
- Changes overwrite each other
- Inconsistent dashboard state

**Solutions:**

1. **Implement conflict resolution:**
```typescript
const mergeStates = (localState: any, remoteState: any) => {
  // Last-write-wins strategy
  return {
    ...localState,
    ...remoteState,
    lastUpdated: new Date(),
    conflictResolved: true
  };
};
```

2. **Add state versioning:**
```typescript
interface VersionedState {
  data: DashboardState;
  version: number;
  timestamp: Date;
}

const handleStateUpdate = (newState: VersionedState) => {
  if (newState.version > currentState.version) {
    setCurrentState(newState);
  }
};
```

## 🧩 Component and UI Issues

### Issue: Components Not Rendering

**Symptoms:**
- Blank spaces where components should appear
- Console errors about missing components
- Component generation fails silently

**Diagnostic Steps:**

1. **Check component factory:**
```typescript
// Test component creation
import { componentFactory } from '@/lib/ComponentFactory';
const testComponent = componentFactory.createFromDescription("test gauge");
console.log('Created component:', testComponent);
```

2. **Verify component registration:**
```typescript
// Check available component types
console.log('Available types:', componentFactory.getAvailableTypes());
```

**Solutions:**

1. **Fix component type mapping:**
```typescript
// Ensure component types are properly registered
const COMPONENT_TEMPLATES = {
  gauge: {
    name: "Gauge Chart",
    render: (props) => <GaugeChart {...props} />  // ✅ Valid React component
  }
};
```

2. **Handle component loading errors:**
```typescript
const ComponentRenderer = ({ component }) => {
  try {
    return <DynamicComponent {...component} />;
  } catch (error) {
    console.error('Component render error:', error);
    return (
      <div className="error-fallback">
        Component failed to load: {component.type}
      </div>
    );
  }
};
```

3. **Add error boundaries:**
```typescript
class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with this component.</div>;
    }
    return this.props.children;
  }
}
```

---

### Issue: Layout and Styling Problems

**Symptoms:**
- Components overlapping or misaligned
- Theme not applying correctly
- Responsive design breaking

**Solutions:**

1. **Check CSS variable definitions:**
```css
/* Ensure CSS variables are properly defined */
:root {
  --background: 255 255 255;      /* ✅ RGB values */
  --foreground: 0 0 0;
  --primary: 147 51 234;
}

.dark {
  --background: 15 15 15;         /* ✅ Override for dark mode */
  --foreground: 245 245 245;
}
```

2. **Fix Tailwind CSS configuration:**
```typescript
// Ensure all content paths are included
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',    // ✅ Include lib directory
  ],
  // ...
};
```

3. **Handle responsive breakpoints:**
```typescript
// Use consistent breakpoint classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Components */}
</div>
```

## 🔧 Performance Issues

### Issue: Slow Dashboard Loading

**Symptoms:**
- Long initial load times
- Laggy interactions
- High memory usage

**Diagnostic Steps:**

1. **Check bundle size:**
```bash
npm run build
# Look for large bundle warnings
```

2. **Profile component renders:**
```typescript
// Add to React DevTools Profiler
const ProfiledComponent = React.memo(({ data }) => {
  console.time('Component render');
  const result = <YourComponent data={data} />;
  console.timeEnd('Component render');
  return result;
});
```

**Solutions:**

1. **Implement code splitting:**
```typescript
// Lazy load heavy components
const HeavyChart = React.lazy(() => import('./HeavyChart'));

const Dashboard = () => (
  <Suspense fallback={<div>Loading chart...</div>}>
    <HeavyChart />
  </Suspense>
);
```

2. **Optimize re-renders:**
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
}, (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.data.length === nextProps.data.length;
});
```

3. **Debounce frequent updates:**
```typescript
import { useMemo, useState, useEffect } from 'react';
import { debounce } from 'lodash';

const useDebouncedValue = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = debounce(() => setDebouncedValue(value), delay);
    handler();
    return () => handler.cancel();
  }, [value, delay]);
  
  return debouncedValue;
};
```

---

### Issue: Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Browser becomes sluggish
- Application crashes after extended use

**Solutions:**

1. **Clean up WebSocket connections:**
```typescript
useEffect(() => {
  const ws = new WebSocket(wsUrl);
  
  return () => {
    ws.close();  // ✅ Cleanup on unmount
  };
}, []);
```

2. **Clear intervals and timeouts:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Update logic
  }, 1000);
  
  return () => clearInterval(interval);  // ✅ Cleanup
}, []);
```

3. **Remove event listeners:**
```typescript
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);  // ✅ Cleanup
  };
}, []);
```

## 🚀 Production Deployment Issues

### Issue: Build Fails in Production

**Symptoms:**
- Build succeeds locally but fails in CI/CD
- Missing environment variables in production
- Import path errors

**Solutions:**

1. **Check for case-sensitive imports:**
```typescript
// Fix case sensitivity issues
import { Component } from './Component';     // ✅ Correct case
// import { Component } from './component';  ❌ May fail in production
```

2. **Verify all environment variables:**
```bash
# Check all required variables are set in production
echo "API Key set: $([[ -n "$OPENAI_API_KEY" ]] && echo "Yes" || echo "No")"
```

3. **Fix absolute import paths:**
```typescript
// Use relative imports for local files
import { utils } from '../../lib/utils';     // ✅ Relative
// import { utils } from '@/lib/utils';      ❌ May fail if tsconfig not properly configured
```

---

### Issue: API Routes Not Working in Production

**Symptoms:**
- 404 errors on API endpoints
- API routes work locally but not in production
- CORS errors in production

**Solutions:**

1. **Check API route structure:**
```
app/
├── api/
│   ├── copilotkit/
│   │   └── route.ts      ✅ Correct Next.js 13+ structure
│   └── health/
│       └── route.ts
```

2. **Verify export format:**
```typescript
// Correct API route exports
export async function GET(request: Request) {
  return Response.json({ status: 'ok' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ received: body });
}
```

3. **Handle CORS in production:**
```typescript
// Add CORS headers to API routes
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

## 🔍 Advanced Debugging Techniques

### Enable Debug Logging

1. **Next.js debug mode:**
```bash
DEBUG=* npm run dev
```

2. **Custom debug logging:**
```typescript
const debug = process.env.NODE_ENV === 'development';

const log = (...args: any[]) => {
  if (debug) {
    console.log('[DEBUG]', ...args);
  }
};
```

3. **Component debugging:**
```typescript
const DebugComponent = ({ children, name }) => {
  useEffect(() => {
    console.log(`${name} mounted`);
    return () => console.log(`${name} unmounted`);
  }, [name]);
  
  return children;
};
```

### Browser Developer Tools

1. **Network tab analysis:**
   - Check failed requests
   - Analyze response times
   - Monitor WebSocket connections

2. **Console debugging:**
```javascript
// Filter console messages
console.log('%c[AI]', 'color: blue', 'AI action triggered');
console.error('%c[ERROR]', 'color: red', 'Something went wrong');
```

3. **React DevTools:**
   - Profile component performance
   - Inspect component state
   - Track re-renders

### Production Monitoring

1. **Health check endpoint:**
```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };
  
  return Response.json(health);
}
```

2. **Error boundaries with logging:**
```typescript
const GlobalErrorBoundary = ({ children }) => {
  const logError = (error: Error, errorInfo: any) => {
    // Send to monitoring service
    fetch('/api/log-error', {
      method: 'POST',
      body: JSON.stringify({ error: error.message, stack: error.stack, errorInfo })
    });
  };

  return (
    <ErrorBoundary onError={logError}>
      {children}
    </ErrorBoundary>
  );
};
```

## 📞 Getting Additional Help

### Self-Service Resources
1. Check browser console for error messages
2. Review the [API Reference](./API_REFERENCE.md) for correct usage
3. Consult the [Architecture Guide](./ARCHITECTURE.md) for system understanding
4. Test with minimal examples to isolate issues

### Community Support
1. Search existing issues in the project repository
2. Create detailed bug reports with reproduction steps
3. Include environment information and error logs
4. Provide minimal reproducible examples

### Professional Support
For enterprise deployments:
1. Include deployment architecture diagrams
2. Provide performance metrics and logs
3. Detail scaling requirements and constraints
4. Include security and compliance requirements

---

**💡 Pro Tip:** When reporting issues, always include:
- Node.js and npm versions
- Browser and version
- Operating system
- Exact error messages
- Steps to reproduce
- Expected vs actual behavior

This troubleshooting guide covers the most common issues you might encounter. For specific problems not covered here, use the debugging techniques to gather more information and create detailed issue reports.