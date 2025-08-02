import React, { Suspense, lazy } from 'react';
import { eventBridge, CRAYON_COMPONENTS, AGUI_COMPONENTS } from '@/lib/event-bridge';

// Dynamic import for C1Component to avoid dependency issues
const importC1Component = async () => {
  try {
    const module = await import('@thesysai/genui-sdk');
    return module.C1Component;
  } catch (error) {
    console.warn('C1Component not available:', error);
    return null;
  }
};

// Lazy load Crayon components with error handling
const C1Component = lazy(async () => {
  const Component = await importC1Component();
  if (!Component) {
    // Return a fallback component if C1Component is not available
    return {
      default: ({ c1Response }: { c1Response: string }) => (
        <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950">
          <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-2">
            Crayon Component (Fallback)
          </div>
          <pre className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
            {c1Response}
          </pre>
        </div>
      )
    };
  }
  return { default: Component };
});

// Import our existing AG UI components
import { VisualizationTemplate, KPITemplate, FormTemplate, TableTemplate, DashboardTemplate } from '@/components/response-templates';

// Component loading skeleton
const ComponentSkeleton = () => (
  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
    <div className="text-gray-500 dark:text-gray-400">Loading component...</div>
  </div>
);

// Error boundary for component failures
const ComponentErrorBoundary = ({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) => {
  return (
    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-950">
      <div className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">
        Component failed to load
      </div>
      {fallback}
    </div>
  );
};

// Basic fallback component
const BasicComponent = ({ type, props }: { type: string; props: any }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
      {type}
    </div>
    <pre className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
      {JSON.stringify(props, null, 2)}
    </pre>
  </div>
);

interface UIComponent {
  id: string;
  type: string;
  props: any;
  timestamp: string;
}

interface ComponentResolverProps {
  component: UIComponent;
}

export const ComponentResolver: React.FC<ComponentResolverProps> = ({ component }) => {
  const mappedType = eventBridge.getMappedComponentType(component.type);
  
  // Use Crayon for AI-generated content components
  if (eventBridge.shouldUseCrayon(component.type)) {
    const c1Response = eventBridge.formatForCrayon(component);
    
    return (
      <Suspense fallback={<ComponentSkeleton />}>
        <ComponentErrorBoundary fallback={<BasicComponent type={component.type} props={component.props} />}>
          <C1Component
            c1Response={c1Response}
            isStreaming={false}
          />
        </ComponentErrorBoundary>
      </Suspense>
    );
  }

  // Use our existing excellent AG UI implementations
  if (eventBridge.shouldUseAGUI(component.type)) {
    switch (component.type) {
      case 'generateVisualization':
        return <VisualizationTemplate {...component.props} />;
      
      case 'generateKPI':
        return <KPITemplate {...component.props} />;
      
      case 'generateForm':
        return <FormTemplate {...component.props} />;
      
      case 'generateTable':
        return <TableTemplate {...component.props} />;
      
      case 'generateDashboard':
        return <DashboardTemplate {...component.props} />;
      
      default:
        return <BasicComponent type={component.type} props={component.props} />;
    }
  }

  // Fallback to basic component
  return <BasicComponent type={component.type} props={component.props} />;
};

// Helper component for rendering multiple components
export const ComponentRenderer = ({ component }: { component: UIComponent }) => {
  return (
    <div className="animate-component-materialize">
      <ComponentResolver component={component} />
    </div>
  );
};

export default ComponentResolver;