import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all active page options for customers
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const pageOptions = await ctx.db
      .query("pageOptions")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return pageOptions.sort((a, b) => a.order - b.order);
  },
});

// Get all page options (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const pageOptions = await ctx.db.query("pageOptions").collect();
    return pageOptions.sort((a, b) => a.order - b.order);
  },
});

// Get a single page option by ID
export const getById = query({
  args: { id: v.id("pageOptions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new page option (admin only)
export const create = mutation({
  args: {
    pageCount: v.number(),
    additionalPrice: v.number(),
    isActive: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("pageOptions", {
      pageCount: args.pageCount,
      additionalPrice: args.additionalPrice,
      isActive: args.isActive,
      order: args.order,
    });
    return id;
  },
});

// Update a page option (admin only)
export const update = mutation({
  args: {
    id: v.id("pageOptions"),
    pageCount: v.optional(v.number()),
    additionalPrice: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Page option not found");
    }

    const filteredUpdates: Partial<typeof existing> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        (filteredUpdates as Record<string, unknown>)[key] = value;
      }
    }

    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});

// Delete a page option (admin only)
export const remove = mutation({
  args: { id: v.id("pageOptions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Toggle active status
export const toggleActive = mutation({
  args: { id: v.id("pageOptions") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Page option not found");
    }
    await ctx.db.patch(args.id, { isActive: !existing.isActive });
    return !existing.isActive;
  },
});
