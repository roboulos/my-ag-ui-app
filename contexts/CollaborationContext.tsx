"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useDashboard } from "./DashboardContext";

// Types for collaboration
export interface CollaborativeUser {
  userId: string;
  userName: string;
  userColor: string;
  sessionId: string;
  joinedAt: string;
  lastActivity: string;
  cursor?: {
    x: number;
    y: number;
    element?: string;
  };
  currentActivity?: {
    type: 'editing' | 'viewing' | 'ai_chat' | 'idle';
    description?: string;
  };
}

export interface AIInteraction {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  message: string;
  response?: string;
  timestamp: string;
  type: 'question' | 'command' | 'response';
}

export interface CollaborationContextType {
  // Connection state
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  currentUser: CollaborativeUser | null;
  
  // Users and presence
  activeUsers: CollaborativeUser[];
  userCount: number;
  
  // AI collaboration
  sharedAIHistory: AIInteraction[];
  
  // Connection methods
  connectToCollaboration: (userName?: string) => void;
  disconnectFromCollaboration: () => void;
  
  // User activity methods
  updateUserActivity: (activity: CollaborativeUser['currentActivity']) => void;
  updateCursorPosition: (x: number, y: number, element?: string) => void;
  
  // AI collaboration methods
  shareAIInteraction: (message: string, type: AIInteraction['type']) => void;
  
  // State sync methods
  syncDashboardState: (state: any) => void;
  requestCurrentState: () => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export function useCollaboration(): CollaborationContextType {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error("useCollaboration must be used within a CollaborationProvider");
  }
  return context;
}

interface CollaborationProviderProps {
  children: ReactNode;
}

export function CollaborationProvider({ children }: CollaborationProviderProps) {
  // States
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [currentUser, setCurrentUser] = useState<CollaborativeUser | null>(null);
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [sharedAIHistory, setSharedAIHistory] = useState<AIInteraction[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  
  // Dashboard context for state synchronization
  const dashboard = useDashboard();

  // Generate user ID that persists during session
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('ag-ui-user-id');
      if (!id) {
        id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem('ag-ui-user-id', id);
      }
      return id;
    }
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  });

  // Connect to collaboration WebSocket
  const connectToCollaboration = useCallback((userName?: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('Already connected to collaboration');
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      const websocket = new WebSocket('ws://localhost:3005');
      
      websocket.onopen = () => {
        console.log('Connected to collaboration WebSocket');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Send user join message
        websocket.send(JSON.stringify({
          type: 'user_join',
          data: {
            userId,
            userName: userName || `User ${Math.floor(Math.random() * 1000)}`
          }
        }));
      };
      
      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      websocket.onclose = () => {
        console.log('Disconnected from collaboration WebSocket');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setCurrentUser(null);
        setActiveUsers([]);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (connectionStatus !== 'disconnected') {
            connectToCollaboration(userName);
          }
        }, 3000);
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };
      
      setWs(websocket);
    } catch (error) {
      console.error('Failed to connect to collaboration:', error);
      setConnectionStatus('error');
    }
  }, [ws, userId, connectionStatus]);

  // Disconnect from collaboration
  const disconnectFromCollaboration = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setCurrentUser(null);
    setActiveUsers([]);
    setSharedAIHistory([]);
  }, [ws]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    const { type, data } = message;
    
    switch (type) {
      case 'connection_established':
        console.log('Connection established with session:', data.sessionId);
        break;
        
      case 'active_users_update':
        setActiveUsers(data.users || []);
        // Find current user in the list
        const user = data.users?.find((u: any) => u.sessionId === data.yourSessionId);
        if (user) {
          setCurrentUser(user);
        }
        break;
        
      case 'user_joined':
        setActiveUsers(prev => {
          const exists = prev.find(u => u.sessionId === data.sessionId);
          if (exists) return prev;
          return [...prev, data];
        });
        console.log(`${data.userName} joined the collaboration`);
        break;
        
      case 'user_left':
        setActiveUsers(prev => prev.filter(u => u.sessionId !== data.sessionId));
        console.log(`${data.userName} left the collaboration`);
        break;
        
      case 'dashboard_state_update':
        // Apply remote dashboard state changes
        console.log(`Dashboard updated by ${data.updatedByName}:`, data.update);
        // Note: In a real implementation, you'd carefully merge state to avoid conflicts
        break;
        
      case 'dashboard_state_sync':
        console.log('Received full dashboard state sync:', data);
        // Apply complete state sync
        break;
        
      case 'user_activity':
        // Update user activity in the active users list
        setActiveUsers(prev => prev.map(user => 
          user.userId === data.userId 
            ? { ...user, currentActivity: data.activity, lastActivity: data.timestamp }
            : user
        ));
        break;
        
      case 'cursor_update':
        // Update user cursor position
        setActiveUsers(prev => prev.map(user => 
          user.userId === data.userId 
            ? { ...user, cursor: data.position, lastActivity: data.timestamp }
            : user
        ));
        break;
        
      case 'ai_interaction':
        // Add AI interaction to shared history
        const interaction: AIInteraction = {
          id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          userId: data.userId,
          userName: data.userName,
          userColor: data.userColor,
          message: data.interaction.message,
          response: data.interaction.response,
          timestamp: data.timestamp,
          type: data.interaction.type
        };
        setSharedAIHistory(prev => [...prev, interaction]);
        break;
        
      case 'force_refresh':
        // Force refresh the dashboard
        window.location.reload();
        break;
        
      case 'kicked':
        alert(`You have been removed from the collaboration: ${data.reason}`);
        disconnectFromCollaboration();
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
  }, [disconnectFromCollaboration]);

  // Update user activity
  const updateUserActivity = useCallback((activity: CollaborativeUser['currentActivity']) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'user_activity',
        data: activity
      }));
    }
  }, [ws]);

  // Update cursor position
  const updateCursorPosition = useCallback((x: number, y: number, element?: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'cursor_movement',
        data: { x, y, element }
      }));
    }
  }, [ws]);

  // Share AI interaction
  const shareAIInteraction = useCallback((message: string, type: AIInteraction['type']) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'ai_interaction',
        data: {
          message,
          type,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }, [ws]);

  // Sync dashboard state
  const syncDashboardState = useCallback((state: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'dashboard_state_update',
        data: state
      }));
    }
  }, [ws]);

  // Request current state
  const requestCurrentState = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'request_current_state',
        data: {}
      }));
    }
  }, [ws]);

  // Auto-connect on component mount
  useEffect(() => {
    // Auto-connect when the component mounts
    const autoConnect = () => {
      connectToCollaboration();
    };

    // Add a small delay to ensure the server is ready
    const timer = setTimeout(autoConnect, 1000);
    return () => clearTimeout(timer);
  }, [connectToCollaboration]);

  // Track mouse movement for collaborative cursors
  useEffect(() => {
    if (!isConnected) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Throttle cursor updates to avoid spam
      if (Math.random() < 0.1) { // Only send 10% of mouse movements
        updateCursorPosition(e.clientX, e.clientY, (e.target as Element)?.tagName);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isConnected, updateCursorPosition]);

  // Sync dashboard state changes
  useEffect(() => {
    if (isConnected && dashboard) {
      // Listen for dashboard state changes and sync them
      syncDashboardState({
        layout: dashboard.layout,
        theme: dashboard.theme,
        title: dashboard.title,
        description: dashboard.description,
        metrics: dashboard.metrics,
        charts: dashboard.charts,
        sidebarOpen: dashboard.sidebarOpen,
        gridColumns: dashboard.gridColumns
      });
    }
  }, [
    isConnected,
    dashboard?.layout,
    dashboard?.theme,
    dashboard?.title,
    dashboard?.description,
    dashboard?.metrics,
    dashboard?.charts,
    dashboard?.sidebarOpen,
    dashboard?.gridColumns,
    syncDashboardState
  ]);

  const contextValue: CollaborationContextType = {
    // Connection state
    isConnected,
    connectionStatus,
    currentUser,
    
    // Users and presence
    activeUsers,
    userCount: activeUsers.length,
    
    // AI collaboration
    sharedAIHistory,
    
    // Connection methods
    connectToCollaboration,
    disconnectFromCollaboration,
    
    // User activity methods
    updateUserActivity,
    updateCursorPosition,
    
    // AI collaboration methods
    shareAIInteraction,
    
    // State sync methods
    syncDashboardState,
    requestCurrentState
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}