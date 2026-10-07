/** The cookie store behind the mocked `next/headers`. */
export const jar = new Map<string, { value: string; options: Record<string, unknown> }>();
