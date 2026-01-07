import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrderStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

export function HomePage() {
  const bookTypes = useQuery(api.bookTypes.listActive);
  const { selectedBookTypeId, setSelectedBookTypeId, nextStep } =
    useOrderStore();

  const handleNext = () => {
    if (selectedBookTypeId) {
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
                1
              </span>
              <span className="font-medium text-foreground">
                Choose Your Book Style
              </span>
            </div>
          </div>

          {/* Book Selection */}
          <div className="space-y-3">
            {bookTypes === undefined ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-24 h-32 bg-muted rounded-md" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-6 bg-muted rounded w-1/3 mt-4" />
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            ) : bookTypes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No book styles available at the moment.
                </p>
              </Card>
            ) : (
              bookTypes.map((bookType) => {
                const isSelected = selectedBookTypeId === bookType._id;
                return (
                  <Card
                    key={bookType._id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 active:scale-[0.98]",
                      isSelected
                        ? "ring-2 ring-primary bg-beige/30"
                        : "hover:bg-muted/50",
                    )}
                    onClick={() => setSelectedBookTypeId(bookType._id)}
                  >
                    <div className="flex gap-4">
                      {/* Book Image */}
                      <div className="relative w-24 h-32 shrink-0">
                        <img
                          src={bookType.imageUrl}
                          alt={bookType.name}
                          className="w-full h-full object-cover rounded-md shadow-sm"
                        />
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-foreground text-lg">
                          {bookType.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aspect Ratio: {bookType.aspectRatio}
                        </p>
                        <p className="text-xl font-bold text-foreground mt-3">
                          ${bookType.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full h-12 text-base font-semibold"
            size="xl"
            disabled={!selectedBookTypeId}
            onClick={handleNext}
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
