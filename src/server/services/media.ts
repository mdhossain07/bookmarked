import "server-only";
import type { Model } from "mongoose";
import type { ListPagination } from "@/shared";
import { equalsText } from "../http/validate";

export interface PageOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** One page of lean documents plus the pagination block the client reads. */
export async function findPage<T>(
  model: Model<T>,
  filter: Record<string, unknown>,
  { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" }: PageOptions
) {
  const direction = sortOrder === "asc" ? 1 : -1;
  const [docs, total] = await Promise.all([
    model
      .find(filter)
      // _id breaks ties, so equal sort values cannot repeat across pages
      .sort({ [sortBy]: direction, _id: direction })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    model.countDocuments(filter),
  ]);
  const pages = Math.ceil(total / limit);

  const pagination: ListPagination = { page, limit, total, pages, hasNext: page < pages, hasPrev: page > 1 };
  return {
    items: docs.map((doc) => ({ ...doc, _id: String((doc as { _id: unknown })._id) })),
    pagination,
  };
}

/** Counts a user's documents by `field`; set `unwind` for array fields such as genres. */
export async function countBy<T>(
  model: Model<T>,
  userId: string,
  field: string,
  { unwind = false } = {}
): Promise<Record<string, number>> {
  const rows = await model.aggregate<{ _id: string; count: number }>([
    { $match: { userId } },
    ...(unwind ? [{ $unwind: `$${field}` }] : []),
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    // name breaks ties, so equal counts keep a stable order
    { $sort: { count: -1, _id: 1 } },
  ]);
  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}

/** Filter for "same title and creator" in one user's collection, ignoring case. */
export function duplicateFilter(
  userId: string,
  title: string,
  creatorField: "author" | "director",
  creator: string | undefined,
  excludeId?: string
): Record<string, unknown> {
  return {
    userId,
    title: equalsText(title),
    ...(creator && { [creatorField]: equalsText(creator) }),
    ...(excludeId && { _id: { $ne: excludeId } }),
  };
}

export function numberRange(min?: number, max?: number): Record<string, number> | undefined {
  if (min === undefined && max === undefined) return undefined;
  return { ...(min !== undefined && { $gte: min }), ...(max !== undefined && { $lte: max }) };
}

export function dateRange(from?: string, to?: string): Record<string, Date> | undefined {
  if (!from && !to) return undefined;
  return { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
}

/** `value` or `{ $in: value }`, for query params that may repeat. */
export function oneOrMany<T>(value: T | T[]): T | { $in: T[] } {
  return Array.isArray(value) ? { $in: value } : value;
}
