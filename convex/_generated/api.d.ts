/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as bookTypes from "../bookTypes.js";
import type * as files from "../files.js";
import type * as pageOptions from "../pageOptions.js";
import type * as photoBooks from "../photoBooks.js";
import type * as seed from "../seed.js";
import type * as themeCategories from "../themeCategories.js";
import type * as themes from "../themes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  bookTypes: typeof bookTypes;
  files: typeof files;
  pageOptions: typeof pageOptions;
  photoBooks: typeof photoBooks;
  seed: typeof seed;
  themeCategories: typeof themeCategories;
  themes: typeof themes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
