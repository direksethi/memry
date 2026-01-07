import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrderStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  ImagePlus,
  Loader2,
} from "lucide-react";

export function PhotoUploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const {
    selectedBookTypeId,
    selectedPageOptionId,
    selectedCoverDesignId,
    photoBookId,
    setPhotoBookId,
    uploadedPhotos,
    addUploadedPhoto,
    removeUploadedPhoto,
    nextStep,
    prevStep,
  } = useOrderStore();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveUploadedPhoto = useMutation(api.files.saveUploadedPhoto);
  const createPhotoBook = useMutation(api.photoBooks.create);

  const selectedPageOption = useQuery(
    api.pageOptions.getById,
    selectedPageOptionId ? { id: selectedPageOptionId } : "skip",
  );

  const maxPhotos = selectedPageOption?.pageCount ?? 50;

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (uploadedPhotos.length + files.length > maxPhotos) {
        alert(`You can upload a maximum of ${maxPhotos} photos.`);
        return;
      }

      setIsUploading(true);
      setUploadProgress(`Uploading 0/${files.length}`);

      try {
        // Create photo book if not exists
        let bookId = photoBookId;
        if (!bookId) {
          if (
            !selectedBookTypeId ||
            !selectedPageOptionId ||
            !selectedCoverDesignId
          ) {
            throw new Error("Please complete all previous steps first");
          }

          const result = await createPhotoBook({
            bookTypeId: selectedBookTypeId,
            pageOptionId: selectedPageOptionId,
            coverDesignId: selectedCoverDesignId,
          });

          setPhotoBookId(result.id);
          bookId = result.id;
        }

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress(`Uploading ${i + 1}/${files.length}`);

          // Get upload URL
          const uploadUrl = await generateUploadUrl();

          // Upload file to Convex storage
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const { storageId } = await response.json();

          // Save reference in database
          const result = await saveUploadedPhoto({
            photoBookId: bookId,
            storageId,
            fileName: file.name,
          });

          addUploadedPhoto({
            storageId,
            url: result.url,
            fileName: file.name,
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload some photos. Please try again.");
      } finally {
        setIsUploading(false);
        setUploadProgress(null);
      }
    },
    [
      uploadedPhotos.length,
      maxPhotos,
      generateUploadUrl,
      saveUploadedPhoto,
      addUploadedPhoto,
      createPhotoBook,
      photoBookId,
      setPhotoBookId,
      selectedBookTypeId,
      selectedPageOptionId,
      selectedCoverDesignId,
    ],
  );

  const handleRemovePhoto = async (storageId: string) => {
    removeUploadedPhoto(storageId);
    // Note: In a real app, you'd also delete from server
    // but we'll keep it simple for now
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleNext = () => {
    if (uploadedPhotos.length > 0) {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-6 border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
            Memry Photobook
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create beautiful memories
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-28">
        <div className="max-w-lg mx-auto">
          {/* Step indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                4
              </span>
              <span className="font-medium text-foreground">
                Upload Your Photos
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-primary rounded-full transition-all duration-300" />
            </div>
          </div>

          {/* Upload Area */}
          <Card
            className={cn(
              "border-2 border-dashed p-8 text-center transition-colors",
              isUploading
                ? "border-primary bg-beige/20"
                : "border-muted-foreground/30",
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="flex flex-col items-center">
              {isUploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="mt-4 text-foreground font-medium">
                    {uploadProgress || "Uploading..."}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-foreground" />
                  </div>
                  <p className="mt-4 text-foreground font-medium">
                    Drag & drop your photos here
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    or tap to select files
                  </p>
                  <label className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileUpload(e.target.files);
                        }
                      }}
                      disabled={isUploading}
                    />
                    <Button
                      variant="secondary"
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        <ImagePlus className="w-4 h-4 mr-2" />
                        Select Photos
                      </span>
                    </Button>
                  </label>
                </>
              )}
            </div>
          </Card>

          {/* Photo count */}
          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {uploadedPhotos.length} of {maxPhotos} photos uploaded
            </span>
            {uploadedPhotos.length >= maxPhotos && (
              <span className="text-amber-600 font-medium">
                Maximum reached
              </span>
            )}
          </div>

          {/* Progress bar for uploads */}
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((uploadedPhotos.length / maxPhotos) * 100, 100)}%`,
              }}
            />
          </div>

          {/* Uploaded Photos Grid */}
          {uploadedPhotos.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-foreground mb-3">
                Uploaded Photos
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.storageId} className="relative aspect-square">
                    <img
                      src={photo.url}
                      alt={photo.fileName}
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button
                      onClick={() => handleRemovePhoto(photo.storageId)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-beige/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload high-resolution photos for best print quality</li>
              <li>• Supported formats: JPG, PNG, HEIC</li>
              <li>• Photos will be automatically arranged in your book</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            variant="outline"
            className="h-12 px-6"
            onClick={prevStep}
            disabled={isUploading}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <Button
            className="flex-1 h-12 text-base font-semibold"
            size="xl"
            disabled={uploadedPhotos.length === 0 || isUploading}
            onClick={handleNext}
          >
            Edit Book
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
