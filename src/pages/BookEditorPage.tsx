import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrderStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Grid3X3,
  Square,
  Type,
  Palette,
  Check,
  Trash2,
  Save,
  Loader2,
  Copy,
  Share2,
  ImagePlus,
  Images,
  X,
  Plus,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";

interface PagePhoto {
  storageId: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface PageText {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
}

interface Page {
  pageNumber: number;
  layout: string;
  backgroundColor: string;
  photos: PagePhoto[];
  texts: PageText[];
}

interface UploadedPhoto {
  storageId: string;
  url: string;
  fileName: string;
}

const LAYOUT_OPTIONS = [
  { id: "1", icon: Square, label: "1 Photo", cols: 1, rows: 1 },
  { id: "2", icon: Grid2X2, label: "2 Photos", cols: 2, rows: 1 },
  { id: "3", icon: Grid2X2, label: "3 Photos", cols: 3, rows: 1 },
  { id: "4", icon: Grid2X2, label: "4 Photos", cols: 2, rows: 2 },
  { id: "6", icon: Grid3X3, label: "6 Photos", cols: 3, rows: 2 },
];

const COLOR_OPTIONS = [
  "#ffffff",
  "#f5f0e8",
  "#e8e4dc",
  "#f5f5f5",
  "#e5e5e5",
  "#fef3c7",
  "#dbeafe",
  "#dcfce7",
  "#fce7f3",
  "#1a1a1a",
];

// Layout grid configurations for Instagram-style photo placement
const getLayoutGrid = (layoutId: string) => {
  switch (layoutId) {
    case "1":
      return [{ x: 0, y: 0, width: 100, height: 100 }];
    case "2":
      return [
        { x: 0, y: 0, width: 50, height: 100 },
        { x: 50, y: 0, width: 50, height: 100 },
      ];
    case "3":
      return [
        { x: 0, y: 0, width: 33.33, height: 100 },
        { x: 33.33, y: 0, width: 33.33, height: 100 },
        { x: 66.66, y: 0, width: 33.34, height: 100 },
      ];
    case "4":
      return [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 50, y: 0, width: 50, height: 50 },
        { x: 0, y: 50, width: 50, height: 50 },
        { x: 50, y: 50, width: 50, height: 50 },
      ];
    case "6":
      return [
        { x: 0, y: 0, width: 33.33, height: 50 },
        { x: 33.33, y: 0, width: 33.33, height: 50 },
        { x: 66.66, y: 0, width: 33.34, height: 50 },
        { x: 0, y: 50, width: 33.33, height: 50 },
        { x: 33.33, y: 50, width: 33.33, height: 50 },
        { x: 66.66, y: 50, width: 33.34, height: 50 },
      ];
    default:
      return [{ x: 0, y: 0, width: 100, height: 100 }];
  }
};

export function BookEditorPage() {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pages, setPages] = useState<Page[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"layout" | "color" | "text" | "gallery" | null>(null);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [pagesInitialized, setPagesInitialized] = useState(false);

  const { photoBookId, uploadedPhotos, setShareId, prevStep, addUploadedPhoto } = useOrderStore();

  const photoBook = useQuery(
    api.photoBooks.getById,
    photoBookId ? { id: photoBookId } : "skip",
  );

  const updatePages = useMutation(api.photoBooks.updatePages);
  const completeBook = useMutation(api.photoBooks.complete);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveUploadedPhoto = useMutation(api.files.saveUploadedPhoto);

  // Initialize pages from photoBook data with auto photo placement
  useEffect(() => {
    if (photoBook && !pagesInitialized) {
      // Auto-arrange photos: one photo per page, full screen
      const initialPages: Page[] = photoBook.pages.map((page, index) => {
        const photo = uploadedPhotos[index];
        return {
          pageNumber: page.pageNumber,
          layout: "1",
          backgroundColor: "#ffffff",
          photos: photo
            ? [
                {
                  storageId: photo.storageId,
                  url: photo.url,
                  x: 0,
                  y: 0,
                  width: 100,
                  height: 100,
                  rotation: 0,
                },
              ]
            : [],
          texts: [],
        };
      });
      setPages(initialPages);
      setPagesInitialized(true);
    }
  }, [photoBook, uploadedPhotos, pagesInitialized]);

  const currentPage = pages[currentPageIndex];

  // Get aspect ratio
  const aspectRatio = photoBook?.bookType?.aspectRatio || "3:4";
  const [ratioW, ratioH] = aspectRatio.split(":").map(Number);
  const aspectRatioValue = ratioW / ratioH;

  const handleLayoutChange = (layoutId: string) => {
    if (!currentPage) return;

    const grid = getLayoutGrid(layoutId);
    const photoCount = grid.length;
    const existingPhotos = [...currentPage.photos];

    // Create new photos array based on layout
    const newPhotos: PagePhoto[] = [];
    for (let i = 0; i < photoCount; i++) {
      const slot = grid[i];
      if (existingPhotos[i]) {
        newPhotos.push({
          ...existingPhotos[i],
          x: slot.x,
          y: slot.y,
          width: slot.width,
          height: slot.height,
        });
      }
    }

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      layout: layoutId,
      photos: newPhotos,
    };
    setPages(updatedPages);
  };

  const handleColorChange = (color: string) => {
    if (!currentPage) return;

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      backgroundColor: color,
    };
    setPages(updatedPages);
  };

  const handleAddText = () => {
    if (!currentPage) return;

    const newText: PageText = {
      id: uuidv4(),
      content: "Double click to edit",
      x: 10,
      y: 10,
      fontSize: 16,
      fontFamily: "serif",
      color: "#000000",
      rotation: 0,
    };

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      texts: [...currentPage.texts, newText],
    };
    setPages(updatedPages);
    setSelectedTextId(newText.id);
  };

  const handleDeleteText = (textId: string) => {
    if (!currentPage) return;

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      texts: currentPage.texts.filter((t) => t.id !== textId),
    };
    setPages(updatedPages);
    setSelectedTextId(null);
  };

  const handleTextChange = (textId: string, content: string) => {
    if (!currentPage) return;

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      texts: currentPage.texts.map((t) =>
        t.id === textId ? { ...t, content } : t,
      ),
    };
    setPages(updatedPages);
  };

  // Open photo selector for a specific slot
  const openPhotoSelector = (slotIndex: number) => {
    setSelectedSlotIndex(slotIndex);
    setShowPhotoSelector(true);
  };

  // Select photo for a slot
  const selectPhotoForSlot = (photo: UploadedPhoto) => {
    if (!currentPage || selectedSlotIndex === null) return;

    const grid = getLayoutGrid(currentPage.layout);
    const slot = grid[selectedSlotIndex];

    const newPhoto: PagePhoto = {
      storageId: photo.storageId,
      url: photo.url,
      x: slot.x,
      y: slot.y,
      width: slot.width,
      height: slot.height,
      rotation: 0,
    };

    const updatedPhotos = [...currentPage.photos];
    updatedPhotos[selectedSlotIndex] = newPhoto;

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      photos: updatedPhotos,
    };
    setPages(updatedPages);
    setShowPhotoSelector(false);
    setSelectedSlotIndex(null);
  };

  // Remove photo from slot
  const removePhotoFromSlot = (slotIndex: number) => {
    if (!currentPage) return;

    const updatedPhotos = currentPage.photos.filter((_, i) => i !== slotIndex);

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      photos: updatedPhotos,
    };
    setPages(updatedPages);
  };

  // Handle file upload from gallery
  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (!photoBookId) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const uploadUrl = await generateUploadUrl();
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!response.ok) throw new Error("Upload failed");

          const { storageId } = await response.json();
          const result = await saveUploadedPhoto({
            storageId,
            fileName: file.name,
            photoBookId,
          });

          if (result.url) {
            addUploadedPhoto({
              storageId,
              url: result.url,
              fileName: file.name,
            });
          }
        } catch (error) {
          console.error("Failed to upload:", error);
        }
      }
    },
    [photoBookId, generateUploadUrl, saveUploadedPhoto, addUploadedPhoto],
  );

  const handleSave = async () => {
    if (!photoBookId || pages.length === 0) return;

    setIsSaving(true);
    try {
      await updatePages({ id: photoBookId, pages });
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!photoBookId) return;

    setIsSaving(true);
    try {
      await updatePages({ id: photoBookId, pages });
      const shareId = await completeBook({ id: photoBookId });
      setShareId(shareId);
      setShareLink(`${window.location.origin}/view/${shareId}`);
      setShowCompleteDialog(true);
    } catch (error) {
      console.error("Failed to complete:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const nextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const togglePanel = (panel: "layout" | "color" | "text" | "gallery") => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  if (!photoBook) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get layout grid for current page
  const currentLayoutGrid = currentPage ? getLayoutGrid(currentPage.layout) : [];

  return (
    <div className="min-h-screen bg-beige flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-serif font-bold text-foreground">
            Edit Your Book
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPageIndex + 1} of {pages.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-32">
        <div className="max-w-lg mx-auto">
          {/* Theme Cover Preview */}
          {photoBook.theme && (
            <div className="mb-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Theme: {photoBook.theme.name}
              </p>
            </div>
          )}

          {/* Page Canvas */}
          <Card className="overflow-hidden shadow-lg">
            <div
              className="relative"
              style={{
                aspectRatio: aspectRatioValue,
                backgroundColor: currentPage?.backgroundColor || "#ffffff",
              }}
            >
              {/* Photo Slots (Instagram-style grid) */}
              {currentLayoutGrid.map((slot, index) => {
                const photo = currentPage?.photos[index];
                return (
                  <div
                    key={index}
                    className="absolute overflow-hidden cursor-pointer group"
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      width: `${slot.width}%`,
                      height: `${slot.height}%`,
                    }}
                    onClick={() => openPhotoSelector(index)}
                  >
                    {photo ? (
                      <>
                        <img
                          src={photo.url}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPhotoSelector(index);
                              }}
                            >
                              <ImagePlus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePhotoFromSlot(index);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted/50 border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2">
                        <Plus className="w-8 h-8 text-muted-foreground/50" />
                        <span className="text-xs text-muted-foreground">Add Photo</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Text Elements */}
              {currentPage?.texts.map((text) => (
                <div
                  key={text.id}
                  className={cn(
                    "absolute cursor-move p-2 rounded",
                    selectedTextId === text.id && "ring-2 ring-primary",
                  )}
                  style={{
                    left: `${text.x}%`,
                    top: `${text.y}%`,
                    fontSize: `${text.fontSize}px`,
                    fontFamily: text.fontFamily,
                    color: text.color,
                    transform: `rotate(${text.rotation}deg)`,
                  }}
                  onClick={() => setSelectedTextId(text.id)}
                >
                  <input
                    type="text"
                    value={text.content}
                    onChange={(e) => handleTextChange(text.id, e.target.value)}
                    className="bg-transparent border-none outline-none w-full"
                    style={{ color: text.color }}
                  />
                  {selectedTextId === text.id && (
                    <button
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                      onClick={() => handleDeleteText(text.id)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Page Navigation */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPageIndex + 1} / {pages.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={currentPageIndex === pages.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Tool Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant={activePanel === "layout" ? "default" : "outline"}
              size="sm"
              onClick={() => togglePanel("layout")}
            >
              <Grid2X2 className="w-4 h-4 mr-1" />
              Layout
            </Button>
            <Button
              variant={activePanel === "color" ? "default" : "outline"}
              size="sm"
              onClick={() => togglePanel("color")}
            >
              <Palette className="w-4 h-4 mr-1" />
              Color
            </Button>
            <Button
              variant={activePanel === "text" ? "default" : "outline"}
              size="sm"
              onClick={() => togglePanel("text")}
            >
              <Type className="w-4 h-4 mr-1" />
              Text
            </Button>
            <Button
              variant={activePanel === "gallery" ? "default" : "outline"}
              size="sm"
              onClick={() => togglePanel("gallery")}
            >
              <Images className="w-4 h-4 mr-1" />
              Gallery
            </Button>
          </div>

          {/* Layout Panel */}
          {activePanel === "layout" && (
            <Card className="mt-4 p-4">
              <h4 className="font-medium text-foreground mb-3">Choose Layout</h4>
              <div className="grid grid-cols-5 gap-2">
                {LAYOUT_OPTIONS.map((layout) => {
                  const Icon = layout.icon;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => handleLayoutChange(layout.id)}
                      className={cn(
                        "p-3 rounded-md border transition-all flex flex-col items-center gap-1",
                        currentPage?.layout === layout.id
                          ? "border-primary bg-beige"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{layout.id}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Color Panel */}
          {activePanel === "color" && (
            <Card className="mt-4 p-4">
              <h4 className="font-medium text-foreground mb-3">Background Color</h4>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      "w-10 h-10 rounded-md border-2 transition-all flex items-center justify-center",
                      currentPage?.backgroundColor === color
                        ? "border-primary"
                        : "border-transparent",
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {currentPage?.backgroundColor === color && (
                      <Check
                        className={cn(
                          "w-4 h-4",
                          color === "#1a1a1a" ? "text-white" : "text-foreground",
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Text Panel */}
          {activePanel === "text" && (
            <Card className="mt-4 p-4">
              <h4 className="font-medium text-foreground mb-3">Add Text</h4>
              <Button onClick={handleAddText} className="w-full">
                <Type className="w-4 h-4 mr-2" />
                Add Text Box
              </Button>
            </Card>
          )}

          {/* Photo Gallery Panel */}
          {activePanel === "gallery" && (
            <Card className="mt-4 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">Your Photos</h4>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </span>
                  </Button>
                </label>
              </div>
              {uploadedPhotos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No photos uploaded yet
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {uploadedPhotos.map((photo) => (
                    <div
                      key={photo.storageId}
                      className="aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => {
                        // Add to current page if there's an empty slot
                        if (!currentPage) return;
                        const grid = getLayoutGrid(currentPage.layout);
                        const emptySlotIndex = grid.findIndex(
                          (_, i) => !currentPage.photos[i]
                        );
                        if (emptySlotIndex !== -1) {
                          setSelectedSlotIndex(emptySlotIndex);
                          selectPhotoForSlot(photo);
                        }
                      }}
                    >
                      <img
                        src={photo.url}
                        alt={photo.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Page Thumbnails */}
          <div className="mt-6">
            <h4 className="font-medium text-foreground mb-3">All Pages</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {pages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPageIndex(index)}
                  className={cn(
                    "shrink-0 w-16 rounded-md overflow-hidden border-2 transition-all",
                    index === currentPageIndex
                      ? "border-primary"
                      : "border-border",
                  )}
                  style={{ aspectRatio: aspectRatioValue }}
                >
                  <div
                    className="w-full h-full relative"
                    style={{ backgroundColor: page.backgroundColor }}
                  >
                    {page.photos[0] && (
                      <img
                        src={page.photos[0].url}
                        alt={`Page ${index + 1}`}
                        className="w-full h-full object-cover opacity-70"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium bg-white/80 px-1 rounded">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" className="h-12 px-6" onClick={prevStep}>
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <Button
            className="flex-1 h-12 text-base font-semibold"
            onClick={handleComplete}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Done
                <Check className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Photo Selector Dialog */}
      <Dialog open={showPhotoSelector} onOpenChange={setShowPhotoSelector}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Photo</DialogTitle>
            <DialogDescription>
              Choose a photo from your gallery or upload a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    await handleFileUpload(e.target.files);
                    // The newly uploaded photo will be available in uploadedPhotos
                  }
                }}
              />
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Photo
                </span>
              </Button>
            </label>
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {uploadedPhotos.map((photo) => (
                  <div
                    key={photo.storageId}
                    className="aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => selectPhotoForSlot(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Photobook is Ready!</DialogTitle>
            <DialogDescription>
              Share your beautiful photobook with friends and family.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className={cn(copied && "bg-green-100")}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  window.open(shareLink, "_blank");
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                View Book
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
