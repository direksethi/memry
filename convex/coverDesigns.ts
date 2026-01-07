import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all active cover designs for customers
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const coverDesigns = await ctx.db
      .query("coverDesigns")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return coverDesigns.sort((a, b) => a.order - b.order);
  },
});

// Get all cover designs (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const coverDesigns = await ctx.db.query("coverDesigns").collect();
    return coverDesigns.sort((a, b) => a.order - b.order);
  },
});

// Get a single cover design by ID
export const getById = query({
  args: { id: v.id("coverDesigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new cover design (admin only)
export const create = mutation({
  args: {
    name: v.string(),
    imageUrl: v.string(),
    isActive: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("coverDesigns", {
      name: args.name,
      imageUrl: args.imageUrl,
      isActive: args.isActive,
      order: args.order,
    });
    return id;
  },
});

// Update a cover design (admin only)
export const update = mutation({
  args: {
    id: v.id("coverDesigns"),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Cover design not found");
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

// Delete a cover design (admin only)
export const remove = mutation({
  args: { id: v.id("coverDesigns") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Toggle active status
export const toggleActive = mutation({
  args: { id: v.id("coverDesigns") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Cover design not found");
    }
    await ctx.db.patch(args.id, { isActive: !existing.isActive });
    return !existing.isActive;
  },
});
