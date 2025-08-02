import { BaseEvent, EventType, StateDeltaEvent } from "@ag-ui/core";

// Crayon event types based on research
export interface CrayonTemplateEvent {
  type: "tpl";
  template_name: string;
  template_props: Record<string, any>;
}

export interface CrayonTextEvent {
  type: "text";
  content: string;
}

export interface CrayonDoneEvent {
  type: "done";
}

export type CrayonEvent = CrayonTemplateEvent | CrayonTextEvent | CrayonDoneEvent;

// Component type mappings from AG UI to Crayon
const COMPONENT_TYPE_MAP = new Map([
  // Keep our existing chart implementations (they're excellent)
  ['generateVisualization', 'agui-chart'],
  ['generateKPI', 'agui-kpi'],
  ['generateTable', 'agui-table'],
  ['generateForm', 'agui-form'],
  ['generateDashboard', 'agui-dashboard'],
  
  // New Crayon components to implement
  ['generateCarousel', 'c1-carousel'],
  ['generateTabs', 'c1-tabs'],
  ['generateRelatedQueries', 'c1-related-queries'],
  ['generateKanban', 'c1-kanban'],
  ['generateModal', 'c1-modal'],
  ['generateCalendar', 'c1-calendar'],
  ['generateTimeline', 'c1-timeline'],
  ['generateFileUpload', 'c1-file-upload'],
  ['generateSearch', 'c1-search'],
  ['generateRichTextEditor', 'c1-rich-text-editor'],
  ['generateNavigationMenu', 'c1-navigation-menu'],
  ['generateBreadcrumbs', 'c1-breadcrumbs'],
  ['generateProgressTracker', 'c1-progress-tracker'],
  ['generateNotificationPanel', 'c1-notification-panel'],
  ['generateImageGallery', 'c1-image-gallery'],
  ['generateVideoPlayer', 'c1-video-player'],
  ['generateAudioPlayer', 'c1-audio-player'],
  ['generateDataGrid', 'c1-data-grid']
]);

// Components that should use Crayon (AI-generated content)
const CRAYON_COMPONENTS = new Set([
  'c1-carousel',
  'c1-tabs', 
  'c1-related-queries',
  'c1-kanban',
  'c1-modal',
  'c1-calendar',
  'c1-timeline',
  'c1-file-upload',
  'c1-search',
  'c1-rich-text-editor',
  'c1-navigation-menu',
  'c1-breadcrumbs',
  'c1-progress-tracker',
  'c1-notification-panel',
  'c1-image-gallery',
  'c1-video-player',
  'c1-audio-player',
  'c1-data-grid'
]);

// Components that should use our existing shadcn/ui implementations
const AGUI_COMPONENTS = new Set([
  'agui-chart',
  'agui-kpi',
  'agui-table',
  'agui-form',
  'agui-dashboard'
]);

export class EventBridge {
  /**
   * Convert AG UI StateDelta event to Crayon template event
   */
  convertStateDeltaToC1(event: StateDeltaEvent): CrayonTemplateEvent | null {
    try {
      // Extract component information from delta
      const component = this.extractComponentFromDelta(event.delta);
      if (!component) return null;

      const mappedType = COMPONENT_TYPE_MAP.get(component.type);
      if (!mappedType) return null;

      return {
        type: "tpl",
        template_name: mappedType,
        template_props: component.props
      };
    } catch (error) {
      console.error('Failed to convert StateDelta to C1:', error);
      return null;
    }
  }

  /**
   * Convert AG UI text content event to Crayon text event
   */
  convertTextContentToC1(content: string): CrayonTextEvent {
    return {
      type: "text",
      content
    };
  }

  /**
   * Extract component information from AG UI delta operations
   */
  private extractComponentFromDelta(delta: any[]): { type: string; props: any } | null {
    try {
      // Look for add operations that contain component information
      for (const operation of delta) {
        if (operation.op === 'add' && operation.path === '/components/-') {
          const component = operation.value?.component;
          if (component?.type && component?.props) {
            return {
              type: component.type,
              props: component.props
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to extract component from delta:', error);
      return null;
    }
  }

  /**
   * Determine if a component should use Crayon rendering
   */
  shouldUseCrayon(componentType: string): boolean {
    const mappedType = COMPONENT_TYPE_MAP.get(componentType);
    return mappedType ? CRAYON_COMPONENTS.has(mappedType) : false;
  }

  /**
   * Determine if a component should use our existing AG UI rendering
   */
  shouldUseAGUI(componentType: string): boolean {
    const mappedType = COMPONENT_TYPE_MAP.get(componentType);
    return mappedType ? AGUI_COMPONENTS.has(mappedType) : true; // Default to AGUI
  }

  /**
   * Get the mapped component type
   */
  getMappedComponentType(originalType: string): string {
    return COMPONENT_TYPE_MAP.get(originalType) || originalType;
  }

  /**
   * Format component data for Crayon C1Component
   */
  formatForCrayon(component: { type: string; props: any }): string {
    // Convert component to the format expected by C1Component
    // This will be a JSON string representing the generated UI
    try {
      return JSON.stringify({
        component: {
          type: this.getMappedComponentType(component.type),
          props: component.props
        }
      });
    } catch (error) {
      console.error('Failed to format component for Crayon:', error);
      return JSON.stringify({ error: 'Failed to format component' });
    }
  }
}

// Export singleton instance
export const eventBridge = new EventBridge();

// Export constants for use in components
export { CRAYON_COMPONENTS, AGUI_COMPONENTS, COMPONENT_TYPE_MAP };