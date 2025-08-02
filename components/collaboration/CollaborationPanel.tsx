"use client";

import React, { useState } from "react";
import { useCollaboration } from "@/contexts/CollaborationContext";
import { Users, Wifi, WifiOff, MessageCircle, Activity, Eye, Edit, Bot, Clock } from "lucide-react";

export function CollaborationPanel() {
  const {
    isConnected,
    connectionStatus,
    currentUser,
    activeUsers,
    userCount,
    sharedAIHistory,
    connectToCollaboration,
    disconnectFromCollaboration,
    updateUserActivity
  } = useCollaboration();

  const [isExpanded, setIsExpanded] = useState(false);
  const [userName, setUserName] = useState("");

  // Handle connection toggle
  const handleConnectionToggle = () => {
    if (isConnected) {
      disconnectFromCollaboration();
    } else {
      connectToCollaboration(userName || undefined);
    }
  };

  // Get activity icon
  const getActivityIcon = (activity?: { type: string }) => {
    switch (activity?.type) {
      case 'editing': return <Edit className="w-3 h-3" />;
      case 'ai_chat': return <Bot className="w-3 h-3" />;
      case 'viewing': return <Eye className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3 opacity-50" />;
    }
  };

  // Get activity color
  const getActivityColor = (activity?: { type: string }) => {
    switch (activity?.type) {
      case 'editing': return 'text-blue-500';
      case 'ai_chat': return 'text-purple-500';
      case 'viewing': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  // Format time ago
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Main collaboration button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-3 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userCount} user{userCount !== 1 ? 's' : ''} online
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Offline
                </span>
              </>
            )}
          </div>
          
          {/* User avatars preview */}
          {isConnected && activeUsers.length > 0 && (
            <div className="flex -space-x-1 ml-2">
              {activeUsers.slice(0, 3).map((user) => (
                <div
                  key={user.sessionId}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-white"
                  style={{ backgroundColor: user.userColor }}
                  title={user.userName}
                >
                  {user.userName.charAt(0).toUpperCase()}
                </div>
              ))}
              {activeUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-400 flex items-center justify-center text-xs font-medium text-white">
                  +{activeUsers.length - 3}
                </div>
              )}
            </div>
          )}
        </button>

        {/* Expanded panel */}
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 min-w-80">
            {/* Connection section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Collaboration
                </h3>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  connectionStatus === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  connectionStatus === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {connectionStatus === 'connected' && <Wifi className="w-3 h-3" />}
                  {connectionStatus === 'connecting' && <Activity className="w-3 h-3 animate-spin" />}
                  {connectionStatus === 'error' && <WifiOff className="w-3 h-3" />}
                  {connectionStatus === 'disconnected' && <WifiOff className="w-3 h-3" />}
                  {connectionStatus}
                </div>
              </div>

              {!isConnected && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter your name (optional)"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleConnectionToggle}
                    disabled={connectionStatus === 'connecting'}
                    className="w-full px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 rounded-md transition-colors"
                  >
                    {connectionStatus === 'connecting' ? 'Connecting...' : 'Join Collaboration'}
                  </button>
                </div>
              )}

              {isConnected && (
                <button
                  onClick={handleConnectionToggle}
                  className="w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  Leave Collaboration
                </button>
              )}
            </div>

            {/* Active users section */}
            {isConnected && activeUsers.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Active Users ({userCount})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activeUsers.map((user) => (
                    <div
                      key={user.sessionId}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        user.sessionId === currentUser?.sessionId 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' 
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      {/* User avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white relative"
                        style={{ backgroundColor: user.userColor }}
                      >
                        {user.userName.charAt(0).toUpperCase()}
                        {/* Activity indicator */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center ${getActivityColor(user.currentActivity)}`}>
                          {getActivityIcon(user.currentActivity)}
                        </div>
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user.userName}
                          </span>
                          {user.sessionId === currentUser?.sessionId && (
                            <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getTimeAgo(user.lastActivity)}
                          </span>
                          {user.currentActivity?.description && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.currentActivity.description}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared AI history section */}
            {isConnected && sharedAIHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Recent AI Activity
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {sharedAIHistory.slice(-5).map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                        style={{ backgroundColor: interaction.userColor }}
                      >
                        {interaction.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {interaction.userName} • {getTimeAgo(interaction.timestamp)}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                          {interaction.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connection help */}
            {!isConnected && connectionStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Failed to connect to collaboration server. Make sure the server is running on port 3005.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collaborative cursors */}
      {isConnected && activeUsers.map((user) => (
        user.cursor && user.sessionId !== currentUser?.sessionId && (
          <div
            key={`cursor-${user.sessionId}`}
            className="fixed pointer-events-none z-50 transition-all duration-100"
            style={{
              left: user.cursor.x,
              top: user.cursor.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: user.userColor }}
            />
            <div
              className="mt-1 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
              style={{ backgroundColor: user.userColor }}
            >
              {user.userName}
            </div>
          </div>
        )
      ))}
    </div>
  );
}