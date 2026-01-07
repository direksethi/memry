import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Page schema for validation
const pageSchema = v.object({
  pageNumber: v.number(),
  layout: v.string(),
  backgroundColor: v.string(),
  photos: v.array(
    v.object({
      storageId: v.string(),
      url: v.string(),
      x: v.number(),
      y: v.number(),
      width: v.number(),
      height: v.number(),
      rotation: v.number(),
    })
  ),
  texts: v.array(
    v.object({
      id: v.string(),
      content: v.string(),
      x: v.number(),
      y: v.number(),
      fontSize: v.number(),
      fontFamily: v.string(),
      color: v.string(),
      rotation: v.number(),
    })
  ),
});

// Generate a unique share ID
function generateShareId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get a photo book by share ID (for public viewing)
export const getByShareId = query({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    const photoBook = await ctx.db
      .query("photoBooks")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .first();

    if (!photoBook) {
      return null;
    }

    // Get related data
    const bookType = await ctx.db.get(photoBook.bookTypeId);
    const pageOption = await ctx.db.get(photoBook.pageOptionId);
    let theme = null;
    let themeCategory = null;
    if (photoBook.themeId) {
      theme = await ctx.db.get(photoBook.themeId);
      if (theme) {
        themeCategory = await ctx.db.get(theme.categoryId);
      }
    }

    return {
      ...photoBook,
      bookType,
      pageOption,
      theme: theme ? { ...theme, category: themeCategory } : null,
    };
  },
});

// Get a photo book by ID
export const getById = query({
  args: { id: v.id("photoBooks") },
  handler: async (ctx, args) => {
    const photoBook = await ctx.db.get(args.id);

    if (!photoBook) {
      return null;
    }

    // Get related data
    const bookType = await ctx.db.get(photoBook.bookTypeId);
    const pageOption = await ctx.db.get(photoBook.pageOptionId);
    let theme = null;
    let themeCategory = null;
    if (photoBook.themeId) {
      theme = await ctx.db.get(photoBook.themeId);
      if (theme) {
        themeCategory = await ctx.db.get(theme.categoryId);
      }
    }

    return {
      ...photoBook,
      bookType,
      pageOption,
      theme: theme ? { ...theme, category: themeCategory } : null,
    };
  },
});

// List all photo books (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const photoBooks = await ctx.db.query("photoBooks").collect();
    return photoBooks.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Create a new photo book
export const create = mutation({
  args: {
    bookTypeId: v.id("bookTypes"),
    pageOptionId: v.id("pageOptions"),
    themeId: v.id("themes"),
  },
  handler: async (ctx, args) => {
    // Verify all referenced entities exist
    const bookType = await ctx.db.get(args.bookTypeId);
    const pageOption = await ctx.db.get(args.pageOptionId);
    const theme = await ctx.db.get(args.themeId);

    if (!bookType || !pageOption || !theme) {
      throw new Error("Invalid book type, page option, or theme");
    }

    // Generate initial empty pages based on page count
    const pages = [];
    for (let i = 0; i < pageOption.pageCount; i++) {
      pages.push({
        pageNumber: i + 1,
        layout: "1",
        backgroundColor: "#ffffff",
        photos: [],
        texts: [],
      });
    }

    const now = Date.now();
    const shareId = generateShareId();

    const id = await ctx.db.insert("photoBooks", {
      shareId,
      bookTypeId: args.bookTypeId,
      pageOptionId: args.pageOptionId,
      themeId: args.themeId,
      pages,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    return { id, shareId };
  },
});

// Update photo book pages
export const updatePages = mutation({
  args: {
    id: v.id("photoBooks"),
    pages: v.array(pageSchema),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Photo book not found");
    }

    await ctx.db.patch(args.id, {
      pages: args.pages,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Update a single page
export const updatePage = mutation({
  args: {
    id: v.id("photoBooks"),
    pageNumber: v.number(),
    page: pageSchema,
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Photo book not found");
    }

    const pages = [...existing.pages];
    const pageIndex = pages.findIndex((p) => p.pageNumber === args.pageNumber);

    if (pageIndex === -1) {
      throw new Error("Page not found");
    }

    pages[pageIndex] = args.page;

    await ctx.db.patch(args.id, {
      pages,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// Mark photo book as completed
export const complete = mutation({
  args: { id: v.id("photoBooks") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Photo book not found");
    }

    await ctx.db.patch(args.id, {
      status: "completed",
      updatedAt: Date.now(),
    });

    return existing.shareId;
  },
});

// Delete a photo book
export const remove = mutation({
  args: { id: v.id("photoBooks") },
  handler: async (ctx, args) => {
    // Delete associated uploaded photos
    const uploadedPhotos = await ctx.db
      .query("uploadedPhotos")
      .withIndex("by_photoBookId", (q) => q.eq("photoBookId", args.id))
      .collect();

    for (const photo of uploadedPhotos) {
      await ctx.db.delete(photo._id);
    }

    await ctx.db.delete(args.id);
  },
});

// Update book selections (type, pages, theme)
export const updateSelections = mutation({
  args: {
    id: v.id("photoBooks"),
    bookTypeId: v.optional(v.id("bookTypes")),
    pageOptionId: v.optional(v.id("pageOptions")),
    themeId: v.optional(v.id("themes")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Photo book not found");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.bookTypeId) {
      const bookType = await ctx.db.get(args.bookTypeId);
      if (!bookType) throw new Error("Invalid book type");
      updates.bookTypeId = args.bookTypeId;
    }

    if (args.pageOptionId) {
      const pageOption = await ctx.db.get(args.pageOptionId);
      if (!pageOption) throw new Error("Invalid page option");
      updates.pageOptionId = args.pageOptionId;

      // Adjust pages if page count changed
      const currentPageCount = existing.pages.length;
      if (pageOption.pageCount !== currentPageCount) {
        const pages = [...existing.pages];
        if (pageOption.pageCount > currentPageCount) {
          // Add new pages
          for (let i = currentPageCount; i < pageOption.pageCount; i++) {
            pages.push({
              pageNumber: i + 1,
              layout: "1",
              backgroundColor: "#ffffff",
              photos: [],
              texts: [],
            });
          }
        } else {
          // Remove excess pages
          pages.splice(pageOption.pageCount);
        }
        updates.pages = pages;
      }
    }

    if (args.themeId) {
      const theme = await ctx.db.get(args.themeId);
      if (!theme) throw new Error("Invalid theme");
      updates.themeId = args.themeId;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});
