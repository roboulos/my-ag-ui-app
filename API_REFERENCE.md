# API Reference - CopilotKit Actions

This document provides a comprehensive reference for all CopilotKit actions available in the AG UI Dashboard, including parameters, usage examples, and implementation details.

## 📋 Table of Contents

- [Dashboard Management Actions](#dashboard-management-actions)
- [Metrics & KPI Actions](#metrics--kpi-actions)
- [Component Generation Actions](#component-generation-actions)
- [Advanced Analytics Actions](#advanced-analytics-actions)
- [Workflow Automation Actions](#workflow-automation-actions)
- [Usage Examples](#usage-examples)
- [Implementation Guide](#implementation-guide)

## 🎛 Dashboard Management Actions

### `updateDashboardLayout`
Changes the dashboard layout type to optimize component arrangement.

**Parameters:**
- `layout` (required): `"grid" | "list" | "kanban" | "cards"`

**Usage:**
```typescript
// AI Command: "Change to grid layout"
// Result: Dashboard switches to grid view
```

**Implementation:**
```typescript
useCopilotAction({
  name: "updateDashboardLayout",
  description: "Update the dashboard layout type",
  parameters: [{
    name: "layout",
    type: "string",
    enum: ["grid", "list", "kanban", "cards"],
    required: true
  }],
  handler: ({ layout }) => {
    updateState({ layout });
    return `Dashboard layout changed to ${layout}`;
  }
});
```

---

### `updateDashboardTheme`
Switches between light, dark, or auto theme modes.

**Parameters:**
- `theme` (required): `"light" | "dark" | "auto"`

**Usage:**
```typescript
// AI Command: "Switch to dark theme"
// Result: Dashboard applies dark mode styling
```

**Implementation:**
```typescript
useCopilotAction({
  name: "updateDashboardTheme",
  description: "Update the dashboard theme",
  parameters: [{
    name: "theme",
    type: "string",
    enum: ["light", "dark", "auto"],
    required: true
  }],
  handler: ({ theme }) => {
    updateState({ theme });
    return `Dashboard theme changed to ${theme}`;
  }
});
```

---

### `updateDashboardSettings`
Modifies dashboard configuration settings like grid columns, sidebar state, and metadata.

**Parameters:**
- `gridColumns` (optional): `number` - Grid columns (6-12)
- `sidebarOpen` (optional): `boolean` - Sidebar visibility
- `title` (optional): `string` - Dashboard title
- `description` (optional): `string` - Dashboard description

**Usage:**
```typescript
// AI Command: "Set grid to 10 columns and open sidebar"
// Result: Dashboard adjusts grid layout and shows sidebar
```

**Implementation:**
```typescript
useCopilotAction({
  name: "updateDashboardSettings",
  description: "Update dashboard settings like grid columns, sidebar, title, etc.",
  parameters: [
    { name: "gridColumns", type: "number", required: false },
    { name: "sidebarOpen", type: "boolean", required: false },
    { name: "title", type: "string", required: false },
    { name: "description", type: "string", required: false }
  ],
  handler: (settings) => {
    const updates = Object.fromEntries(
      Object.entries(settings).filter(([_, value]) => value !== undefined)
    );
    updateState(updates);
    return `Updated dashboard settings: ${Object.keys(updates).join(", ")}`;
  }
});
```

## 📊 Metrics & KPI Actions

### `addDashboardMetric`
Creates a new KPI metric with trend indicators and styling.

**Parameters:**
- `title` (required): `string` - Metric display name
- `value` (required): `string` - Metric value with units
- `change` (required): `number` - Percentage change
- `trend` (required): `"up" | "down" | "neutral"` - Trend direction
- `icon` (optional): `string` - Icon name (default: "TrendingUp")
- `color` (optional): `string` - Color theme (default: "purple")

**Usage:**
```typescript
// AI Command: "Add a revenue metric showing $1.2M with 15% growth"
// Result: New metric card appears with revenue data
```

**Implementation:**
```typescript
useCopilotAction({
  name: "addDashboardMetric",
  description: "Add a new metric to the dashboard",
  parameters: [
    { name: "title", type: "string", required: true },
    { name: "value", type: "string", required: true },
    { name: "change", type: "number", required: true },
    { name: "trend", type: "string", enum: ["up", "down", "neutral"], required: true },
    { name: "icon", type: "string", required: false },
    { name: "color", type: "string", required: false }
  ],
  handler: ({ title, value, change, trend, icon = "TrendingUp", color = "purple" }) => {
    const newMetric = {
      id: generateId(),
      title, value, change, trend, icon, color,
      visible: true
    };
    updateState({ metrics: [...state.metrics, newMetric] });
    return `Added new metric: ${title} with value ${value}`;
  }
});
```

## 🧩 Component Generation Actions

### `generateComponent`
Creates dynamic components from natural language descriptions.

**Parameters:**
- `description` (required): `string` - Natural language component description

**Supported Component Types:**
- Gauges, heatmaps, sparklines, funnels
- Progress bars, toggles, sliders, color pickers  
- Grids, panels, tabs, stat cards, alert banners

**Usage:**
```typescript
// AI Command: "Create a gauge chart showing CPU usage at 75%"
// Result: Interactive gauge component appears
```

**Implementation:**
```typescript
useCopilotAction({
  name: "generateComponent",
  description: "Generate a new dynamic component from natural language description",
  parameters: [{
    name: "description",
    type: "string",
    description: "Natural language description of component to create",
    required: true
  }],
  handler: ({ description }) => {
    const component = componentFactory.createFromDescription(description);
    if (component) {
      setDynamicComponents(prev => [...prev, component]);
      return `Created ${component.type} component: ${JSON.stringify(component.props)}`;
    }
    return `Could not create component from description: ${description}`;
  }
});
```

---

### `createSpecificComponent`
Creates a specific component type with custom properties.

**Parameters:**
- `type` (required): Component type enum
- `title` (optional): `string` - Component title
- `value` (optional): `number` - Primary value
- `data` (optional): `string` - JSON data array
- `color` (optional): `string` - Primary color (hex)

**Supported Types:**
```typescript
"gauge" | "heatmap" | "sparkline" | "funnel" | "progressBar" | 
"toggleSwitch" | "slider" | "colorPicker" | "dynamicGrid" | 
"collapsiblePanel" | "tabsContainer" | "statCard" | "alertBanner"
```

**Usage:**
```typescript
// AI Command: "Create a gauge with title 'Server Load' showing 85%"
// Result: Customized gauge component with specified properties
```

---

### `modifyComponent`
Updates properties of an existing dynamic component.

**Parameters:**
- `componentId` (required): `string` - Component ID to modify
- `properties` (required): `string` - JSON string of property updates

**Usage:**
```typescript
// AI Command: "Change the gauge color to red and set value to 90"
// Result: Existing gauge updates with new color and value
```

---

### `removeComponent`
Removes a dynamic component from the dashboard.

**Parameters:**
- `componentId` (required): `string` - Component ID to remove

**Usage:**
```typescript
// AI Command: "Remove the CPU gauge component"
// Result: Specified component disappears from dashboard
```

---

### `listComponents`
Lists all available component types and current dynamic components.

**Parameters:** None

**Usage:**
```typescript
// AI Command: "Show me all available component types"
// Result: Complete list of component types and current instances
```

## 📈 Advanced Analytics Actions

### `analyzePerformance`
Provides comprehensive performance analysis with insights and recommendations.

**Parameters:** None

**Returns:** Detailed performance report with:
- Overall performance score (0-100)
- Positive/negative trend analysis
- Key metric insights
- Actionable recommendations

**Usage:**
```typescript
// AI Command: "Analyze current performance and provide insights"
// Result: Comprehensive performance analysis report
```

**Sample Output:**
```markdown
📊 **Performance Analysis Summary**
**Overall Score:** 85/100 (4 positive, 1 negative trends)
**Key Observations:**
✅ Strong performance - 4 metrics trending upward
🚀 Revenue: Excellent 22.3% growth
⚠️ Churn Rate: 8.2% decline requires attention
```

---

### `identifyAnomalies`
Detects unusual patterns and anomalies in dashboard data.

**Parameters:** None

**Detection Criteria:**
- Extreme changes (>20% variation)
- Trend inconsistencies between related metrics
- Missing critical business metrics

**Usage:**
```typescript
// AI Command: "Identify any anomalies in the current data"
// Result: Anomaly detection report with severity levels
```

**Sample Output:**
```markdown
🔍 **Anomaly Detection Report**
🚨 **High Priority Anomalies:**
• Revenue: Extreme increase of 45%
⚠️ **Medium Priority Anomalies:**  
• Revenue increasing while users declining - investigate retention/pricing
```

---

### `suggestOptimizations`
Provides data-driven dashboard optimization recommendations.

**Parameters:** None

**Optimization Areas:**
- Layout efficiency
- Metric organization
- Chart sizing and placement
- Theme and UX improvements
- Performance optimizations

**Usage:**
```typescript
// AI Command: "Suggest optimizations for the dashboard"
// Result: Prioritized list of improvement recommendations
```

---

### `generateReport`
Creates comprehensive business reports with multiple format options.

**Parameters:**
- `reportType` (optional): `"summary" | "detailed" | "executive" | "technical"`

**Report Types:**
- **Summary**: Quick overview with key metrics
- **Detailed**: Comprehensive analysis with full data
- **Executive**: High-level business insights
- **Technical**: System configuration and performance data

**Usage:**
```typescript
// AI Command: "Generate an executive report"
// Result: Professional executive summary with KPIs and insights
```

---

### `predictTrends`
Forecasts future performance trends based on current data patterns.

**Parameters:**
- `timeframe` (optional): `"1week" | "1month" | "3months" | "6months"`

**Prediction Features:**
- Linear trend projection with confidence levels
- Growth/decline forecasting
- Risk and opportunity identification
- Business insight recommendations

**Usage:**
```typescript
// AI Command: "Predict trends for the next 3 months"
// Result: Trend forecasting report with projections and recommendations
```

---

### `suggestNewMetrics`
Recommends additional KPIs based on existing dashboard patterns.

**Parameters:** None

**Recommendation Logic:**
- Analyzes current metric coverage
- Identifies missing business fundamentals
- Suggests industry-specific metrics
- Provides implementation priority levels

**Usage:**
```typescript
// AI Command: "What additional metrics should I track?"
// Result: Prioritized list of recommended KPIs with rationale
```

## 🚀 Workflow Automation Actions

### `setupDashboardForRole`
Configures dashboard optimally for specific business roles.

**Parameters:**
- `role` (required): `"CEO" | "Manager" | "Analyst" | "Developer" | "Sales" | "Marketing"`

**Role Configurations:**
- **CEO**: Executive KPIs, high-level overview, professional styling
- **Manager**: Operational metrics, team performance, resource utilization
- **Analyst**: Detailed data metrics, comprehensive visualizations
- **Developer**: Technical metrics, system health, performance monitoring
- **Sales**: Revenue tracking, pipeline metrics, conversion analysis
- **Marketing**: Campaign performance, engagement metrics, ROI tracking

**Usage:**
```typescript
// AI Command: "Set up dashboard for CEO role"
// Result: Dashboard reconfigured with executive-level metrics and styling
```

---

### `createStandardReports`
Generates common business reports based on dashboard data.

**Parameters:**
- `reportFormat` (required): `"weekly" | "monthly" | "quarterly" | "custom"`

**Report Features:**
- Executive summary with performance scores
- Top performers and areas of concern
- Detailed metric analysis
- Time-period specific recommendations
- Actionable insights and next steps

**Usage:**
```typescript
// AI Command: "Generate a monthly business report"
// Result: Comprehensive monthly report with insights and recommendations
```

---

### `optimizeLayout`
Automatically arranges dashboard components for optimal user experience.

**Parameters:** None

**Optimization Features:**
- Content-based layout selection
- Metric importance sorting
- Sidebar optimization
- Theme selection based on usage patterns
- Performance-based recommendations

**Usage:**
```typescript
// AI Command: "Optimize the dashboard layout automatically"
// Result: Dashboard reorganized for better visual hierarchy and usability
```

## 📝 Usage Examples

### Basic Dashboard Setup
```typescript
// 1. Set up for business role
"Set up dashboard for Sales role"

// 2. Customize layout
"Change to grid layout with 10 columns"

// 3. Add relevant metrics
"Add monthly revenue metric showing $847,250 with 22.3% growth"

// 4. Generate visualizations
"Create a funnel chart for our sales conversion process"

// 5. Analyze performance
"Analyze current performance and provide insights"
```

### Advanced Analytics Workflow
```typescript
// 1. Performance analysis
"Analyze current performance and provide insights"

// 2. Anomaly detection  
"Identify any anomalies in the data"

// 3. Optimization suggestions
"Suggest optimizations for the dashboard"

// 4. Trend forecasting
"Predict trends for the next month"

// 5. Generate comprehensive report
"Generate a detailed quarterly report"
```

### Component Management
```typescript
// 1. Create components from description
"Create a gauge showing server CPU usage at 75%"

// 2. Create specific component types
"Make a heatmap for user activity patterns"

// 3. Modify existing components
"Change the gauge color to red and increase value to 90%"

// 4. List all components
"Show me all current dynamic components"

// 5. Remove components
"Remove the CPU usage gauge"
```

## 🛠 Implementation Guide

### Adding New Actions

1. **Define the Action**
```typescript
useCopilotAction({
  name: "yourActionName",
  description: "Clear description of what this action does",
  parameters: [
    {
      name: "paramName",
      type: "string",
      description: "Parameter description",
      required: true,
      enum: ["option1", "option2"] // For limited options
    }
  ],
  handler: ({ paramName }) => {
    // Implementation logic
    updateState(newState);
    return "Success message for AI";
  }
});
```

2. **Make State Available to AI**
```typescript
useCopilotReadable({
  description: "Description of state data",
  value: {
    // Current state data the AI should be aware of
    relevantStateData: state.data
  }
});
```

3. **Handle Complex Parameters**
```typescript
// For JSON data parameters
const parsedData = JSON.parse(jsonStringParam);

// For optional parameters
const defaultValue = param || defaultValue;

// For validation
if (!requiredParam) {
  return "Error: Required parameter missing";
}
```

### Best Practices

1. **Clear Action Names**: Use descriptive, verb-based names
2. **Comprehensive Descriptions**: Help AI understand when to use each action
3. **Parameter Validation**: Always validate inputs and provide helpful errors
4. **Meaningful Return Messages**: Return descriptive success/error messages
5. **State Consistency**: Ensure state updates maintain data integrity
6. **Performance Optimization**: Consider the impact of frequent state updates

### Error Handling

```typescript
handler: ({ params }) => {
  try {
    // Action implementation
    updateState(newState);
    return "Success message";
  } catch (error) {
    console.error("Action failed:", error);
    return `Error: ${error.message}`;
  }
}
```

---

This API reference provides complete documentation for all available CopilotKit actions, enabling developers to understand, use, and extend the AG UI Dashboard's AI capabilities.