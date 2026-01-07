import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Generate upload URL for client-side uploads
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get file URL from storage ID
export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Save uploaded photo reference
export const saveUploadedPhoto = mutation({
  args: {
    photoBookId: v.id("photoBooks"),
    storageId: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the URL for the uploaded file
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Failed to get URL for uploaded file");
    }

    const id = await ctx.db.insert("uploadedPhotos", {
      photoBookId: args.photoBookId,
      storageId: args.storageId,
      url,
      fileName: args.fileName,
      uploadedAt: Date.now(),
    });

    return { id, url };
  },
});

// Get all photos for a photo book
export const getPhotosForBook = query({
  args: { photoBookId: v.id("photoBooks") },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("uploadedPhotos")
      .withIndex("by_photoBookId", (q) => q.eq("photoBookId", args.photoBookId))
      .collect();

    return photos.sort((a, b) => a.uploadedAt - b.uploadedAt);
  },
});

// Delete an uploaded photo
export const deletePhoto = mutation({
  args: { id: v.id("uploadedPhotos") },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.id);
    if (!photo) {
      throw new Error("Photo not found");
    }

    // Delete from storage
    await ctx.storage.delete(photo.storageId);

    // Delete from database
    await ctx.db.delete(args.id);
  },
});

// Delete all photos for a photo book
export const deletePhotosForBook = mutation({
  args: { photoBookId: v.id("photoBooks") },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("uploadedPhotos")
      .withIndex("by_photoBookId", (q) => q.eq("photoBookId", args.photoBookId))
      .collect();

    for (const photo of photos) {
      await ctx.storage.delete(photo.storageId);
      await ctx.db.delete(photo._id);
    }

    return photos.length;
  },
});

// Get multiple file URLs at once
export const getUrls = query({
  args: { storageIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const urls: Record<string, string | null> = {};
    for (const storageId of args.storageIds) {
      urls[storageId] = await ctx.storage.getUrl(storageId);
    }
    return urls;
  },
});
