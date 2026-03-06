/**
 * Replaces {{ key }} placeholders in a template string with values from a context object.
 * Supports dot notation for nested properties (e.g. {{ $settings.name }}).
 */
export function interpolate(template: string, context: Record<string, unknown>): string {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, key: string) => {
    const parts = key.split('.');
    let value: unknown = context;

    for (const part of parts) {
      if (value == null || typeof value !== 'object') {
        return '';
      }
      value = (value as Record<string, unknown>)[part];
    }

    return value != null ? String(value) : '';
  });
}
