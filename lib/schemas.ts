import { z } from "zod";

// Schema for data visualization components
export const VisualizationSchema = z.object({
  type: z.enum(["line", "bar", "pie", "scatter", "area", "radar", "heatmap", "gauge", "treemap", "sankey"]),
  title: z.string(),
  data: z.array(z.object({
    label: z.string(),
    value: z.number()
  })),
  config: z.record(z.any()).optional()
});

// Schema for dashboard components
export const DashboardSchema = z.object({
  title: z.string(),
  layout: z.enum(["grid", "list", "masonry"]).optional(),
  components: z.array(z.record(z.any()))
});

// Schema for form components
export const FormSchema = z.object({
  title: z.string(),
  fields: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.string().optional(),
    placeholder: z.string().optional(),
    options: z.array(z.string()).optional()
  })),
  submitAction: z.string().optional()
});

// Schema for table components
export const TableSchema = z.object({
  title: z.string(),
  columns: z.array(z.object({
    field: z.string(),
    label: z.string()
  })),
  data: z.array(z.record(z.any())),
  features: z.object({
    sorting: z.boolean().optional(),
    filtering: z.boolean().optional(),
    pagination: z.boolean().optional()
  }).optional()
});

// Schema for KPI components
export const KPISchema = z.object({
  title: z.string(),
  value: z.string(),
  change: z.string(),
  icon: z.enum(["revenue", "users", "sales", "products", "activity"]).optional(),
  trend: z.enum(["up", "down"])
});

// Schema for advanced data table
export const DataTableSchema = z.object({
  title: z.string(),
  columns: z.array(z.object({
    field: z.string(),
    label: z.string(),
    type: z.enum(["text", "number", "date", "currency", "badge"]).optional(),
    sortable: z.boolean().optional(),
    filterable: z.boolean().optional()
  })),
  data: z.array(z.record(z.any())),
  features: z.object({
    sorting: z.boolean().optional(),
    filtering: z.boolean().optional(),
    pagination: z.boolean().optional(),
    search: z.boolean().optional(),
    export: z.boolean().optional(),
    selection: z.boolean().optional()
  }).optional(),
  pageSize: z.number().optional()
});

// Schema for timeline components
export const TimelineSchema = z.object({
  title: z.string(),
  type: z.enum(["vertical", "horizontal"]).optional(),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    status: z.enum(["completed", "in-progress", "pending", "cancelled"]),
    icon: z.string().optional(),
    color: z.string().optional()
  })),
  showProgress: z.boolean().optional()
});

// Schema for document viewer
export const DocumentViewerSchema = z.object({
  title: z.string(),
  documentType: z.enum(["pdf", "markdown", "text", "code"]),
  content: z.string().optional(),
  features: z.object({
    search: z.boolean().optional(),
    annotations: z.boolean().optional(),
    navigation: z.boolean().optional(),
    download: z.boolean().optional(),
    fullscreen: z.boolean().optional()
  }).optional(),
  pages: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string().optional()
  })).optional()
});

// Schema for rich text editor
export const RichTextEditorSchema = z.object({
  title: z.string(),
  initialContent: z.string().optional(),
  features: z.object({
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    underline: z.boolean().optional(),
    lists: z.boolean().optional(),
    links: z.boolean().optional(),
    images: z.boolean().optional(),
    tables: z.boolean().optional(),
    codeBlocks: z.boolean().optional(),
    headings: z.boolean().optional()
  }).optional(),
  placeholder: z.string().optional(),
  maxLength: z.number().optional()
});

// Schema for calendar
export const CalendarSchema = z.object({
  title: z.string(),
  view: z.enum(["month", "week", "day", "agenda"]).optional(),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    start: z.string(),
    end: z.string().optional(),
    allDay: z.boolean().optional(),
    color: z.string().optional(),
    category: z.string().optional()
  })).optional(),
  features: z.object({
    addEvents: z.boolean().optional(),
    editEvents: z.boolean().optional(),
    deleteEvents: z.boolean().optional(),
    dragDrop: z.boolean().optional(),
    timeSlots: z.boolean().optional()
  }).optional()
});

// Schema for file upload
export const FileUploadSchema = z.object({
  title: z.string(),
  acceptedTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().optional(),
  maxFiles: z.number().optional(),
  features: z.object({
    dragDrop: z.boolean().optional(),
    preview: z.boolean().optional(),
    progress: z.boolean().optional(),
    validation: z.boolean().optional(),
    thumbnails: z.boolean().optional()
  }).optional(),
  uploadUrl: z.string().optional(),
  placeholder: z.string().optional()
});

// Schema for settings panel
export const SettingsPanelSchema = z.object({
  title: z.string(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    settings: z.array(z.object({
      id: z.string(),
      label: z.string(),
      description: z.string().optional(),
      type: z.enum(["toggle", "select", "input", "slider", "color", "file"]),
      value: z.any().optional(),
      options: z.array(z.string()).optional(),
      min: z.number().optional(),
      max: z.number().optional()
    }))
  })),
  layout: z.enum(["tabs", "accordion", "sidebar"]).optional()
});

// Schema for analytics dashboard
export const AnalyticsDashboardSchema = z.object({
  title: z.string(),
  timeRange: z.enum(["today", "week", "month", "quarter", "year", "custom"]).optional(),
  metrics: z.array(z.object({
    id: z.string(),
    title: z.string(),
    value: z.string(),
    change: z.string().optional(),
    trend: z.enum(["up", "down", "neutral"]).optional(),
    icon: z.string().optional()
  })),
  charts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(["line", "bar", "pie", "area", "scatter", "heatmap"]),
    data: z.array(z.record(z.any())),
    size: z.enum(["small", "medium", "large", "full"]).optional()
  })),
  features: z.object({
    realTime: z.boolean().optional(),
    export: z.boolean().optional(),
    filters: z.boolean().optional(),
    customization: z.boolean().optional(),
    alerts: z.boolean().optional()
  }).optional()
});

// Export type definitions for TypeScript
export type VisualizationType = z.infer<typeof VisualizationSchema>;
export type DashboardType = z.infer<typeof DashboardSchema>;
export type FormType = z.infer<typeof FormSchema>;
export type TableType = z.infer<typeof TableSchema>;
export type KPIType = z.infer<typeof KPISchema>;
export type DataTableType = z.infer<typeof DataTableSchema>;
export type TimelineType = z.infer<typeof TimelineSchema>;
export type DocumentViewerType = z.infer<typeof DocumentViewerSchema>;
export type RichTextEditorType = z.infer<typeof RichTextEditorSchema>;
export type CalendarType = z.infer<typeof CalendarSchema>;
export type FileUploadType = z.infer<typeof FileUploadSchema>;
export type SettingsPanelType = z.infer<typeof SettingsPanelSchema>;
export type AnalyticsDashboardType = z.infer<typeof AnalyticsDashboardSchema>;