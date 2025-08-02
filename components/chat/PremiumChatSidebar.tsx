"use client";

import { useState, useRef, useEffect } from 'react';
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { Send, MessageSquare, Sparkles, User, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function PremiumChatSidebar({ 
  instructions,
  defaultOpen = true,
  clickOutsideToClose = false 
}: {
  instructions: string;
  defaultOpen?: boolean;
  clickOutsideToClose?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { 
    layout, 
    theme, 
    gridColumns, 
    metrics, 
    charts, 
    title, 
    description,
    setLayout,
    setTheme,
    setGridColumns,
    addMetric,
    addChart
  } = useDashboard();

  // Make dashboard state readable to CopilotKit
  useCopilotReadable({
    description: "Current dashboard state and configuration",
    value: {
      layout,
      theme,
      gridColumns,
      metrics: metrics.map(m => ({ title: m.title, value: m.value, visible: m.visible })),
      charts: charts.map(c => ({ title: c.title, type: c.type, visible: c.visible })),
      title,
      description
    }
  });

  // Add CopilotKit actions for dashboard control
  useCopilotAction({
    name: "changeLayout",
    description: "Change the dashboard layout",
    parameters: [
      { name: "layout", type: "string", enum: ["grid", "list", "kanban", "cards"] }
    ],
    handler: ({ layout: newLayout }) => {
      setLayout(newLayout as any);
      addMessage('assistant', `Changed dashboard layout to ${newLayout}`);
    }
  });

  useCopilotAction({
    name: "changeTheme",
    description: "Change the dashboard theme",
    parameters: [
      { name: "theme", type: "string", enum: ["light", "dark"] }
    ],
    handler: ({ theme: newTheme }) => {
      setTheme(newTheme as any);
      addMessage('assistant', `Changed dashboard theme to ${newTheme} mode`);
    }
  });

  useCopilotAction({
    name: "setGridColumns",
    description: "Set the number of grid columns",
    parameters: [
      { name: "columns", type: "number", description: "Number of columns (1-12)" }
    ],
    handler: ({ columns }) => {
      setGridColumns(Math.max(1, Math.min(12, columns)));
      addMessage('assistant', `Set grid columns to ${columns}`);
    }
  });

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Simple response system for demo purposes
    setTimeout(() => {
      let response = '';
      const input = currentInput.toLowerCase();

      if (input.includes('settings') || input.includes('current')) {
        response = `Current dashboard settings:
- Layout: ${layout}
- Theme: ${theme}
- Grid Columns: ${gridColumns}
- Metrics: ${metrics.filter(m => m.visible).length}/${metrics.length} visible
- Charts: ${charts.filter(c => c.visible).length}/${charts.length} visible`;
      } else if (input.includes('layout')) {
        if (input.includes('grid')) {
          setLayout('grid');
          response = 'Changed layout to grid view.';
        } else if (input.includes('list')) {
          setLayout('list');
          response = 'Changed layout to list view.';
        } else {
          response = 'Available layouts: grid, list, kanban, cards. Try saying "change to grid layout".';
        }
      } else if (input.includes('theme')) {
        if (input.includes('dark')) {
          setTheme('dark');
          response = 'Switched to dark theme.';
        } else if (input.includes('light')) {
          setTheme('light');
          response = 'Switched to light theme.';
        } else {
          response = 'Try saying "switch to dark theme" or "switch to light theme".';
        }
      } else if (input.includes('columns') || input.includes('column')) {
        const match = input.match(/(\d+)/);
        if (match) {
          const cols = parseInt(match[1]);
          setGridColumns(Math.max(1, Math.min(12, cols)));
          response = `Set grid columns to ${cols}.`;
        } else {
          response = 'Try saying "set columns to 6" or specify a number between 1-12.';
        }
      } else {
        response = `I can help you with:
• Dashboard settings: "Show me my current settings"
• Layout changes: "Change to grid layout"
• Theme switching: "Switch to dark theme"
• Grid columns: "Set columns to 8"

What would you like to do?`;
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-96 h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Assistant</h3>
              <p className="text-sm opacity-90">Dashboard Intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600 dark:text-gray-400">Online & Ready</span>
          </div>
          <div className="text-gray-500 dark:text-gray-500">
            {messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Welcome to your AI Dashboard Assistant
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              I can help you manage and analyze your dashboard in real-time.
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
              <p>Try asking:</p>
              <p>"Show me my current metrics"</p>
              <p>"Change to dark theme"</p>
              <p>"Add a revenue chart"</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                } shadow-sm`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 opacity-70 ${
                  message.role === 'user' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your dashboard..."
              disabled={isLoading}
              className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 top-2 p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          AI-powered dashboard assistant • Real-time collaboration
        </p>
      </div>
    </div>
  );
}