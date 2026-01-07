import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all active book types for customers
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const bookTypes = await ctx.db
      .query("bookTypes")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return bookTypes.sort((a, b) => a.order - b.order);
  },
});

// Get all book types (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const bookTypes = await ctx.db.query("bookTypes").collect();
    return bookTypes.sort((a, b) => a.order - b.order);
  },
});

// Get a single book type by ID
export const getById = query({
  args: { id: v.id("bookTypes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new book type (admin only)
export const create = mutation({
  args: {
    name: v.string(),
    aspectRatio: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    imageUrl: v.string(),
    isActive: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("bookTypes", {
      name: args.name,
      aspectRatio: args.aspectRatio,
      description: args.description,
      price: args.price,
      imageUrl: args.imageUrl,
      isActive: args.isActive,
      order: args.order,
    });
    return id;
  },
});

// Update a book type (admin only)
export const update = mutation({
  args: {
    id: v.id("bookTypes"),
    name: v.optional(v.string()),
    aspectRatio: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Book type not found");
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

// Delete a book type (admin only)
export const remove = mutation({
  args: { id: v.id("bookTypes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Toggle active status
export const toggleActive = mutation({
  args: { id: v.id("bookTypes") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Book type not found");
    }
    await ctx.db.patch(args.id, { isActive: !existing.isActive });
    return !existing.isActive;
  },
});
