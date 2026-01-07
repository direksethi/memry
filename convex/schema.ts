import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Admin users table
  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
  }).index("by_email", ["email"]),

  // Book types/styles available for purchase
  bookTypes: defineTable({
    name: v.string(), // e.g., "Portrait", "Landscape", "Square"
    aspectRatio: v.string(), // e.g., "3:4", "4:3", "1:1"
    description: v.optional(v.string()), // Description shown to customers
    price: v.number(),
    imageUrl: v.string(),
    isActive: v.boolean(),
    order: v.number(), // For sorting display order
  }),

  // Page options (50 pages, 100 pages, etc.)
  pageOptions: defineTable({
    pageCount: v.number(),
    additionalPrice: v.number(), // Price added to base book price
    isActive: v.boolean(),
    order: v.number(),
  }),

  // Theme categories (e.g., Weddings, Birthdays, Travel)
  themeCategories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    order: v.number(),
  }),

  // Themes within categories (e.g., Paris, Bangkok under Travel)
  themes: defineTable({
    categoryId: v.id("themeCategories"),
    name: v.string(),
    coverImageUrl: v.string(), // Pre-designed cover image
    isActive: v.boolean(),
    order: v.number(),
  }).index("by_category", ["categoryId"]),

  // User photo book orders/projects
  photoBooks: defineTable({
    shareId: v.string(), // Unique ID for sharing
    bookTypeId: v.id("bookTypes"),
    pageOptionId: v.id("pageOptions"),
    themeId: v.optional(v.id("themes")), // New theme system
    coverDesignId: v.optional(v.string()), // Deprecated: kept for backward compatibility
    pages: v.array(
      v.object({
        pageNumber: v.number(),
        layout: v.string(), // "1", "2", "3", "4", "6" - number of photos
        backgroundColor: v.string(),
        photos: v.array(
          v.object({
            storageId: v.string(),
            url: v.string(),
            x: v.number(), // Position X (percentage)
            y: v.number(), // Position Y (percentage)
            width: v.number(), // Width (percentage)
            height: v.number(), // Height (percentage)
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
      })
    ),
    status: v.string(), // "draft", "completed", "ordered"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_shareId", ["shareId"]),

  // Uploaded photos storage reference
  uploadedPhotos: defineTable({
    photoBookId: v.id("photoBooks"),
    storageId: v.string(),
    url: v.string(),
    fileName: v.string(),
    uploadedAt: v.number(),
  }).index("by_photoBookId", ["photoBookId"]),
});
