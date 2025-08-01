"use client";

import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useState } from "react";

// Types for business documents
interface ChartData {
  labels: string[];
  values: number[];
  type: 'bar' | 'line' | 'pie';
}

interface BusinessDocument {
  id: string;
  type: 'chart' | 'report' | 'metrics';
  title: string;
  keywords: string[];
  data: ChartData | any;
}

// Mock business documents
const mockDocuments: BusinessDocument[] = [
  {
    id: "revenue-2024",
    type: "chart",
    title: "2024 Revenue by Quarter",
    keywords: ["revenue", "sales", "income", "quarterly", "financial", "money"],
    data: {
      type: "bar",
      labels: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
      values: [125000, 150000, 175000, 225000]
    }
  },
  {
    id: "growth-trend",
    type: "chart", 
    title: "Company Growth Trend",
    keywords: ["growth", "trend", "progress", "timeline", "history"],
    data: {
      type: "line",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      values: [100000, 120000, 115000, 140000, 160000, 180000]
    }
  },
  {
    id: "market-share",
    type: "chart",
    title: "Market Share Distribution",
    keywords: ["market", "share", "distribution", "competitors", "position"],
    data: {
      type: "pie",
      labels: ["Our Company", "Competitor A", "Competitor B", "Others"],
      values: [35, 25, 20, 20]
    }
  },
  {
    id: "key-metrics",
    type: "metrics",
    title: "Key Business Metrics",
    keywords: ["metrics", "kpi", "performance", "indicators", "dashboard"],
    data: {
      metrics: [
        { label: "Total Revenue", value: "$675,000", trend: "+15%" },
        { label: "Active Customers", value: "2,451", trend: "+8%" },
        { label: "Conversion Rate", value: "3.2%", trend: "+0.5%" },
        { label: "Avg Deal Size", value: "$12,500", trend: "+12%" }
      ]
    }
  }
];

export default function Home() {
  const [currentDocument, setCurrentDocument] = useState<BusinessDocument | null>(null);

  // Make state readable by the agent

  useCopilotReadable({
    description: "The currently displayed business document",
    value: currentDocument,
  });

  useCopilotReadable({
    description: "Available business documents",
    value: mockDocuments.map(doc => ({ id: doc.id, title: doc.title, keywords: doc.keywords })),
  });

  // Define actions the agent can perform

  useCopilotAction({
    name: "showBusinessDocument",
    description: "Display a business document based on conversation context. Can show revenue charts, growth trends, market share, or key metrics.",
    parameters: [
      {
        name: "keywords",
        type: "string",
        description: "Keywords from the conversation to find relevant documents (e.g., 'revenue', 'growth', 'metrics')",
        required: false,
      },
      {
        name: "documentId",
        type: "string",
        description: "Specific document ID to display",
        required: false,
      },
    ],
    handler: async ({ keywords, documentId }) => {
      // If documentId is provided, find that specific document
      if (documentId) {
        const doc = mockDocuments.find(d => d.id === documentId);
        if (doc) {
          setCurrentDocument(doc);
          return { success: true, message: `Displaying document: ${doc.title}` };
        }
        return { success: false, message: `Document with ID ${documentId} not found` };
      }

      // Otherwise, find document by keywords
      if (keywords) {
        const keywordArray = keywords.toLowerCase().split(' ');
        
        // Score each document based on keyword matches
        const scoredDocs = mockDocuments.map(doc => {
          const score = keywordArray.reduce((acc, keyword) => {
            const matches = doc.keywords.filter(k => k.includes(keyword)).length;
            return acc + matches;
          }, 0);
          return { doc, score };
        });

        // Get the best matching document
        const bestMatch = scoredDocs.sort((a, b) => b.score - a.score)[0];
        
        if (bestMatch.score > 0) {
          setCurrentDocument(bestMatch.doc);
          return { success: true, message: `Displaying: ${bestMatch.doc.title}` };
        }
      }

      // Default to showing metrics if no specific match
      const metricsDoc = mockDocuments.find(d => d.id === "key-metrics");
      setCurrentDocument(metricsDoc || null);
      return { success: true, message: "Displaying key business metrics" };
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {currentDocument ? (
          // Document Display View
          <div className="animate-fade-in">
            <DocumentViewer document={currentDocument} onBack={() => setCurrentDocument(null)} />
          </div>
        ) : (
          // Initial Welcome View
          <div className="animate-fade-in">
            <div className="text-center mb-16">
              {/* Premium header with gradient background */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 blur-3xl" />
                <h1 className="relative text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-300% tracking-tight">
                  Business Intelligence
                </h1>
                <div className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8">
                  Dashboard
                </div>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 font-light">
                AI-Powered Analytics Platform
              </p>
              
              {/* Animated metrics bar */}
              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$2.5M</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+24%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Growth Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">98.5%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Uptime</div>
                </div>
              </div>
              
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Explore real-time business metrics and insights through our intelligent AI assistant
              </p>
            </div>

            {/* Document Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {mockDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  className="relative group"
                  onClick={() => setCurrentDocument(doc)}
                >
                  {/* 3D tilt effect container */}
                  <div
                    className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 transition-all duration-500 cursor-pointer border border-white/20 dark:border-gray-700/30"
                    style={{
                      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                      transformStyle: 'preserve-3d',
                      animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                      animationDelay: `${index * 0.2}s`
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
                      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
                      e.currentTarget.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale(1.05)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
                    }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Mini chart preview */}
                    <div className="h-24 mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-2">
                      {doc.type === 'chart' && doc.data.type === 'bar' && <MiniBarChart data={doc.data} />}
                      {doc.type === 'chart' && doc.data.type === 'line' && <MiniLineChart data={doc.data} />}
                      {doc.type === 'chart' && doc.data.type === 'pie' && <MiniPieChart data={doc.data} />}
                      {doc.type === 'metrics' && <MiniMetrics data={doc.data} />}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {doc.keywords.slice(0, 3).join(', ')}
                    </p>
                    
                    {/* Last updated with pulse */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                        View details →
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Assistant Hint */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 rounded-full px-6 py-3">
                <span className="text-blue-600 dark:text-blue-400 mr-2">💡</span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Try asking: "Show me the revenue chart" or "What are our key metrics?"
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Document Viewer Component
function DocumentViewer({ document, onBack }: { document: BusinessDocument | null; onBack: () => void }) {
  if (!document) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in">
        <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-inner">
          <div className="text-7xl mb-6 animate-bounce-slow">📊</div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            No Document Selected
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
            Start a conversation with the AI assistant and relevant business documents will appear here automatically
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full animate-fade-in">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {document.title}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 min-h-[500px] border border-gray-100 dark:border-gray-700">
        {/* Render different components based on document type */}
        {document.type === 'chart' && <ChartComponent data={document.data as ChartData} />}
        {document.type === 'metrics' && <MetricsComponent data={document.data} />}
        {document.type === 'report' && <ReportComponent data={document.data} />}
      </div>
    </div>
  );
}

// Chart Component
function ChartComponent({ data }: { data: ChartData }) {
  if (data.type === 'bar') {
    return <BarChart data={data} />;
  }
  if (data.type === 'line') {
    return <LineChart data={data} />;
  }
  if (data.type === 'pie') {
    return <PieChart data={data} />;
  }
  return <div>Unsupported chart type</div>;
}

// Bar Chart Component
function BarChart({ data }: { data: ChartData }) {
  const maxValue = Math.max(...data.values);
  const chartHeight = 280;
  const yAxisSteps = 5;
  const stepValue = Math.ceil(maxValue / yAxisSteps / 10000) * 10000;
  const adjustedMax = stepValue * yAxisSteps;
  
  return (
    <div className="w-full">
      <div className="flex">
        {/* Y-axis */}
        <div className="flex flex-col justify-between h-[280px] pr-4 text-right">
          {Array.from({ length: yAxisSteps + 1 }).map((_, i) => {
            const value = adjustedMax - (i * stepValue);
            return (
              <div key={i} className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                ${(value / 1000).toFixed(0)}k
              </div>
            );
          })}
        </div>
        
        {/* Chart area */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {Array.from({ length: yAxisSteps + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full border-t border-gray-200 dark:border-gray-700"
                style={{ top: `${(i / yAxisSteps) * 100}%` }}
              />
            ))}
          </div>
          
          {/* Bars */}
          <div className="relative h-[280px] flex items-end justify-around gap-4 px-2">
            {data.values.map((value, index) => {
              const height = (value / adjustedMax) * chartHeight;
              const percentage = ((value / adjustedMax) * 100).toFixed(0);
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-end relative group">
                  {/* Enhanced tooltip */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
                    <div className="relative bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-xl">
                      <div className="font-semibold text-sm">{data.labels[index]}</div>
                      <div className="text-lg font-bold">${value.toLocaleString()}</div>
                      <div className="text-xs text-gray-300">+{((value / data.values[0] - 1) * 100).toFixed(1)}% from Q1</div>
                      {/* Tooltip arrow */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
                    </div>
                  </div>
                  
                  {/* Bar with enhanced gradient and shadow */}
                  <div 
                    className="relative w-full overflow-hidden rounded-t-lg transition-all duration-700 animate-grow-up cursor-pointer"
                    style={{ 
                      height: `${height}px`,
                      animationDelay: `${index * 150}ms`,
                      background: `linear-gradient(180deg, 
                        rgba(59, 130, 246, 1) 0%, 
                        rgba(59, 130, 246, 0.9) 50%, 
                        rgba(37, 99, 235, 1) 100%)`,
                      boxShadow: '0 -4px 12px rgba(59, 130, 246, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Value label on bar */}
                    <div className="absolute top-2 left-0 right-0 text-center text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex ml-12">
        <div className="flex-1 flex justify-around border-t-2 border-gray-300 dark:border-gray-600 pt-4">
          {data.labels.map((label, index) => (
            <div key={index} className="flex-1 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Line Chart Component
function LineChart({ data }: { data: ChartData }) {
  const maxValue = Math.max(...data.values);
  const minValue = Math.min(...data.values);
  const range = maxValue - minValue;
  const chartHeight = 280;
  const chartWidth = 600;
  const pointSpacing = chartWidth / (data.values.length - 1);
  
  // Create SVG path
  const pathData = data.values.map((value, index) => {
    const x = index * pointSpacing;
    const y = chartHeight - ((value - minValue) / range) * chartHeight;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="w-full h-[350px]">
      <svg viewBox={`0 0 ${chartWidth} 320`} className="w-full h-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => (
          <line
            key={i}
            x1="0"
            y1={chartHeight - (percent * chartHeight)}
            x2={chartWidth}
            y2={chartHeight - (percent * chartHeight)}
            stroke="currentColor"
            className="text-gray-200 dark:text-gray-700"
            strokeDasharray="5,5"
          />
        ))}
        
        {/* Line chart */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          className="animate-draw-line"
        />
        
        {/* Area under line */}
        <path
          d={`${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
          fill="url(#areaGradient)"
          opacity="0.2"
        />
        
        {/* Data points */}
        {data.values.map((value, index) => {
          const x = index * pointSpacing;
          const y = chartHeight - ((value - minValue) / range) * chartHeight;
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill="currentColor"
                className="text-blue-600 dark:text-blue-400 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              />
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                className="text-xs font-semibold fill-gray-700 dark:fill-gray-300 opacity-0 hover:opacity-100 transition-opacity"
              >
                ${(value / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}
        
        {/* Gradients */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {data.labels.map((label, index) => (
          <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Pie Chart Component
function PieChart({ data }: { data: ChartData }) {
  const total = data.values.reduce((sum, value) => sum + value, 0);
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  
  // Colors for pie slices
  const colors = [
    'rgb(59, 130, 246)', // blue-500
    'rgb(139, 92, 246)', // violet-500
    'rgb(236, 72, 153)', // pink-500
    'rgb(251, 146, 60)', // orange-400
  ];
  
  // Calculate pie slices
  let cumulativeAngle = -90; // Start from top
  const slices = data.values.map((value, index) => {
    const angle = (value / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return { angle, startAngle, value, label: data.labels[index], color: colors[index % colors.length] };
  });

  // Helper function to calculate arc path
  const getArcPath = (startAngle: number, endAngle: number, offset: number = 0) => {
    const start = polarToCartesian(centerX, centerY, radius + offset, endAngle);
    const end = polarToCartesian(centerX, centerY, radius + offset, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius + offset, radius + offset, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="w-full h-[350px] flex items-center justify-center">
      <div className="relative">
        <svg width="300" height="300" className="transform transition-transform duration-300 hover:scale-105">
          {slices.map((slice, index) => (
            <g key={index} className="group">
              <path
                d={getArcPath(slice.startAngle, slice.startAngle + slice.angle)}
                fill={slice.color}
                className="transition-all duration-300 hover:brightness-110 cursor-pointer animate-scale-in"
                style={{ 
                  transformOrigin: `${centerX}px ${centerY}px`,
                  animationDelay: `${index * 100}ms` 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('d', getArcPath(slice.startAngle, slice.startAngle + slice.angle, 5));
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('d', getArcPath(slice.startAngle, slice.startAngle + slice.angle, 0));
                }}
              />
              {/* Percentage text */}
              <text
                x={polarToCartesian(centerX, centerY, radius * 0.7, slice.startAngle + slice.angle / 2).x}
                y={polarToCartesian(centerX, centerY, radius * 0.7, slice.startAngle + slice.angle / 2).y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-white font-semibold text-sm pointer-events-none"
              >
                {((slice.value / total) * 100).toFixed(0)}%
              </text>
            </g>
          ))}
        </svg>
        
        {/* Legend */}
        <div className="absolute -right-40 top-1/2 -translate-y-1/2">
          <div className="space-y-2">
            {slices.map((slice, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {slice.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Metrics Component  
function MetricsComponent({ data }: { data: any }) {
  if (!data.metrics) {
    return <div>No metrics data available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.metrics.map((metric: any, index: number) => {
        const isPositive = metric.trend.startsWith('+');
        const trendColor = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
        const trendBg = isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10';
        const trendIcon = isPositive ? '↗' : '↘';
        
        return (
          <div 
            key={index} 
            className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {metric.label}
                </h3>
                <div className={`${trendBg} ${trendColor} text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1`}>
                  <span className="text-lg">{trendIcon}</span>
                  {metric.trend}
                </div>
              </div>
              
              <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent animate-count-up">
                {metric.value}
              </div>
              
              {/* Progress bar */}
              <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isPositive ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-red-400 to-red-600'} rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${Math.min(parseFloat(metric.trend) * 5 + 50, 100)}%`,
                    animation: 'grow-up 1s ease-out forwards',
                    animationDelay: `${index * 150 + 300}ms`,
                    transformOrigin: 'left'
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Report Component
function ReportComponent({ data }: { data: any }) {
  return <div>Report placeholder</div>;
}

// Mini Chart Components for Preview Cards

function MiniBarChart({ data }: { data: ChartData }) {
  const maxValue = Math.max(...data.values);
  
  return (
    <div className="w-full h-full flex items-end justify-around gap-1">
      {data.values.map((value, index) => {
        const height = (value / maxValue) * 100;
        return (
          <div
            key={index}
            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t animate-grow-up opacity-80"
            style={{ 
              height: `${height}%`,
              animationDelay: `${index * 50}ms`,
              animationDuration: '0.5s'
            }}
          />
        );
      })}
    </div>
  );
}

function MiniLineChart({ data }: { data: ChartData }) {
  const maxValue = Math.max(...data.values);
  const minValue = Math.min(...data.values);
  const range = maxValue - minValue;
  const width = 120;
  const height = 60;
  const pointSpacing = width / (data.values.length - 1);
  
  const pathData = data.values.map((value, index) => {
    const x = index * pointSpacing;
    const y = height - ((value - minValue) / range) * height;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <path
        d={pathData}
        fill="none"
        stroke="url(#miniLineGradient)"
        strokeWidth="2"
        className="animate-draw-line"
        style={{ animationDuration: '1s' }}
      />
      <defs>
        <linearGradient id="miniLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MiniPieChart({ data }: { data: ChartData }) {
  const total = data.values.reduce((sum, value) => sum + value, 0);
  const centerX = 40;
  const centerY = 40;
  const radius = 30;
  
  const colors = [
    'rgb(59, 130, 246)',
    'rgb(139, 92, 246)',
    'rgb(236, 72, 153)',
    'rgb(251, 146, 60)',
  ];
  
  let cumulativeAngle = -90;
  const slices = data.values.map((value, index) => {
    const angle = (value / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return { angle, startAngle, color: colors[index % colors.length] };
  });
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  const getArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };
  
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      {slices.map((slice, index) => (
        <path
          key={index}
          d={getArcPath(slice.startAngle, slice.startAngle + slice.angle)}
          fill={slice.color}
          className="animate-scale-in"
          style={{ 
            transformOrigin: `${centerX}px ${centerY}px`,
            animationDelay: `${index * 100}ms`,
            animationDuration: '0.5s'
          }}
        />
      ))}
    </svg>
  );
}

function MiniMetrics({ data }: { data: any }) {
  return (
    <div className="w-full h-full flex flex-col justify-center gap-1">
      {data.metrics.slice(0, 2).map((metric: any, index: number) => {
        const isPositive = metric.trend.startsWith('+');
        return (
          <div key={index} className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
              {metric.value}
            </span>
            <span className={`${isPositive ? 'text-green-600' : 'text-red-600'} font-semibold`}>
              {metric.trend}
            </span>
          </div>
        );
      })}
    </div>
  );
}