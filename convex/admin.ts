import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Simple hash function for demo purposes
// In production, use proper bcrypt or similar
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// Check if any admin exists
export const hasAdmin = query({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db.query("admins").first();
    return admin !== null;
  },
});

// Create the first admin (only works if no admin exists)
export const createFirstAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if any admin already exists
    const existingAdmin = await ctx.db.query("admins").first();
    if (existingAdmin) {
      throw new Error("An admin already exists. Please log in instead.");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Validate password length
    if (args.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const passwordHash = simpleHash(args.password);

    const id = await ctx.db.insert("admins", {
      email: args.email.toLowerCase(),
      passwordHash,
    });

    return { id, email: args.email.toLowerCase() };
  },
});

// Login admin
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!admin) {
      throw new Error("Invalid email or password");
    }

    const passwordHash = simpleHash(args.password);
    if (admin.passwordHash !== passwordHash) {
      throw new Error("Invalid email or password");
    }

    // Return admin info (we'll use localStorage for session on client)
    return {
      id: admin._id,
      email: admin.email,
      // In production, you'd return a JWT or session token
      token: `${admin._id}_${Date.now()}`,
    };
  },
});

// Verify admin session (for checking if logged in)
export const verifySession = query({
  args: { adminId: v.optional(v.id("admins")) },
  handler: async (ctx, args) => {
    if (!args.adminId) {
      return null;
    }

    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      return null;
    }

    return {
      id: admin._id,
      email: admin.email,
    };
  },
});

// Change admin password
export const changePassword = mutation({
  args: {
    adminId: v.id("admins"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    const currentPasswordHash = simpleHash(args.currentPassword);
    if (admin.passwordHash !== currentPasswordHash) {
      throw new Error("Current password is incorrect");
    }

    if (args.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    const newPasswordHash = simpleHash(args.newPassword);
    await ctx.db.patch(args.adminId, { passwordHash: newPasswordHash });

    return { success: true };
  },
});

// Get admin by ID
export const getById = query({
  args: { id: v.id("admins") },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.id);
    if (!admin) {
      return null;
    }
    return {
      id: admin._id,
      email: admin.email,
    };
  },
});
