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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-5 h-screen">
        {/* Document Viewer Panel - 60% width on desktop */}
        <div className="lg:col-span-3 p-8 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <DocumentViewer document={currentDocument} />
        </div>
        
        {/* Instructions Panel - 40% width on desktop */}
        <div className="lg:col-span-2 p-8 overflow-y-auto bg-white dark:bg-gray-900">
          <main className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                Business Intelligence Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                AI-Powered Document Viewer with Context Awareness
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
                📊 Available Business Documents
              </h3>
              <div className="space-y-3">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Revenue Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Try: "Show me the revenue chart" or "What's our income?"</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Growth Trends</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Try: "Display growth trends" or "Show our progress"</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Market Position</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Try: "What's our market share?" or "Show competitors"</p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Metrics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Try: "Show KPIs" or "Display our metrics dashboard"</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Context-Aware</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Documents appear based on conversation
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Live Updates</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Real-time data visualization
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">🎨</div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">Interactive Charts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Hover for details, smooth animations
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="text-2xl mb-2">🤖</div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">AI Integration</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Powered by AG UI protocol
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Document Viewer Component
function DocumentViewer({ document }: { document: BusinessDocument | null }) {
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
      <div className="flex items-center justify-between mb-6">
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
  const chartHeight = 300;
  
  return (
    <div className="w-full">
      <div className="relative h-[300px] flex items-end justify-around gap-4 mb-4">
        {data.values.map((value, index) => {
          const height = (value / maxValue) * chartHeight;
          const percentage = ((value / maxValue) * 100).toFixed(0);
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end relative group">
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                ${value.toLocaleString()}
              </div>
              <div 
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 rounded-t-md transition-all duration-700 hover:from-blue-700 hover:to-blue-500 dark:hover:from-blue-800 dark:hover:to-blue-600 shadow-lg animate-grow-up"
                style={{ 
                  height: `${height}px`,
                  animationDelay: `${index * 100}ms`
                }}
                title={`${data.labels[index]}: $${value.toLocaleString()}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-around border-t border-gray-200 dark:border-gray-600 pt-4">
        {data.labels.map((label, index) => (
          <div key={index} className="flex-1 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </div>
        ))}
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
        const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
        const trendBg = isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';
        
        return (
          <div 
            key={index} 
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
                {metric.label}
              </h3>
              <span className={`${trendColor} ${trendBg} text-sm font-semibold px-2 py-1 rounded`}>
                {metric.trend}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {metric.value}
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