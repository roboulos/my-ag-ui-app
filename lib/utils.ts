import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Zod schema to OpenAI response format
export function templatesToResponseFormat(templates: { schema: z.ZodSchema; name: string; description: string }[]) {
  return {
    type: "json_schema" as const,
    json_schema: {
      name: "ui_component",
      description: "Generate UI components based on user request",
      schema: {
        type: "object",
        properties: {
          template_name: {
            type: "string",
            enum: templates.map(t => t.name),
            description: "The type of component to generate"
          },
          template_props: {
            type: "object",
            description: "Properties for the component",
            additionalProperties: true
          }
        },
        required: ["template_name", "template_props"]
      },
      strict: true
    }
  };
}

// Validate component props against schema
export function validateComponentProps(templateName: string, props: any, schemas: Record<string, z.ZodSchema>) {
  const schema = schemas[templateName];
  if (!schema) {
    throw new Error(`Unknown template: ${templateName}`);
  }
  
  try {
    return schema.parse(props);
  } catch (error) {
    console.error(`Validation error for ${templateName}:`, error);
    throw error;
  }
}
