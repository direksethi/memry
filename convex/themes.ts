import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all active themes for customers
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const themes = await ctx.db
      .query("themes")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return themes.sort((a, b) => a.order - b.order);
  },
});

// Get active themes by category
export const listByCategory = query({
  args: { categoryId: v.id("themeCategories") },
  handler: async (ctx, args) => {
    const themes = await ctx.db
      .query("themes")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    return themes.sort((a, b) => a.order - b.order);
  },
});

// Get all themes (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const themes = await ctx.db.query("themes").collect();
    return themes.sort((a, b) => a.order - b.order);
  },
});

// Get a single theme by ID
export const getById = query({
  args: { id: v.id("themes") },
  handler: async (ctx, args) => {
    const theme = await ctx.db.get(args.id);
    if (!theme) return null;
    
    const category = await ctx.db.get(theme.categoryId);
    return { ...theme, category };
  },
});

// Create a new theme (admin only)
export const create = mutation({
  args: {
    categoryId: v.id("themeCategories"),
    name: v.string(),
    coverImageUrl: v.string(),
    isActive: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("themes", {
      categoryId: args.categoryId,
      name: args.name,
      coverImageUrl: args.coverImageUrl,
      isActive: args.isActive,
      order: args.order,
    });
    return id;
  },
});

// Update a theme (admin only)
export const update = mutation({
  args: {
    id: v.id("themes"),
    categoryId: v.optional(v.id("themeCategories")),
    name: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Theme not found");
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

// Delete a theme (admin only)
export const remove = mutation({
  args: { id: v.id("themes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Toggle active status
export const toggleActive = mutation({
  args: { id: v.id("themes") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Theme not found");
    }
    await ctx.db.patch(args.id, { isActive: !existing.isActive });
    return !existing.isActive;
  },
});

// Get themes with their categories for display
export const listActiveWithCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("themeCategories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const result = [];
    for (const category of categories.sort((a, b) => a.order - b.order)) {
      const themes = await ctx.db
        .query("themes")
        .withIndex("by_category", (q) => q.eq("categoryId", category._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
      
      if (themes.length > 0) {
        result.push({
          category,
          themes: themes.sort((a, b) => a.order - b.order),
        });
      }
    }
    
    return result;
  },
});
