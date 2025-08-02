import { NextRequest } from "next/server";
import { WebSocketServer } from 'ws';

// Global WebSocket server instance
let wss: WebSocketServer | null = null;

// Store active users and their sessions
const activeSessions = new Map<string, {
  userId: string;
  userName: string;
  userColor: string;
  sessionId: string;
  joinedAt: Date;
  lastActivity: Date;
  ws?: any;
}>();

// Store current dashboard state for sync
let currentDashboardState: any = null;

// Initialize WebSocket server
function initWebSocketServer() {
  if (wss) return wss;
  
  wss = new WebSocketServer({ 
    port: 3005,
    perMessageDeflate: false 
  });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');
    
    // Generate a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(ws, sessionId, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket connection closed: ${sessionId}`);
      handleUserDisconnect(sessionId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    }));
  });

  console.log('WebSocket server initialized on port 3005');
  return wss;
}

// Handle incoming WebSocket messages
function handleWebSocketMessage(ws: any, sessionId: string, message: any) {
  const { type, data } = message;

  switch (type) {
    case 'user_join':
      handleUserJoin(ws, sessionId, data);
      break;
    case 'dashboard_state_update':
      handleDashboardStateUpdate(sessionId, data);
      break;
    case 'user_activity':
      handleUserActivity(sessionId, data);
      break;
    case 'ai_interaction':
      handleAIInteraction(sessionId, data);
      break;
    case 'cursor_movement':
      handleCursorMovement(sessionId, data);
      break;
    case 'request_current_state':
      handleStateRequest(ws, sessionId);
      break;
    default:
      console.log(`Unknown message type: ${type}`);
  }
}

// Handle user joining the collaboration session
function handleUserJoin(ws: any, sessionId: string, userData: any) {
  const { userId, userName } = userData;
  
  // Generate a unique color for the user
  const colors = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
  const userColor = colors[Math.floor(Math.random() * colors.length)];
  
  // Store user session
  activeSessions.set(sessionId, {
    userId: userId || `user_${Date.now()}`,
    userName: userName || `User ${activeSessions.size + 1}`,
    userColor,
    sessionId,
    joinedAt: new Date(),
    lastActivity: new Date(),
    ws
  });

  // Broadcast user joined to all other users
  broadcastToOthers(sessionId, {
    type: 'user_joined',
    data: {
      userId: activeSessions.get(sessionId)?.userId,
      userName: activeSessions.get(sessionId)?.userName,
      userColor,
      sessionId,
      joinedAt: new Date().toISOString()
    }
  });

  // Send current active users to the new user
  const activeUsers = Array.from(activeSessions.values()).map(session => ({
    userId: session.userId,
    userName: session.userName,
    userColor: session.userColor,
    sessionId: session.sessionId,
    joinedAt: session.joinedAt.toISOString(),
    lastActivity: session.lastActivity.toISOString()
  }));

  ws.send(JSON.stringify({
    type: 'active_users_update',
    data: {
      users: activeUsers,
      yourSessionId: sessionId
    }
  }));

  // Send current dashboard state if available
  if (currentDashboardState) {
    ws.send(JSON.stringify({
      type: 'dashboard_state_sync',
      data: currentDashboardState
    }));
  }

  console.log(`User joined: ${activeSessions.get(sessionId)?.userName} (${sessionId})`);
}

// Handle dashboard state updates
function handleDashboardStateUpdate(sessionId: string, stateUpdate: any) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  // Update current state
  currentDashboardState = {
    ...currentDashboardState,
    ...stateUpdate,
    lastUpdatedBy: session.userId,
    lastUpdatedAt: new Date().toISOString()
  };

  // Broadcast to all other users
  broadcastToOthers(sessionId, {
    type: 'dashboard_state_update',
    data: {
      update: stateUpdate,
      updatedBy: session.userId,
      updatedByName: session.userName,
      timestamp: new Date().toISOString()
    }
  });

  // Update user's last activity
  session.lastActivity = new Date();
}

// Handle user activity updates (like cursor position, interactions)
function handleUserActivity(sessionId: string, activityData: any) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  session.lastActivity = new Date();

  // Broadcast activity to other users
  broadcastToOthers(sessionId, {
    type: 'user_activity',
    data: {
      userId: session.userId,
      userName: session.userName,
      userColor: session.userColor,
      activity: activityData,
      timestamp: new Date().toISOString()
    }
  });
}

// Handle AI interactions in collaborative context
function handleAIInteraction(sessionId: string, interactionData: any) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  // Broadcast AI interaction to all users
  broadcastToAll({
    type: 'ai_interaction',
    data: {
      userId: session.userId,
      userName: session.userName,
      userColor: session.userColor,
      interaction: interactionData,
      timestamp: new Date().toISOString()
    }
  });
}

// Handle cursor movement for collaborative indicators
function handleCursorMovement(sessionId: string, cursorData: any) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  session.lastActivity = new Date();

  // Broadcast cursor position to other users
  broadcastToOthers(sessionId, {
    type: 'cursor_update',
    data: {
      userId: session.userId,
      userName: session.userName,
      userColor: session.userColor,
      position: cursorData,
      timestamp: new Date().toISOString()
    }
  });
}

// Handle request for current state
function handleStateRequest(ws: any, sessionId: string) {
  if (currentDashboardState) {
    ws.send(JSON.stringify({
      type: 'dashboard_state_sync',
      data: currentDashboardState
    }));
  }
}

// Handle user disconnect
function handleUserDisconnect(sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (session) {
    // Broadcast user left to all other users
    broadcastToOthers(sessionId, {
      type: 'user_left',
      data: {
        userId: session.userId,
        userName: session.userName,
        sessionId,
        leftAt: new Date().toISOString()
      }
    });

    activeSessions.delete(sessionId);
    console.log(`User left: ${session.userName} (${sessionId})`);
  }
}

// Broadcast message to all users except the sender
function broadcastToOthers(excludeSessionId: string, message: any) {
  activeSessions.forEach((session, sessionId) => {
    if (sessionId !== excludeSessionId && session.ws && session.ws.readyState === 1) {
      try {
        session.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to ${sessionId}:`, error);
      }
    }
  });
}

// Broadcast message to all users
function broadcastToAll(message: any) {
  activeSessions.forEach((session, sessionId) => {
    if (session.ws && session.ws.readyState === 1) {
      try {
        session.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to ${sessionId}:`, error);
      }
    }
  });
}

// HTTP endpoint for collaboration status and management
export async function GET(req: NextRequest) {
  // Initialize WebSocket server if not already done
  initWebSocketServer();

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'status':
      return Response.json({
        websocketPort: 3005,
        activeUsers: activeSessions.size,
        users: Array.from(activeSessions.values()).map(session => ({
          userId: session.userId,
          userName: session.userName,
          userColor: session.userColor,
          joinedAt: session.joinedAt.toISOString(),
          lastActivity: session.lastActivity.toISOString()
        })),
        hasCurrentState: !!currentDashboardState
      });

    case 'init':
      return Response.json({
        websocketUrl: `ws://localhost:3005`,
        message: 'WebSocket server ready for connections'
      });

    default:
      return Response.json({
        error: 'Invalid action. Use ?action=status or ?action=init'
      }, { status: 400 });
  }
}

// POST endpoint for server-side collaboration operations
export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    // Initialize WebSocket server if not already done
    initWebSocketServer();

    switch (action) {
      case 'broadcast_state':
        currentDashboardState = data;
        broadcastToAll({
          type: 'dashboard_state_sync',
          data: currentDashboardState
        });
        return Response.json({ success: true, message: 'State broadcasted to all users' });

      case 'force_sync':
        broadcastToAll({
          type: 'force_refresh',
          data: { timestamp: new Date().toISOString() }
        });
        return Response.json({ success: true, message: 'Force refresh sent to all users' });

      case 'kick_user':
        const sessionToKick = data.sessionId;
        const session = activeSessions.get(sessionToKick);
        if (session && session.ws) {
          session.ws.send(JSON.stringify({
            type: 'kicked',
            data: { reason: data.reason || 'Removed by administrator' }
          }));
          session.ws.close();
        }
        return Response.json({ success: true, message: 'User kicked successfully' });

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST collaboration error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}