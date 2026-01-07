import { mutation } from "./_generated/server";

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

    // Seed cover designs
    const coverDesigns = [
      {
        name: "Classic White",
        imageUrl: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=400&fit=crop",
        isActive: true,
        order: 1,
      },
      {
        name: "Elegant Black",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
        isActive: true,
        order: 2,
      },
      {
        name: "Natural Beige",
        imageUrl: "https://images.unsplash.com/photo-1518893494013-4edb2d6f5f25?w=400&h=400&fit=crop",
        isActive: true,
        order: 3,
      },
      {
        name: "Modern Gray",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
        isActive: true,
        order: 4,
      },
      {
        name: "Rustic Brown",
        imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=400&fit=crop",
        isActive: true,
        order: 5,
      },
      {
        name: "Minimalist Cream",
        imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=400&fit=crop",
        isActive: true,
        order: 6,
      },
    ];

    for (const coverDesign of coverDesigns) {
      await ctx.db.insert("coverDesigns", coverDesign);
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

    const coverDesigns = await ctx.db.query("coverDesigns").collect();
    for (const item of coverDesigns) {
      await ctx.db.delete(item._id);
    }

    return { message: "All data cleared" };
  },
});
