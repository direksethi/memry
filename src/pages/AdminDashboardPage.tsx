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
import { cn } from "@/lib/utils";
import {
  Loader2,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Image,
  FileText,
  ToggleLeft,
  ToggleRight,
  Home,
  RefreshCw,
} from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

type Tab = "bookTypes" | "pageOptions" | "coverDesigns";

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

  // Cover Designs
  const coverDesigns = useQuery(api.coverDesigns.listAll);
  const createCoverDesign = useMutation(api.coverDesigns.create);
  const updateCoverDesign = useMutation(api.coverDesigns.update);
  const deleteCoverDesign = useMutation(api.coverDesigns.remove);
  const toggleCoverDesignActive = useMutation(api.coverDesigns.toggleActive);

  // Seed data
  const seedData = useMutation(api.seed.seedInitialData);

  // Dialog states
  const [showBookTypeDialog, setShowBookTypeDialog] = useState(false);
  const [showPageOptionDialog, setShowPageOptionDialog] = useState(false);
  const [showCoverDesignDialog, setShowCoverDesignDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [bookTypeForm, setBookTypeForm] = useState({
    name: "",
    aspectRatio: "3:4",
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

  const [coverDesignForm, setCoverDesignForm] = useState({
    name: "",
    imageUrl: "",
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

  // Cover Design handlers
  const openCoverDesignDialog = (
    coverDesign?: NonNullable<typeof coverDesigns>[0],
  ) => {
    if (coverDesign) {
      setEditingId(coverDesign._id);
      setCoverDesignForm({
        name: coverDesign.name,
        imageUrl: coverDesign.imageUrl,
        isActive: coverDesign.isActive,
        order: coverDesign.order,
      });
    } else {
      setEditingId(null);
      setCoverDesignForm({
        name: "",
        imageUrl: "",
        isActive: true,
        order: (coverDesigns?.length || 0) + 1,
      });
    }
    setShowCoverDesignDialog(true);
  };

  const saveCoverDesign = async () => {
    setIsLoading(true);
    try {
      if (editingId) {
        await updateCoverDesign({
          id: editingId as Id<"coverDesigns">,
          ...coverDesignForm,
        });
      } else {
        await createCoverDesign(coverDesignForm);
      }
      setShowCoverDesignDialog(false);
    } catch (error) {
      console.error("Failed to save cover design:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCoverDesign = async (id: Id<"coverDesigns">) => {
    if (confirm("Are you sure you want to delete this cover design?")) {
      await deleteCoverDesign({ id });
    }
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
              variant={activeTab === "coverDesigns" ? "default" : "outline"}
              onClick={() => setActiveTab("coverDesigns")}
              className="whitespace-nowrap"
            >
              <Image className="w-4 h-4 mr-2" />
              Cover Designs
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
                              {bookType.aspectRatio} • $
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
                              ? `+$${pageOption.additionalPrice.toFixed(2)}`
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

          {/* Cover Designs Tab */}
          {activeTab === "coverDesigns" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Cover Designs</h2>
                <Button onClick={() => openCoverDesignDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Cover Design
                </Button>
              </div>

              {coverDesigns === undefined ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : coverDesigns.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No cover designs yet. Add your first one!
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {coverDesigns.map((coverDesign) => (
                    <Card key={coverDesign._id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={coverDesign.imageUrl}
                          alt={coverDesign.name}
                          className="w-full h-full object-cover"
                        />
                        {!coverDesign.isActive && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              Inactive
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">
                            {coverDesign.name}
                          </h3>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                toggleCoverDesignActive({ id: coverDesign._id })
                              }
                            >
                              {coverDesign.isActive ? (
                                <ToggleRight className="w-4 h-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openCoverDesignDialog(coverDesign)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleDeleteCoverDesign(coverDesign._id)
                              }
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
                <Label htmlFor="price">Price ($)</Label>
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
              <Label htmlFor="additionalPrice">Additional Price ($)</Label>
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

      {/* Cover Design Dialog */}
      <Dialog
        open={showCoverDesignDialog}
        onOpenChange={setShowCoverDesignDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Cover Design" : "Add Cover Design"}
            </DialogTitle>
            <DialogDescription>
              Configure the cover design settings below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coverName">Name</Label>
              <Input
                id="coverName"
                value={coverDesignForm.name}
                onChange={(e) =>
                  setCoverDesignForm({
                    ...coverDesignForm,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Classic White"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Image URL</Label>
              <Input
                id="coverImageUrl"
                value={coverDesignForm.imageUrl}
                onChange={(e) =>
                  setCoverDesignForm({
                    ...coverDesignForm,
                    imageUrl: e.target.value,
                  })
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverOrder">Display Order</Label>
              <Input
                id="coverOrder"
                type="number"
                value={coverDesignForm.order}
                onChange={(e) =>
                  setCoverDesignForm({
                    ...coverDesignForm,
                    order: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCoverDesignDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveCoverDesign} disabled={isLoading}>
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
