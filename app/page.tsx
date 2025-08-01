"use client";

import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import React, { useState } from "react";
import { BarChart, LineChart, PieChart, TrendingUp, Target, DollarSign, Users, Activity, Gauge, Clock, CheckCircle, AlertTriangle, Zap, Calendar, Filter, SortAsc, Table, Grid3X3, BarChart3, AreaChart } from "lucide-react";


// Enhanced Data Processing System
function processDataFromNaturalLanguage(input: any): any[] {
  // If it's already an array, return it directly
  if (Array.isArray(input)) {
    return input;
  }
  
  // Convert to string if it's an object
  const dataString = typeof input === 'string' ? input : JSON.stringify(input);
  
  // Extract data patterns like "Q1: $100k, Q2: $120k" or "Company A 40%, Company B 30%"
  const patterns = [
    // Quarterly data: Q1: $100k, Q2: $120k or Q1 100000
    /([QH][1-4]|Quarter\s*[1-4]|Q[1-4])[\s:]*[\$€£]?(\d+[\d,]*\.?\d*)[kKmMbB%]?/gi,
    // Company/Item data: Apple 40%, Company A 30
    /([A-Za-z][A-Za-z\s]*?)\s+(\d+[\.\d]*)[%kKmMbB]?/g,
    // Month data: Jan: 100, February 120
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[\s:]*[\$€£]?(\d+[\d,]*\.?\d*)[kKmMbB%]?/gi,
    // Simple number patterns: Revenue 100000, Sales 50000
    /([A-Za-z][A-Za-z\s]*?)[\s:]+[\$€£]?(\d+[\d,]*\.?\d*)[kKmMbB%]?/g
  ];
  
  let matches: any[] = [];
  
  for (const pattern of patterns) {
    const found = [...dataString.matchAll(pattern)];
    if (found.length > 0) {
      matches = found.map((match, index) => ({
        label: match[1].trim(),
        value: parseValue(match[2])
      }));
      break; // Use first successful pattern
    }
  }
  
  // If no patterns matched, try to find any numbers and create generic data
  if (matches.length === 0) {
    const numbers = dataString.match(/\d+[\d,]*\.?\d*/g);
    if (numbers && numbers.length > 0) {
      matches = numbers.slice(0, 6).map((num, index) => ({
        label: `Item ${index + 1}`,
        value: parseValue(num)
      }));
    }
  }
  
  // Last resort: generate sample data
  if (matches.length === 0) {
    matches = [
      { label: 'Sample A', value: 100 },
      { label: 'Sample B', value: 150 },
      { label: 'Sample C', value: 200 }
    ];
  }
  
  return matches;
}

function parseValue(str: string): number {
  const cleaned = str.replace(/[\$\€\£,%]/g, '');
  const num = parseFloat(cleaned);
  if (str.includes('k') || str.includes('K')) return num * 1000;
  if (str.includes('m') || str.includes('M')) return num * 1000000;
  if (str.includes('b') || str.includes('B')) return num * 1000000000;
  return num;
}

// Smart Chart Type Detection
function detectOptimalChartType(data: any[]): string {
  if (!data || data.length === 0) return 'bar';
  
  // If data has time-based labels, suggest line chart
  const timeLabels = data.some(d => 
    /^(Q[1-4]|[Qq]uarter|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4}|Week|Month)/.test(d.label || d.name || '')
  );
  if (timeLabels) return 'line';
  
  // If data has percentage values, suggest pie chart
  const hasPercentages = data.some(d => 
    typeof d.value === 'string' && d.value.includes('%')
  );
  if (hasPercentages) return 'pie';
  
  // If more than 6 items, suggest horizontal bar
  if (data.length > 6) return 'horizontal-bar';
  
  return 'bar';
}

// Comprehensive Style System
function getAdvancedStyleClasses(style: string) {
  const baseClasses = "backdrop-blur-xl rounded-2xl shadow-xl border transition-all duration-700 hover:shadow-2xl animate-fade-in";
  
  const styles = {
    modern: `${baseClasses} bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/30`,
    minimal: `${baseClasses} bg-white/90 dark:bg-gray-800/90 border-gray-200/40 dark:border-gray-700/40 shadow-sm`,
    colorful: `${baseClasses} bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-gradient-to-r border-blue-200/40 dark:border-blue-700/40`,
    corporate: `${baseClasses} bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/30 dark:border-slate-700/30`,
    glassmorphism: `${baseClasses} bg-white/10 dark:bg-gray-900/30 backdrop-blur-2xl border-white/30 dark:border-gray-600/30 shadow-2xl`
  };
  
  return styles[style as keyof typeof styles] || styles.modern;
}

// Enhanced Dynamic Visualization Components
function DynamicVisualization({ type, title, data, style = "modern", id, layout = "single" }: any) {
  // Process data if it's a string
  const processedData = typeof data === 'string' ? processDataFromNaturalLanguage(data) : (Array.isArray(data) ? data : []);
  
  // Auto-detect chart type if not specified or is generic
  const optimalType = (type === 'chart' || !type) ? detectOptimalChartType(processedData) : type;

  const renderChart = () => {
    if (!processedData || processedData.length === 0) {
      return (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No data to visualize</p>
        </div>
      );
    }

    switch (optimalType) {
      case "bar":
      case "chart":
        return (
          <div className="space-y-4">
            {processedData.map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-4 group hover:bg-white/10 dark:hover:bg-gray-700/20 rounded-lg p-2 transition-all duration-300">
                <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {item.label || item.name || `Item ${index + 1}`}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-sm animate-expand"
                    style={{ 
                      width: `${Math.min(100, (item.value / Math.max(...processedData.map((d: any) => d.value))) * 100)}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  />
                </div>
                <div className="w-20 text-sm font-bold text-gray-900 dark:text-white text-right">
                  {formatValue(item.value)}
                </div>
              </div>
            ))}
          </div>
        );
      
      case "horizontal-bar":
        return (
          <div className="space-y-3">
            {processedData.map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-3 group hover:bg-white/10 dark:hover:bg-gray-700/20 rounded-lg p-2 transition-all duration-300">
                <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {item.label || item.name || `Item ${index + 1}`}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 text-white text-xs font-semibold"
                    style={{ 
                      width: `${Math.min(100, (item.value / Math.max(...processedData.map((d: any) => d.value))) * 100)}%`,
                      animationDelay: `${index * 150}ms`
                    }}
                  >
                    {item.value > 0 && formatValue(item.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case "pie":
        const total = processedData.reduce((sum: number, item: any) => sum + (parseFloat(item.value) || 0), 0);
        let currentAngle = 0;
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative w-64 h-64 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <defs>
                  {processedData.map((_, index) => (
                    <linearGradient key={index} id={`pieGradient${index}-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={getPieColors(style)[index % getPieColors(style).length]} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={getPieColors(style)[index % getPieColors(style).length]} stopOpacity="1" />
                    </linearGradient>
                  ))}
                </defs>
                {processedData.map((item: any, index: number) => {
                  const value = parseFloat(item.value) || 0;
                  const percentage = (value / total) * 100;
                  const angle = (value / total) * 360;
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                  const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                  const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                  const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                  
                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ');
                  
                  currentAngle += angle;
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={`url(#pieGradient${index}-${id})`}
                      stroke="white"
                      strokeWidth="2"
                      className="transition-all duration-1000 ease-out hover:scale-105 cursor-pointer drop-shadow-lg"
                      style={{ animationDelay: `${index * 200}ms` }}
                    />
                  );
                })}
                <circle cx="100" cy="100" r="30" fill="white" className="drop-shadow-lg" />
                <text x="100" y="105" textAnchor="middle" className="text-xs font-bold fill-gray-700" fontSize="12">
                  Total
                </text>
                <text x="100" y="115" textAnchor="middle" className="text-xs fill-gray-600" fontSize="10">
                  {formatValue(total)}
                </text>
              </svg>
            </div>
            <div className="space-y-4">
              {processedData.map((item: any, index: number) => {
                const value = parseFloat(item.value) || 0;
                const percentage = ((value / total) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/20 dark:bg-gray-700/20 rounded-xl hover:bg-white/30 dark:hover:bg-gray-700/30 transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm" 
                        style={{ backgroundColor: getPieColors(style)[index % getPieColors(style).length] }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.label || item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatValue(value)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case "line":
        const maxValue = Math.max(...processedData.map((d: any) => parseFloat(d.value) || 0));
        const minValue = Math.min(...processedData.map((d: any) => parseFloat(d.value) || 0));
        const range = maxValue - minValue || 1;
        
        return (
          <div className="relative h-80">
            <svg className="w-full h-full" viewBox="0 0 500 300">
              <defs>
                <linearGradient id={`lineGradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={getLineColor(style)} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={getLineColor(style)} stopOpacity="0.05" />
                </linearGradient>
                <filter id={`glow-${id}`}>
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Grid lines */}
              <defs>
                <pattern id={`grid-${id}`} width="50" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 30" fill="none" stroke="gray" strokeOpacity="0.1" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="500" height="300" fill={`url(#grid-${id})`} />
              
              {/* Area fill */}
              <path
                d={`M 50 ${280 - ((processedData[0]?.value - minValue) / range) * 240} ${
                  processedData.map((item: any, index: number) => {
                    const x = 50 + (index / (processedData.length - 1)) * 400;
                    const y = 280 - ((parseFloat(item.value) - minValue) / range) * 240;
                    return `L ${x} ${y}`;
                  }).join(' ')
                } L ${50 + 400} 280 L 50 280 Z`}
                fill={`url(#lineGradient-${id})`}
                className="animate-fade-in"
              />
              
              {/* Main line */}
              <path
                d={`M 50 ${280 - ((processedData[0]?.value - minValue) / range) * 240} ${
                  processedData.map((item: any, index: number) => {
                    const x = 50 + (index / (processedData.length - 1)) * 400;
                    const y = 280 - ((parseFloat(item.value) - minValue) / range) * 240;
                    return `L ${x} ${y}`;
                  }).join(' ')
                }`}
                fill="none"
                stroke={getLineColor(style)}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#glow-${id})`}
                className="animate-draw"
              />
              
              {/* Data points */}
              {processedData.map((item: any, index: number) => {
                const x = 50 + (index / (processedData.length - 1)) * 400;
                const y = 280 - ((parseFloat(item.value) - minValue) / range) * 240;
                return (
                  <g key={index}>
                    <circle 
                      cx={x} cy={y} r="6" 
                      fill="white" 
                      stroke={getLineColor(style)} 
                      strokeWidth="3"
                      className="animate-fade-in hover:scale-125 transition-transform cursor-pointer drop-shadow-md"
                      style={{ animationDelay: `${index * 100}ms` }}
                    />
                    <text x={x} y={y - 15} textAnchor="middle" className="text-xs font-semibold fill-gray-600 dark:fill-gray-300">
                      {formatValue(item.value)}
                    </text>
                    <text x={x} y={295} textAnchor="middle" className="text-xs fill-gray-500 dark:fill-gray-400">
                      {(item.label || item.name || `P${index + 1}`).substring(0, 8)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        );
      
      case "area":
        const areaMaxValue = Math.max(...processedData.map((d: any) => parseFloat(d.value) || 0));
        return (
          <div className="relative h-72">
            <svg className="w-full h-full" viewBox="0 0 500 280">
              <defs>
                <linearGradient id={`areaGradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              {/* Area fill with gradient */}
              <path
                d={`M 40 240 ${
                  processedData.map((item: any, index: number) => {
                    const x = 40 + (index / (processedData.length - 1)) * 420;
                    const y = 240 - ((parseFloat(item.value) / areaMaxValue) * 200);
                    return `L ${x} ${y}`;
                  }).join(' ')
                } L ${40 + 420} 240 Z`}
                fill={`url(#areaGradient-${id})`}
                className="animate-fade-in"
              />
              
              {/* Top border line */}
              <path
                d={`M 40 ${240 - ((processedData[0]?.value / areaMaxValue) * 200)} ${
                  processedData.map((item: any, index: number) => {
                    const x = 40 + (index / (processedData.length - 1)) * 420;
                    const y = 240 - ((parseFloat(item.value) / areaMaxValue) * 200);
                    return `L ${x} ${y}`;
                  }).join(' ')
                }`}
                fill="none"
                stroke="#06B6D4"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-draw"
              />
            </svg>
          </div>
        );
      
      case "scatter":
        const scatterMaxX = Math.max(...processedData.map((d: any, i: number) => i));
        const scatterMaxY = Math.max(...processedData.map((d: any) => parseFloat(d.value) || 0));
        return (
          <div className="relative h-72">
            <svg className="w-full h-full" viewBox="0 0 500 280">
              {processedData.map((item: any, index: number) => {
                const x = 40 + (index / scatterMaxX) * 420;
                const y = 240 - ((parseFloat(item.value) / scatterMaxY) * 200);
                const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
                return (
                  <circle
                    key={index}
                    cx={x} cy={y} r={Math.random() * 8 + 4}
                    fill={colors[index % colors.length]}
                    fillOpacity="0.7"
                    stroke="white"
                    strokeWidth="2"
                    className="animate-fade-in hover:scale-150 transition-transform cursor-pointer drop-shadow-lg"
                    style={{ animationDelay: `${index * 50}ms` }}
                  />
                );
              })}
            </svg>
          </div>
        );
      
      case "gauge":
        const gaugeValue = parseFloat(processedData[0]?.value) || 0;
        const gaugeMax = 100; // Assume percentage for gauge
        const gaugePercentage = Math.min(100, (gaugeValue / gaugeMax) * 100);
        const gaugeAngle = (gaugePercentage / 100) * 180; // Half circle
        
        return (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-64 h-32">
              <svg className="w-full h-full" viewBox="0 0 200 100">
                <defs>
                  <linearGradient id={`gaugeGradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                
                {/* Background arc */}
                <path
                  d="M 20 80 A 80 80 0 0 1 180 80"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                
                {/* Progress arc */}
                <path
                  d="M 20 80 A 80 80 0 0 1 180 80"
                  fill="none"
                  stroke={`url(#gaugeGradient-${id})`}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(gaugePercentage / 100) * 251.2} 251.2`}
                  className="transition-all duration-2000 ease-out"
                />
                
                {/* Needle */}
                <line
                  x1="100" y1="80"
                  x2={100 + 60 * Math.cos((Math.PI * (180 - gaugeAngle)) / 180)}
                  y2={80 + 60 * Math.sin((Math.PI * (180 - gaugeAngle)) / 180)}
                  stroke="#374151"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="transition-all duration-2000 ease-out"
                />
                
                {/* Center dot */}
                <circle cx="100" cy="80" r="6" fill="#374151" />
                
                {/* Value text */}
                <text x="100" y="95" textAnchor="middle" className="text-xl font-bold fill-gray-700" fontSize="16">
                  {gaugeValue}%
                </text>
              </svg>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {processedData[0]?.label || processedData[0]?.name || "Progress"}
              </h4>
            </div>
          </div>
        );
      
      case "table":
        return (
          <div className="overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Table className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{processedData.length} entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <SortAsc className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Item</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Value</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">%</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.map((item: any, index: number) => {
                    const total = processedData.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
                    const percentage = total > 0 ? ((parseFloat(item.value) / total) * 100).toFixed(1) : '0';
                    return (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {item.label || item.name || `Item ${index + 1}`}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                          {formatValue(item.value)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case "progress":
        return (
          <div className="space-y-6">
            {processedData.map((item: any, index: number) => {
              const value = parseFloat(item.value) || 0;
              const maxVal = Math.max(...processedData.map(d => parseFloat(d.value) || 0));
              const percentage = maxVal > 0 ? (value / maxVal) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label || item.name || `Progress ${index + 1}`}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatValue(value)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1500 ease-out"
                      style={{ 
                        width: `${percentage}%`,
                        animationDelay: `${index * 200}ms`
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {percentage.toFixed(1)}% of maximum
                  </div>
                </div>
              );
            })}
          </div>
        );
      
      case "timeline":
        return (
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600"></div>
            <div className="space-y-8">
              {processedData.map((item: any, index: number) => (
                <div key={index} className="relative flex items-start space-x-6">
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-full border-4 border-blue-200 dark:border-blue-800 shadow-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-2">
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/20 dark:border-gray-700/30">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {item.label || item.name || `Event ${index + 1}`}
                      </h4>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatValue(item.value)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4 animate-pulse" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Unknown visualization type: <span className="font-mono">{optimalType}</span></p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Supported types: bar, horizontal-bar, pie, line, area, scatter, gauge, table, progress, timeline</p>
          </div>
        );
    }
  };
  
  // Helper functions for formatting and colors
  function formatValue(value: any): string {
    if (typeof value === 'string' && value.includes('%')) return value;
    const num = parseFloat(value) || 0;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }
  
  function getPieColors(style: string): string[] {
    const colorSchemes = {
      modern: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6'],
      minimal: ['#6B7280', '#9CA3AF', '#D1D5DB', '#374151', '#111827', '#4B5563', '#F3F4F6'],
      colorful: ['#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#06B6D4', '#F97316', '#EC4899'],
      corporate: ['#1E40AF', '#1E293B', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F1F5F9'],
      glassmorphism: ['#60A5FA', '#A78BFA', '#34D399', '#FBBF24', '#F87171', '#22D3EE', '#C084FC']
    };
    return colorSchemes[style as keyof typeof colorSchemes] || colorSchemes.modern;
  }
  
  function getLineColor(style: string): string {
    const colors = {
      modern: '#3B82F6',
      minimal: '#6B7280',
      colorful: '#8B5CF6',
      corporate: '#1E40AF',
      glassmorphism: '#60A5FA'
    };
    return colors[style as keyof typeof colors] || colors.modern;
  }

  return (
    <div className={`p-8 ${getAdvancedStyleClasses(style)} mb-6 ${layout === 'dashboard' ? 'col-span-1' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title || "Generated Visualization"}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          {(optimalType === "bar" || optimalType === "horizontal-bar") && <BarChart className="w-4 h-4" />}
          {optimalType === "line" && <LineChart className="w-4 h-4" />}
          {optimalType === "area" && <AreaChart className="w-4 h-4" />}
          {optimalType === "pie" && <PieChart className="w-4 h-4" />}
          {optimalType === "gauge" && <Gauge className="w-4 h-4" />}
          {optimalType === "table" && <Table className="w-4 h-4" />}
          {optimalType === "timeline" && <Clock className="w-4 h-4" />}
          {optimalType === "progress" && <TrendingUp className="w-4 h-4" />}
          {optimalType === "scatter" && <Activity className="w-4 h-4" />}
          <span className="capitalize">{optimalType.replace('-', ' ')} {optimalType !== 'table' && optimalType !== 'timeline' ? 'Chart' : ''}</span>
        </div>
      </div>
      {renderChart()}
    </div>
  );
}

// Enhanced Metrics Display with Smart Icons and Advanced Styling
function MetricsDisplay({ metrics, style = "modern", layout = "grid" }: any) {
  const iconMap: { [key: string]: any } = {
    revenue: DollarSign,
    sales: DollarSign,
    profit: TrendingUp,
    growth: TrendingUp,
    users: Users,
    customers: Users,
    clients: Users,
    target: Target,
    goals: Target,
    performance: Activity,
    speed: Zap,
    time: Clock,
    success: CheckCircle,
    warning: AlertTriangle,
    calendar: Calendar,
    default: Activity
  };
  
  const getSmartIcon = (metric: any, index: number) => {
    const label = (metric.label || metric.name || '').toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (label.includes(key)) return icon;
    }
    const fallbackIcons = [DollarSign, TrendingUp, Users, Target, Activity, Zap];
    return fallbackIcons[index % fallbackIcons.length];
  };
  
  const getStyleConfig = (style: string) => {
    const configs = {
      modern: {
        container: 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl',
        colors: ['text-emerald-600', 'text-blue-600', 'text-purple-600', 'text-amber-600', 'text-rose-600', 'text-cyan-600'],
        bgColors: ['bg-emerald-50 dark:bg-emerald-900/20', 'bg-blue-50 dark:bg-blue-900/20', 'bg-purple-50 dark:bg-purple-900/20', 'bg-amber-50 dark:bg-amber-900/20', 'bg-rose-50 dark:bg-rose-900/20', 'bg-cyan-50 dark:bg-cyan-900/20']
      },
      minimal: {
        container: 'bg-white/90 dark:bg-gray-800/90',
        colors: ['text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-500'],
        bgColors: ['bg-gray-100 dark:bg-gray-700/30', 'bg-gray-50 dark:bg-gray-700/20', 'bg-gray-200 dark:bg-gray-700/40']
      },
      colorful: {
        container: 'bg-gradient-to-br from-white/80 via-blue-50/60 to-purple-50/80 dark:from-gray-800/80 dark:via-blue-900/20 dark:to-purple-900/20',
        colors: ['text-pink-600', 'text-blue-600', 'text-purple-600', 'text-emerald-600', 'text-orange-600', 'text-cyan-600'],
        bgColors: ['bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30', 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30', 'bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30']
      },
      corporate: {
        container: 'bg-slate-50/80 dark:bg-slate-800/80',
        colors: ['text-slate-600', 'text-slate-700', 'text-slate-800', 'text-slate-500'],
        bgColors: ['bg-slate-100 dark:bg-slate-700/30', 'bg-slate-200 dark:bg-slate-700/40']
      }
    };
    return configs[style as keyof typeof configs] || configs.modern;
  };
  
  const styleConfig = getStyleConfig(style);
  const gridClass = layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6' : 'flex flex-wrap gap-4';
  
  return (
    <div className={`${gridClass} mb-6`}>
      {metrics.map((metric: any, index: number) => {
        const Icon = getSmartIcon(metric, index);
        const hasTarget = metric.target && metric.target > 0;
        const progress = hasTarget ? Math.min(100, (parseFloat(metric.value) / metric.target) * 100) : null;
        
        return (
          <div key={index} className={`${styleConfig.container} rounded-2xl shadow-lg p-6 border border-white/20 dark:border-gray-700/30 hover:shadow-xl transition-all duration-300 animate-fade-in group hover:scale-105`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${styleConfig.bgColors[index % styleConfig.bgColors.length]} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${styleConfig.colors[index % styleConfig.colors.length]}`} />
              </div>
              <div className="text-right">
                {metric.trend && (
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    metric.trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${metric.trend < 0 ? 'rotate-180' : ''}`} />
                    <span>{metric.trend > 0 ? '+' : ''}{metric.trend}%</span>
                  </div>
                )}
                {metric.period && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    vs {metric.period}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {metric.label || metric.name}
              </h4>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatMetricValue(metric.value)}
                </p>
                {metric.unit && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {metric.unit}
                  </span>
                )}
              </div>
              
              {hasTarget && progress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Progress to target</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        progress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                        progress >= 80 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                        progress >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                        'bg-gradient-to-r from-rose-500 to-rose-600'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {metric.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {metric.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  function formatMetricValue(value: any): string {
    if (typeof value === 'string') return value;
    const num = parseFloat(value) || 0;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }
}

export default function Home() {
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);

  // Make context readable by the agent
  useCopilotReadable({
    description: "Current dashboard state and user interface context",
    value: {
      page: "dashboard",
      status: "ready_for_dynamic_generation",
      capabilities: ["chart_generation", "report_creation", "metrics_display", "data_visualization"],
      currentContent: generatedContent
    },
  });

  // Generate any type of data visualization dynamically
  useCopilotAction({
    name: "generateVisualization",
    description: "Generate any type of data visualization dynamically based on conversation. Can parse natural language data like 'Q1: $100k, Q2: $120k' or 'Company A 40%, Company B 30%'.",
    parameters: [
      { name: "type", type: "string", description: "Type: chart, bar, horizontal-bar, line, area, pie, scatter, gauge, metrics, table, progress, timeline, dashboard", required: true },
      { name: "title", type: "string", description: "Title for the visualization", required: true },
      { name: "data", type: "object", description: "Dynamic data to visualize - can be array of objects with label/name and value, or natural language string like 'Q1: $100k, Q2: $120k'", required: true },
      { name: "style", type: "string", description: "Visual style: modern, minimal, colorful, corporate, glassmorphism", required: false },
      { name: "layout", type: "string", description: "Layout type: single, dashboard, grid", required: false }
    ],
    render: ({ status, args }) => {
      if (status === "executing") {
        return (
          <div className="flex items-center justify-center p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Generating visualization...</span>
          </div>
        );
      }
      
      const id = Math.random().toString(36).substr(2, 9);
      
      if (args?.type === "metrics") {
        return <MetricsDisplay metrics={args.data} style={args.style} layout={args.layout} />;
      }
      
      return (
        <DynamicVisualization 
          type={args?.type} 
          title={args?.title} 
          data={args?.data} 
          style={args?.style || "modern"}
          layout={args?.layout}
          id={id}
        />
      );
    },
  });

  // Update existing visualizations
  useCopilotAction({
    name: "updateVisualization",
    description: "Modify existing visualization based on user requests",
    parameters: [
      { name: "type", type: "string", description: "New chart type if changing", required: false },
      { name: "title", type: "string", description: "New title if changing", required: false },
      { name: "data", type: "object", description: "Updated data", required: false },
      { name: "style", type: "string", description: "New style if changing", required: false }
    ],
    render: ({ status, args }) => {
      if (status === "executing") {
        return (
          <div className="flex items-center justify-center p-8 bg-amber-50/50 dark:bg-amber-900/20 backdrop-blur-xl rounded-2xl shadow-lg border border-amber-200/30 dark:border-amber-700/30 mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <span className="ml-3 text-amber-700 dark:text-amber-400">Updating visualization...</span>
          </div>
        );
      }
      
      const id = Math.random().toString(36).substr(2, 9);
      
      if (args?.type === "metrics") {
        return <MetricsDisplay metrics={args.data} style={args.style} layout={args.layout} />;
      }
      
      return (
        <DynamicVisualization 
          type={args?.type || "chart"} 
          title={args?.title || "Updated Visualization"} 
          data={args?.data} 
          style={args?.style || "modern"}
          layout={args?.layout}
          id={id}
        />
      );
    },
  });

  // Clear all generated content
  useCopilotAction({
    name: "clearVisualization",
    description: "Clear all generated content and reset to clean state",
    parameters: [],
    render: ({ status }) => {
      if (status === "executing") {
        return (
          <div className="flex items-center justify-center p-8 bg-red-50/50 dark:bg-red-900/20 backdrop-blur-xl rounded-2xl shadow-lg border border-red-200/30 dark:border-red-700/30 mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-3 text-red-700 dark:text-red-400">Clearing content...</span>
          </div>
        );
      }
      return null;
    },
  });

  // Generate comprehensive dashboard with smart data parsing
  useCopilotAction({
    name: "generateDashboard",
    description: "Generate a complete dashboard with multiple visualizations. Can create sales dashboards, analytics dashboards, or any business intelligence dashboard with multiple chart types.",
    parameters: [
      { name: "title", type: "string", description: "Dashboard title", required: true },
      { name: "metrics", type: "object", description: "Array of KPI metrics with optional targets and trends", required: false },
      { name: "charts", type: "object", description: "Array of chart configurations with different types", required: false },
      { name: "style", type: "string", description: "Overall dashboard style: modern, minimal, colorful, corporate, glassmorphism", required: false },
      { name: "layout", type: "string", description: "Dashboard layout: grid, masonry, split, full-width", required: false }
    ],
    render: ({ status, args }) => {
      if (status === "executing") {
        return (
          <div className="flex items-center justify-center p-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-200/30 dark:border-blue-700/30 mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-700 dark:text-blue-400">Generating dashboard...</span>
          </div>
        );
      }
      
      const dashboardStyle = args?.style || "modern";
      const dashboardLayout = args?.layout || "grid";
      
      return (
        <div className={`space-y-8 animate-fade-in ${
          dashboardLayout === 'masonry' ? 'columns-1 md:columns-2 xl:columns-3 gap-6' :
          dashboardLayout === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' :
          dashboardLayout === 'full-width' ? 'space-y-6' :
          'space-y-8'
        }`}>
          {/* Dashboard Header */}
          <div className={`text-center p-8 ${getAdvancedStyleClasses(dashboardStyle)} rounded-2xl`}>
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 blur-3xl animate-pulse-glow" />
              <h2 className="relative text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-300%">
                {args?.title || "Generated Dashboard"}
              </h2>
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full animate-expand"></div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Real-time • AI Generated • Interactive
            </div>
          </div>
          
          {/* Metrics Section */}
          {args?.metrics && (
            <div className={dashboardLayout === 'masonry' ? 'break-inside-avoid mb-6' : ''}>
              <MetricsDisplay 
                metrics={args.metrics} 
                style={dashboardStyle}
                layout={dashboardLayout === 'split' ? 'flex' : 'grid'}
              />
            </div>
          )}
          
          {/* Charts Section */}
          {args?.charts && (
            <div className={`${
              dashboardLayout === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-8' :
              dashboardLayout === 'masonry' ? 'space-y-6' :
              dashboardLayout === 'split' ? 'space-y-6' :
              'space-y-8'
            }`}>
              {args.charts.map((chart: any, index: number) => (
                <div key={index} className={dashboardLayout === 'masonry' ? 'break-inside-avoid' : ''}>
                  <DynamicVisualization 
                    type={chart.type}
                    title={chart.title}
                    data={chart.data}
                    style={chart.style || dashboardStyle}
                    layout={dashboardLayout}
                    id={`dashboard-chart-${index}`}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Dashboard Footer Stats */}
          <div className={`${getAdvancedStyleClasses(dashboardStyle)} rounded-2xl p-6 text-center`}>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {args?.charts?.length || 0}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Visualizations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {args?.metrics?.length || 0}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Key Metrics</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  100%
                </div>
                <div className="text-gray-500 dark:text-gray-400">Data Fresh</div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
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
            
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Explore real-time business metrics and insights through our intelligent AI assistant
            </p>

            {/* AI Assistant Call-to-Action */}
            <div className="mt-12">
              <div className="max-w-2xl mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-white/20 dark:border-gray-700/30">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  AI-Powered Dynamic UI Generation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Generate custom charts, metrics, and dashboards through natural conversation. Each visualization is created dynamically based on your specific data and requirements.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">📊 Visualizations</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      "Create a revenue chart with Q1: $100k, Q2: $120k, Q3: $150k"
                    </p>
                  </div>
                  
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">📈 Metrics</h4>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      "Show KPIs: Revenue $2.5M, Growth +24%, Users 10k"
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">🎨 Styling</h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      "Make it a pie chart with colorful style"
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">🗂️ Dashboards</h4>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      "Create a sales dashboard with metrics and charts"
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    ✨ Real-time Generation
                  </span>
                  <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    🔄 Dynamic Updates
                  </span>
                  <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    🎯 Custom Data
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}