export function sanitizeQueryValue(value: any): any {
  if (value === "undefined" || value === "null" || value === "") {
    return undefined;
  }
  return value;
}

export function sanitizeQueryParams(params: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "" && value !== "undefined") {
      cleaned[key] = value;
    }
  }
  return cleaned;
}
