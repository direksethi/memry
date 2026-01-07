import { useState, useEffect } from "react";
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

export function BookEditorPage() {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pages, setPages] = useState<Page[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [showColorPanel, setShowColorPanel] = useState(false);
  const [showTextPanel, setShowTextPanel] = useState(false);

  const { photoBookId, uploadedPhotos, setShareId, prevStep } = useOrderStore();

  const photoBook = useQuery(
    api.photoBooks.getById,
    photoBookId ? { id: photoBookId } : "skip",
  );

  const updatePages = useMutation(api.photoBooks.updatePages);
  const completeBook = useMutation(api.photoBooks.complete);

  // Initialize pages from photoBook data
  const pagesLength = pages.length;
  useEffect(() => {
    if (photoBook && pagesLength === 0) {
      // Auto-arrange photos into pages
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
    }
  }, [photoBook, uploadedPhotos, pagesLength]);

  const currentPage = pages[currentPageIndex];

  const handleLayoutChange = (layoutId: string) => {
    if (!currentPage) return;

    const layout = LAYOUT_OPTIONS.find((l) => l.id === layoutId);
    if (!layout) return;

    const photoCount = parseInt(layoutId);
    const availablePhotos = [...currentPage.photos];

    // Fill with available uploaded photos if needed
    while (availablePhotos.length < photoCount) {
      const unusedPhoto = uploadedPhotos.find(
        (p) =>
          !availablePhotos.some((ap) => ap.storageId === p.storageId) &&
          !pages.some(
            (page, idx) =>
              idx !== currentPageIndex &&
              page.photos.some((pp) => pp.storageId === p.storageId),
          ),
      );
      if (unusedPhoto) {
        availablePhotos.push({
          storageId: unusedPhoto.storageId,
          url: unusedPhoto.url,
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          rotation: 0,
        });
      } else {
        break;
      }
    }

    // Trim if too many photos
    const photos = availablePhotos.slice(0, photoCount);

    // Arrange photos in grid
    const cols = layout.cols;
    const rows = layout.rows;
    const cellWidth = 100 / cols;
    const cellHeight = 100 / rows;

    const arrangedPhotos = photos.map((photo, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        ...photo,
        x: col * cellWidth,
        y: row * cellHeight,
        width: cellWidth,
        height: cellHeight,
      };
    });

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      layout: layoutId,
      photos: arrangedPhotos,
    };
    setPages(updatedPages);
    setShowLayoutPanel(false);
  };

  const handleColorChange = (color: string) => {
    if (!currentPage) return;

    const updatedPages = [...pages];
    updatedPages[currentPageIndex] = {
      ...currentPage,
      backgroundColor: color,
    };
    setPages(updatedPages);
    setShowColorPanel(false);
  };

  const handleAddText = () => {
    if (!currentPage) return;

    const newText: PageText = {
      id: uuidv4(),
      content: "Double tap to edit",
      x: 10,
      y: 10,
      fontSize: 16,
      fontFamily: "sans-serif",
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
    setShowTextPanel(false);
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

  const handleSave = async () => {
    if (!photoBookId || pages.length === 0) return;

    setIsSaving(true);
    try {
      await updatePages({
        id: photoBookId,
        pages: pages,
      });
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
      // Save pages first
      await updatePages({
        id: photoBookId,
        pages: pages,
      });

      // Mark as complete and get share ID
      const shareId = await completeBook({ id: photoBookId });
      setShareId(shareId);

      // Generate share link
      const link = `${window.location.origin}/view/${shareId}`;
      setShareLink(link);
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

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // Get aspect ratio from book type
  const aspectRatio = photoBook?.bookType?.aspectRatio || "3:4";
  const [ratioW, ratioH] = aspectRatio.split(":").map(Number);
  const aspectRatioValue = ratioW / ratioH;

  if (!photoBook || pages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-serif font-bold text-foreground">
            Edit Your Book
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
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
      <main className="flex-1 px-4 py-6 pb-40">
        <div className="max-w-lg mx-auto">
          {/* Page Counter */}
          <div className="text-center mb-4">
            <span className="text-sm text-muted-foreground">
              Page {currentPageIndex + 1} of {pages.length}
            </span>
          </div>

          {/* Page Preview */}
          <Card
            className="relative overflow-hidden mx-auto"
            style={{
              aspectRatio: aspectRatioValue,
              maxWidth: "100%",
              backgroundColor: currentPage?.backgroundColor || "#ffffff",
            }}
          >
            {/* Photos Layer */}
            {currentPage?.photos.map((photo, index) => (
              <div
                key={`${photo.storageId}-${index}`}
                className="absolute overflow-hidden"
                style={{
                  left: `${photo.x}%`,
                  top: `${photo.y}%`,
                  width: `${photo.width}%`,
                  height: `${photo.height}%`,
                  transform: `rotate(${photo.rotation}deg)`,
                }}
              >
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Text Layer */}
            {currentPage?.texts.map((text) => (
              <div
                key={text.id}
                className={cn(
                  "absolute cursor-move select-none",
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
                  className="bg-transparent border-none outline-none min-w-12.5"
                  style={{
                    fontSize: "inherit",
                    fontFamily: "inherit",
                    color: "inherit",
                  }}
                />
                {selectedTextId === text.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteText(text.id);
                    }}
                    className="absolute -top-6 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Empty state */}
            {currentPage?.photos.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No photos on this page</p>
              </div>
            )}
          </Card>

          {/* Page Navigation */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevPage}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-1">
              {pages
                .slice(
                  Math.max(0, currentPageIndex - 2),
                  Math.min(pages.length, currentPageIndex + 3),
                )
                .map((_, idx) => {
                  const actualIndex = Math.max(0, currentPageIndex - 2) + idx;
                  return (
                    <button
                      key={actualIndex}
                      onClick={() => setCurrentPageIndex(actualIndex)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        actualIndex === currentPageIndex
                          ? "bg-primary w-4"
                          : "bg-muted-foreground/30",
                      )}
                    />
                  );
                })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPageIndex === pages.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Edit Tools */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Button
              variant={showLayoutPanel ? "default" : "outline"}
              className="h-16 flex-col gap-1"
              onClick={() => {
                setShowLayoutPanel(!showLayoutPanel);
                setShowColorPanel(false);
                setShowTextPanel(false);
              }}
            >
              <Grid2X2 className="w-5 h-5" />
              <span className="text-xs">Layout</span>
            </Button>
            <Button
              variant={showColorPanel ? "default" : "outline"}
              className="h-16 flex-col gap-1"
              onClick={() => {
                setShowColorPanel(!showColorPanel);
                setShowLayoutPanel(false);
                setShowTextPanel(false);
              }}
            >
              <Palette className="w-5 h-5" />
              <span className="text-xs">Color</span>
            </Button>
            <Button
              variant={showTextPanel ? "default" : "outline"}
              className="h-16 flex-col gap-1"
              onClick={() => {
                setShowTextPanel(!showTextPanel);
                setShowLayoutPanel(false);
                setShowColorPanel(false);
              }}
            >
              <Type className="w-5 h-5" />
              <span className="text-xs">Text</span>
            </Button>
          </div>

          {/* Layout Panel */}
          {showLayoutPanel && (
            <Card className="mt-4 p-4">
              <h4 className="font-medium text-foreground mb-3">
                Choose Layout
              </h4>
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
          {showColorPanel && (
            <Card className="mt-4 p-4">
              <h4 className="font-medium text-foreground mb-3">
                Background Color
              </h4>
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
                          color === "#1a1a1a"
                            ? "text-white"
                            : "text-foreground",
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Text Panel */}
          {showTextPanel && (
            <Card className="mt-4 p-4">
              <h4 className="font-medium text-foreground mb-3">Add Text</h4>
              <Button onClick={handleAddText} className="w-full">
                <Type className="w-4 h-4 mr-2" />
                Add Text Box
              </Button>
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
