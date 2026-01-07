import { useRef, useState } from "react";
import { useQuery } from "convex/react";
import { useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Share2, Home } from "lucide-react";
import HTMLFlipBook, { type HTMLFlipBookRef } from "react-pageflip";

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

// Page component for the flip book
const BookPage = ({
  page,
  aspectRatio,
  isCover,
  coverImage,
  coverTitle,
}: {
  page?: Page;
  aspectRatio: number;
  isCover?: boolean;
  coverImage?: string;
  coverTitle?: string;
}) => {
  if (isCover) {
    return (
      <div
        className="w-full h-full bg-beige-dark rounded-r-md shadow-lg relative overflow-hidden"
        style={{ aspectRatio }}
      >
        {coverImage && (
          <img
            src={coverImage}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h2 className="text-white text-2xl font-serif font-bold text-center px-4">
            {coverTitle || "My Photobook"}
          </h2>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div
        className="w-full h-full bg-white rounded-md shadow-lg flex items-center justify-center"
        style={{ aspectRatio, backgroundColor: "#ffffff" }}
      >
        <span className="text-muted-foreground text-sm">Empty Page</span>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full rounded-md shadow-lg relative overflow-hidden"
      style={{ aspectRatio, backgroundColor: page.backgroundColor }}
    >
      {/* Photos Layer */}
      {page.photos.map((photo, index) => (
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
      {page.texts.map((text) => (
        <div
          key={text.id}
          className="absolute"
          style={{
            left: `${text.x}%`,
            top: `${text.y}%`,
            fontSize: `${text.fontSize}px`,
            fontFamily: text.fontFamily,
            color: text.color,
            transform: `rotate(${text.rotation}deg)`,
          }}
        >
          {text.content}
        </div>
      ))}

      {/* Page number */}
      <div className="absolute bottom-2 right-3 text-xs text-muted-foreground bg-white/80 px-2 py-0.5 rounded">
        {page.pageNumber}
      </div>
    </div>
  );
};

export function ViewBookPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const bookRef = useRef<HTMLFlipBookRef>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const photoBook = useQuery(
    api.photoBooks.getByShareId,
    shareId ? { shareId } : "skip",
  );

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Check out my Photobook!",
        text: "I created a beautiful photobook on Memry Photobook",
        url: window.location.href,
      });
    } catch {
      // Fallback to copy link
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const goToHome = () => {
    window.location.href = "/";
  };

  const nextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const onFlip = (e: { data: number }) => {
    setCurrentPage(e.data);
  };

  // Loading state
  if (photoBook === undefined) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading photobook...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (photoBook === null) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Photobook Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            This photobook may have been deleted or the link is incorrect.
          </p>
          <Button onClick={goToHome}>
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Get aspect ratio
  const aspectRatio = photoBook.bookType?.aspectRatio || "3:4";
  const [ratioW, ratioH] = aspectRatio.split(":").map(Number);
  const aspectRatioValue = ratioW / ratioH;

  // Calculate book dimensions
  const pageWidth = Math.min(300, window.innerWidth * 0.4);
  const pageHeight = pageWidth / aspectRatioValue;

  // Total pages including cover
  const totalPages = photoBook.pages.length + 1;

  return (
    <div className="min-h-screen bg-beige flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 bg-white/80 backdrop-blur border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-serif font-bold text-foreground">
            Memry Photobook
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToHome}>
              <Home className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Book Container */}
        <div className="relative">
          <HTMLFlipBook
            ref={bookRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={200}
            maxWidth={400}
            minHeight={250}
            maxHeight={500}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onFlip}
            className="shadow-2xl"
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={600}
            usePortrait={true}
            startZIndex={0}
            autoSize={false}
            maxShadowOpacity={0.5}
            showPageCorners={true}
            disableFlipByClick={false}
            swipeDistance={30}
            clickEventForward={true}
            useMouseEvents={true}
          >
            {/* Cover Page */}
            <div className="page-content">
              <BookPage
                isCover
                aspectRatio={aspectRatioValue}
                coverImage={photoBook.theme?.coverImageUrl}
                coverTitle={photoBook.theme?.name}
              />
            </div>

            {/* Content Pages */}
            {photoBook.pages.map((page: Page, index: number) => (
              <div key={index} className="page-content">
                <BookPage page={page} aspectRatio={aspectRatioValue} />
              </div>
            ))}

            {/* Back Cover */}
            <div className="page-content">
              <div
                className="w-full h-full bg-beige-dark rounded-md shadow-lg flex items-center justify-center"
                style={{ aspectRatio: aspectRatioValue }}
              >
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Created with</p>
                  <p className="font-serif font-bold text-foreground mt-1">
                    Memry Photobook
                  </p>
                </div>
              </div>
            </div>
          </HTMLFlipBook>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground min-w-25 text-center">
            Page {currentPage + 1} of {totalPages + 1}
          </span>

          <Button
            variant="outline"
            size="lg"
            onClick={nextPage}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>

        {/* Swipe hint for mobile */}
        <p className="text-xs text-muted-foreground mt-4 md:hidden">
          Swipe or tap edges to turn pages
        </p>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © Memry Photobook • Create your own at{" "}
          <a href="/" className="underline">
            memryphotobook.com
          </a>
        </p>
      </footer>
    </div>
  );
}
