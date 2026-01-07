import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useAdminStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Loader2,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Palette,
  FileText,
  ToggleLeft,
  ToggleRight,
  Home,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

type Tab = "bookTypes" | "pageOptions" | "themeCategories" | "themes";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, adminEmail, logout, loadFromStorage } =
    useAdminStore();
  const [activeTab, setActiveTab] = useState<Tab>("bookTypes");
  const [isLoading, setIsLoading] = useState(false);

  // Memoize loadFromStorage
  const memoizedLoadFromStorage = useCallback(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Load auth from storage on mount
  useEffect(() => {
    memoizedLoadFromStorage();
  }, [memoizedLoadFromStorage]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  // Book Types
  const bookTypes = useQuery(api.bookTypes.listAll);
  const createBookType = useMutation(api.bookTypes.create);
  const updateBookType = useMutation(api.bookTypes.update);
  const deleteBookType = useMutation(api.bookTypes.remove);
  const toggleBookTypeActive = useMutation(api.bookTypes.toggleActive);

  // Page Options
  const pageOptions = useQuery(api.pageOptions.listAll);
  const createPageOption = useMutation(api.pageOptions.create);
  const updatePageOption = useMutation(api.pageOptions.update);
  const deletePageOption = useMutation(api.pageOptions.remove);
  const togglePageOptionActive = useMutation(api.pageOptions.toggleActive);

  // Theme Categories
  const themeCategories = useQuery(api.themeCategories.listAll);
  const createThemeCategory = useMutation(api.themeCategories.create);
  const updateThemeCategory = useMutation(api.themeCategories.update);
  const deleteThemeCategory = useMutation(api.themeCategories.remove);
  const toggleThemeCategoryActive = useMutation(api.themeCategories.toggleActive);

  // Themes
  const themes = useQuery(api.themes.listAll);
  const createTheme = useMutation(api.themes.create);
  const updateTheme = useMutation(api.themes.update);
  const deleteTheme = useMutation(api.themes.remove);
  const toggleThemeActive = useMutation(api.themes.toggleActive);

  // Seed data
  const seedData = useMutation(api.seed.seedInitialData);

  // Dialog states
  const [showBookTypeDialog, setShowBookTypeDialog] = useState(false);
  const [showPageOptionDialog, setShowPageOptionDialog] = useState(false);
  const [showThemeCategoryDialog, setShowThemeCategoryDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [bookTypeForm, setBookTypeForm] = useState({
    name: "",
    aspectRatio: "3:4",
    description: "",
    price: 0,
    imageUrl: "",
    isActive: true,
    order: 1,
  });

  const [pageOptionForm, setPageOptionForm] = useState({
    pageCount: 50,
    additionalPrice: 0,
    isActive: true,
    order: 1,
  });

  const [themeCategoryForm, setThemeCategoryForm] = useState({
    name: "",
    description: "",
    isActive: true,
    order: 1,
  });

  const [themeForm, setThemeForm] = useState({
    categoryId: "" as string,
    name: "",
    coverImageUrl: "",
    isActive: true,
    order: 1,
  });

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      await seedData();
    } catch (error) {
      console.error("Failed to seed data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Book Type handlers
  const openBookTypeDialog = (bookType?: NonNullable<typeof bookTypes>[0]) => {
    if (bookType) {
      setEditingId(bookType._id);
      setBookTypeForm({
        name: bookType.name,
        aspectRatio: bookType.aspectRatio,
        description: bookType.description || "",
        price: bookType.price,
        imageUrl: bookType.imageUrl,
        isActive: bookType.isActive,
        order: bookType.order,
      });
    } else {
      setEditingId(null);
      setBookTypeForm({
        name: "",
        aspectRatio: "3:4",
        description: "",
        price: 0,
        imageUrl: "",
        isActive: true,
        order: (bookTypes?.length || 0) + 1,
      });
    }
    setShowBookTypeDialog(true);
  };

  const saveBookType = async () => {
    setIsLoading(true);
    try {
      if (editingId) {
        await updateBookType({
          id: editingId as Id<"bookTypes">,
          ...bookTypeForm,
        });
      } else {
        await createBookType(bookTypeForm);
      }
      setShowBookTypeDialog(false);
    } catch (error) {
      console.error("Failed to save book type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBookType = async (id: Id<"bookTypes">) => {
    if (confirm("Are you sure you want to delete this book type?")) {
      await deleteBookType({ id });
    }
  };

  // Page Option handlers
  const openPageOptionDialog = (
    pageOption?: NonNullable<typeof pageOptions>[0],
  ) => {
    if (pageOption) {
      setEditingId(pageOption._id);
      setPageOptionForm({
        pageCount: pageOption.pageCount,
        additionalPrice: pageOption.additionalPrice,
        isActive: pageOption.isActive,
        order: pageOption.order,
      });
    } else {
      setEditingId(null);
      setPageOptionForm({
        pageCount: 50,
        additionalPrice: 0,
        isActive: true,
        order: (pageOptions?.length || 0) + 1,
      });
    }
    setShowPageOptionDialog(true);
  };

  const savePageOption = async () => {
    setIsLoading(true);
    try {
      if (editingId) {
        await updatePageOption({
          id: editingId as Id<"pageOptions">,
          ...pageOptionForm,
        });
      } else {
        await createPageOption(pageOptionForm);
      }
      setShowPageOptionDialog(false);
    } catch (error) {
      console.error("Failed to save page option:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePageOption = async (id: Id<"pageOptions">) => {
    if (confirm("Are you sure you want to delete this page option?")) {
      await deletePageOption({ id });
    }
  };

  // Theme Category handlers
  const openThemeCategoryDialog = (
    category?: NonNullable<typeof themeCategories>[0],
  ) => {
    if (category) {
      setEditingId(category._id);
      setThemeCategoryForm({
        name: category.name,
        description: category.description || "",
        isActive: category.isActive,
        order: category.order,
      });
    } else {
      setEditingId(null);
      setThemeCategoryForm({
        name: "",
        description: "",
        isActive: true,
        order: (themeCategories?.length || 0) + 1,
      });
    }
    setShowThemeCategoryDialog(true);
  };

  const saveThemeCategory = async () => {
    setIsLoading(true);
    try {
      if (editingId) {
        await updateThemeCategory({
          id: editingId as Id<"themeCategories">,
          ...themeCategoryForm,
        });
      } else {
        await createThemeCategory(themeCategoryForm);
      }
      setShowThemeCategoryDialog(false);
    } catch (error) {
      console.error("Failed to save theme category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteThemeCategory = async (id: Id<"themeCategories">) => {
    if (confirm("Are you sure you want to delete this theme category? This will also affect all themes in this category.")) {
      await deleteThemeCategory({ id });
    }
  };

  // Theme handlers
  const openThemeDialog = (theme?: NonNullable<typeof themes>[0]) => {
    if (theme) {
      setEditingId(theme._id);
      setThemeForm({
        categoryId: theme.categoryId,
        name: theme.name,
        coverImageUrl: theme.coverImageUrl,
        isActive: theme.isActive,
        order: theme.order,
      });
    } else {
      setEditingId(null);
      setThemeForm({
        categoryId: themeCategories?.[0]?._id || "",
        name: "",
        coverImageUrl: "",
        isActive: true,
        order: (themes?.length || 0) + 1,
      });
    }
    setShowThemeDialog(true);
  };

  const saveTheme = async () => {
    if (!themeForm.categoryId) {
      alert("Please select a category");
      return;
    }
    setIsLoading(true);
    try {
      if (editingId) {
        await updateTheme({
          id: editingId as Id<"themes">,
          categoryId: themeForm.categoryId as Id<"themeCategories">,
          name: themeForm.name,
          coverImageUrl: themeForm.coverImageUrl,
          isActive: themeForm.isActive,
          order: themeForm.order,
        });
      } else {
        await createTheme({
          categoryId: themeForm.categoryId as Id<"themeCategories">,
          name: themeForm.name,
          coverImageUrl: themeForm.coverImageUrl,
          isActive: themeForm.isActive,
          order: themeForm.order,
        });
      }
      setShowThemeDialog(false);
    } catch (error) {
      console.error("Failed to save theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTheme = async (id: Id<"themes">) => {
    if (confirm("Are you sure you want to delete this theme?")) {
      await deleteTheme({ id });
    }
  };

  // Get category name helper
  const getCategoryName = (categoryId: Id<"themeCategories">) => {
    return themeCategories?.find((c) => c._id === categoryId)?.name || "Unknown";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">{adminEmail}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Store
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Quick Actions */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleSeedData}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Seed Sample Data
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              variant={activeTab === "bookTypes" ? "default" : "outline"}
              onClick={() => setActiveTab("bookTypes")}
              className="whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Book Types
            </Button>
            <Button
              variant={activeTab === "pageOptions" ? "default" : "outline"}
              onClick={() => setActiveTab("pageOptions")}
              className="whitespace-nowrap"
            >
              <FileText className="w-4 h-4 mr-2" />
              Page Options
            </Button>
            <Button
              variant={activeTab === "themeCategories" ? "default" : "outline"}
              onClick={() => setActiveTab("themeCategories")}
              className="whitespace-nowrap"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Theme Categories
            </Button>
            <Button
              variant={activeTab === "themes" ? "default" : "outline"}
              onClick={() => setActiveTab("themes")}
              className="whitespace-nowrap"
            >
              <Palette className="w-4 h-4 mr-2" />
              Themes
            </Button>
          </div>

          {/* Book Types Tab */}
          {activeTab === "bookTypes" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Book Types</h2>
                <Button onClick={() => openBookTypeDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Book Type
                </Button>
              </div>

              {bookTypes === undefined ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : bookTypes.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No book types yet. Add your first one!
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {bookTypes.map((bookType) => (
                    <Card key={bookType._id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={bookType.imageUrl}
                          alt={bookType.name}
                          className="w-full h-full object-cover"
                        />
                        {!bookType.isActive && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-medium">
                              Inactive
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{bookType.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {bookType.aspectRatio} • ฿
                              {bookType.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                toggleBookTypeActive({ id: bookType._id })
                              }
                            >
                              {bookType.isActive ? (
                                <ToggleRight className="w-4 h-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openBookTypeDialog(bookType)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBookType(bookType._id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Page Options Tab */}
          {activeTab === "pageOptions" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Page Options</h2>
                <Button onClick={() => openPageOptionDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Page Option
                </Button>
              </div>

              {pageOptions === undefined ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : pageOptions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No page options yet. Add your first one!
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pageOptions.map((pageOption) => (
                    <Card key={pageOption._id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {pageOption.pageCount} Pages
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {pageOption.additionalPrice > 0
                              ? `+฿${pageOption.additionalPrice.toFixed(2)}`
                              : "Base option"}
                          </p>
                          <span
                            className={cn(
                              "inline-block mt-2 text-xs px-2 py-1 rounded-full",
                              pageOption.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600",
                            )}
                          >
                            {pageOption.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              togglePageOptionActive({ id: pageOption._id })
                            }
                          >
                            {pageOption.isActive ? (
                              <ToggleRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPageOptionDialog(pageOption)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeletePageOption(pageOption._id)
                            }
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme Categories Tab */}
          {activeTab === "themeCategories" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Theme Categories</h2>
                <Button onClick={() => openThemeCategoryDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>

              {themeCategories === undefined ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : themeCategories.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No theme categories yet. Add categories like "Weddings", "Travel", "Birthdays".
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {themeCategories.map((category) => (
                    <Card key={category._id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          )}
                          <span
                            className={cn(
                              "inline-block mt-2 text-xs px-2 py-1 rounded-full",
                              category.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600",
                            )}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toggleThemeCategoryActive({ id: category._id })
                            }
                          >
                            {category.isActive ? (
                              <ToggleRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openThemeCategoryDialog(category)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteThemeCategory(category._id)
                            }
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Themes Tab */}
          {activeTab === "themes" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Themes</h2>
                <Button onClick={() => openThemeDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Theme
                </Button>
              </div>

              {themes === undefined ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : themes.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No themes yet. First create categories, then add themes like "Paris", "Bangkok" under "Travel".
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {themes.map((theme) => (
                    <Card key={theme._id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={theme.coverImageUrl}
                          alt={theme.name}
                          className="w-full h-full object-cover"
                        />
                        {!theme.isActive && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              Inactive
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <div className="flex flex-col gap-1">
                          <h3 className="font-medium text-sm truncate">
                            {theme.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {getCategoryName(theme.categoryId)}
                          </p>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              toggleThemeActive({ id: theme._id })
                            }
                          >
                            {theme.isActive ? (
                              <ToggleRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openThemeDialog(theme)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleDeleteTheme(theme._id)
                            }
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Book Type Dialog */}
      <Dialog open={showBookTypeDialog} onOpenChange={setShowBookTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Book Type" : "Add Book Type"}
            </DialogTitle>
            <DialogDescription>
              Configure the book type settings below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookTypeName">Name</Label>
              <Input
                id="bookTypeName"
                value={bookTypeForm.name}
                onChange={(e) =>
                  setBookTypeForm({ ...bookTypeForm, name: e.target.value })
                }
                placeholder="e.g., Portrait Photobook"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                <Input
                  id="aspectRatio"
                  value={bookTypeForm.aspectRatio}
                  onChange={(e) =>
                    setBookTypeForm({
                      ...bookTypeForm,
                      aspectRatio: e.target.value,
                    })
                  }
                  placeholder="e.g., 3:4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (฿)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={bookTypeForm.price}
                  onChange={(e) =>
                    setBookTypeForm({
                      ...bookTypeForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={bookTypeForm.description}
                onChange={(e) =>
                  setBookTypeForm({ ...bookTypeForm, description: e.target.value })
                }
                placeholder="e.g., Perfect for portraits"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={bookTypeForm.imageUrl}
                onChange={(e) =>
                  setBookTypeForm({ ...bookTypeForm, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={bookTypeForm.order}
                onChange={(e) =>
                  setBookTypeForm({
                    ...bookTypeForm,
                    order: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookTypeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveBookType} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Option Dialog */}
      <Dialog
        open={showPageOptionDialog}
        onOpenChange={setShowPageOptionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Page Option" : "Add Page Option"}
            </DialogTitle>
            <DialogDescription>
              Configure the page option settings below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pageCount">Page Count</Label>
              <Input
                id="pageCount"
                type="number"
                value={pageOptionForm.pageCount}
                onChange={(e) =>
                  setPageOptionForm({
                    ...pageOptionForm,
                    pageCount: parseInt(e.target.value) || 50,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalPrice">Additional Price (฿)</Label>
              <Input
                id="additionalPrice"
                type="number"
                step="0.01"
                value={pageOptionForm.additionalPrice}
                onChange={(e) =>
                  setPageOptionForm({
                    ...pageOptionForm,
                    additionalPrice: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageOptionOrder">Display Order</Label>
              <Input
                id="pageOptionOrder"
                type="number"
                value={pageOptionForm.order}
                onChange={(e) =>
                  setPageOptionForm({
                    ...pageOptionForm,
                    order: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPageOptionDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={savePageOption} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Theme Category Dialog */}
      <Dialog
        open={showThemeCategoryDialog}
        onOpenChange={setShowThemeCategoryDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Theme Category" : "Add Theme Category"}
            </DialogTitle>
            <DialogDescription>
              Categories group themes together (e.g., Weddings, Travel, Birthdays).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Name</Label>
              <Input
                id="categoryName"
                value={themeCategoryForm.name}
                onChange={(e) =>
                  setThemeCategoryForm({ ...themeCategoryForm, name: e.target.value })
                }
                placeholder="e.g., Travel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description</Label>
              <Input
                id="categoryDescription"
                value={themeCategoryForm.description}
                onChange={(e) =>
                  setThemeCategoryForm({
                    ...themeCategoryForm,
                    description: e.target.value,
                  })
                }
                placeholder="e.g., Capture your adventures"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryOrder">Display Order</Label>
              <Input
                id="categoryOrder"
                type="number"
                value={themeCategoryForm.order}
                onChange={(e) =>
                  setThemeCategoryForm({
                    ...themeCategoryForm,
                    order: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowThemeCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveThemeCategory} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Theme Dialog */}
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Theme" : "Add Theme"}
            </DialogTitle>
            <DialogDescription>
              Themes have pre-designed covers (e.g., Paris, Bangkok under Travel).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="themeCategory">Category</Label>
              <Select
                value={themeForm.categoryId}
                onValueChange={(value) =>
                  setThemeForm({ ...themeForm, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {themeCategories?.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="themeName">Name</Label>
              <Input
                id="themeName"
                value={themeForm.name}
                onChange={(e) =>
                  setThemeForm({ ...themeForm, name: e.target.value })
                }
                placeholder="e.g., Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover Image URL</Label>
              <Input
                id="coverImageUrl"
                value={themeForm.coverImageUrl}
                onChange={(e) =>
                  setThemeForm({ ...themeForm, coverImageUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="themeOrder">Display Order</Label>
              <Input
                id="themeOrder"
                type="number"
                value={themeForm.order}
                onChange={(e) =>
                  setThemeForm({
                    ...themeForm,
                    order: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowThemeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveTheme} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
