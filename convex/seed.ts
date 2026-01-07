import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Seed initial data for the application
export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingBookTypes = await ctx.db.query("bookTypes").first();
    if (existingBookTypes) {
      return { message: "Data already seeded" };
    }

    // Seed book types
    const bookTypes = [
      {
        name: "Portrait Photobook",
        aspectRatio: "3:4",
        price: 49.99,
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=533&fit=crop",
        isActive: true,
        order: 1,
      },
      {
        name: "Landscape Photobook",
        aspectRatio: "4:3",
        price: 54.99,
        imageUrl: "https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=533&h=400&fit=crop",
        isActive: true,
        order: 2,
      },
      {
        name: "Square Photobook",
        aspectRatio: "1:1",
        price: 44.99,
        imageUrl: "https://images.unsplash.com/photo-1531685250784-7569952593d2?w=400&h=400&fit=crop",
        isActive: true,
        order: 3,
      },
    ];

    for (const bookType of bookTypes) {
      await ctx.db.insert("bookTypes", bookType);
    }

    // Seed page options
    const pageOptions = [
      {
        pageCount: 50,
        additionalPrice: 0,
        isActive: true,
        order: 1,
      },
      {
        pageCount: 100,
        additionalPrice: 19.99,
        isActive: true,
        order: 2,
      },
    ];

    for (const pageOption of pageOptions) {
      await ctx.db.insert("pageOptions", pageOption);
    }

    // Seed theme categories
    const themeCategories = [
      { name: "Weddings", description: "Celebrate your special day", isActive: true, order: 1 },
      { name: "Travel", description: "Capture your adventures", isActive: true, order: 2 },
      { name: "Birthdays", description: "Birthday memories", isActive: true, order: 3 },
      { name: "Family", description: "Family moments", isActive: true, order: 4 },
    ];

    const categoryIds: Record<string, Id<"themeCategories">> = {};
    for (const category of themeCategories) {
      const id = await ctx.db.insert("themeCategories", category);
      categoryIds[category.name] = id;
    }

    // Seed themes
    const themes = [
      // Wedding themes
      { categoryId: categoryIds["Weddings"], name: "Classic Romance", coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop", isActive: true, order: 1 },
      { categoryId: categoryIds["Weddings"], name: "Garden Wedding", coverImageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop", isActive: true, order: 2 },
      { categoryId: categoryIds["Weddings"], name: "Beach Wedding", coverImageUrl: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=400&h=400&fit=crop", isActive: true, order: 3 },
      // Travel themes
      { categoryId: categoryIds["Travel"], name: "Paris", coverImageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=400&fit=crop", isActive: true, order: 1 },
      { categoryId: categoryIds["Travel"], name: "Bangkok", coverImageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=400&fit=crop", isActive: true, order: 2 },
      { categoryId: categoryIds["Travel"], name: "Tokyo", coverImageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop", isActive: true, order: 3 },
      { categoryId: categoryIds["Travel"], name: "New York", coverImageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=400&fit=crop", isActive: true, order: 4 },
      // Birthday themes
      { categoryId: categoryIds["Birthdays"], name: "Kids Party", coverImageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop", isActive: true, order: 1 },
      { categoryId: categoryIds["Birthdays"], name: "Elegant Celebration", coverImageUrl: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400&h=400&fit=crop", isActive: true, order: 2 },
      // Family themes
      { categoryId: categoryIds["Family"], name: "Family Reunion", coverImageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop", isActive: true, order: 1 },
      { categoryId: categoryIds["Family"], name: "Baby's First Year", coverImageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop", isActive: true, order: 2 },
    ];

    for (const theme of themes) {
      await ctx.db.insert("themes", theme);
    }

    return { message: "Initial data seeded successfully" };
  },
});

// Clear all data (for development purposes)
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all photo books and related data
    const photoBooks = await ctx.db.query("photoBooks").collect();
    for (const book of photoBooks) {
      await ctx.db.delete(book._id);
    }

    const uploadedPhotos = await ctx.db.query("uploadedPhotos").collect();
    for (const photo of uploadedPhotos) {
      try {
        await ctx.storage.delete(photo.storageId);
      } catch {
        // Ignore storage deletion errors
      }
      await ctx.db.delete(photo._id);
    }

    // Delete config data
    const bookTypes = await ctx.db.query("bookTypes").collect();
    for (const item of bookTypes) {
      await ctx.db.delete(item._id);
    }

    const pageOptions = await ctx.db.query("pageOptions").collect();
    for (const item of pageOptions) {
      await ctx.db.delete(item._id);
    }

    const themeCategories = await ctx.db.query("themeCategories").collect();
    for (const item of themeCategories) {
      await ctx.db.delete(item._id);
    }

    const themes = await ctx.db.query("themes").collect();
    for (const item of themes) {
      await ctx.db.delete(item._id);
    }

    return { message: "All data cleared" };
  },
});
