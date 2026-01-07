import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all active theme categories for customers
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("themeCategories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return categories.sort((a, b) => a.order - b.order);
  },
});

// Get all theme categories (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("themeCategories").collect();
    return categories.sort((a, b) => a.order - b.order);
  },
});

// Get a single theme category by ID
export const getById = query({
  args: { id: v.id("themeCategories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new theme category (admin only)
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("themeCategories", {
      name: args.name,
      description: args.description,
      isActive: args.isActive,
      order: args.order,
    });
    return id;
  },
});

// Update a theme category (admin only)
export const update = mutation({
  args: {
    id: v.id("themeCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Theme category not found");
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

// Delete a theme category (admin only)
export const remove = mutation({
  args: { id: v.id("themeCategories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Toggle active status
export const toggleActive = mutation({
  args: { id: v.id("themeCategories") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Theme category not found");
    }
    await ctx.db.patch(args.id, { isActive: !existing.isActive });
    return !existing.isActive;
  },
});
