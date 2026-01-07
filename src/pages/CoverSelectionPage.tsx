import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrderStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, Image } from "lucide-react";

export function CoverSelectionPage() {
  const coverDesigns = useQuery(api.coverDesigns.listActive);
  const selectedBookType = useQuery(
    api.bookTypes.getById,
    useOrderStore.getState().selectedBookTypeId
      ? { id: useOrderStore.getState().selectedBookTypeId! }
      : "skip"
  );
  const selectedPageOption = useQuery(
    api.pageOptions.getById,
    useOrderStore.getState().selectedPageOptionId
      ? { id: useOrderStore.getState().selectedPageOptionId! }
      : "skip"
  );

  const {
    selectedCoverDesignId,
    setSelectedCoverDesignId,
    nextStep,
    prevStep,
  } = useOrderStore();

  const handleNext = () => {
    if (selectedCoverDesignId) {
      nextStep();
    }
  };

  const totalPrice =
    (selectedBookType?.price ?? 0) + (selectedPageOption?.additionalPrice ?? 0);

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
                3
              </span>
              <span className="font-medium text-foreground">Choose Your Cover</span>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-primary rounded-full transition-all duration-300" />
            </div>
          </div>

          {/* Cover Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-beige rounded-full flex items-center justify-center">
              <Image className="w-8 h-8 text-foreground" />
            </div>
            <p className="mt-3 text-muted-foreground">
              Select a cover design for your photobook
            </p>
          </div>

          {/* Cover Designs Grid */}
          {coverDesigns === undefined ? (
            // Loading skeleton
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-3 animate-pulse">
                  <div className="aspect-square bg-muted rounded-md" />
                  <div className="h-4 bg-muted rounded w-3/4 mt-3 mx-auto" />
                </Card>
              ))}
            </div>
          ) : coverDesigns.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No cover designs available at the moment.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {coverDesigns.map((cover) => {
                const isSelected = selectedCoverDesignId === cover._id;
                return (
                  <Card
                    key={cover._id}
                    className={cn(
                      "p-3 cursor-pointer transition-all duration-200 active:scale-[0.98]",
                      isSelected
                        ? "ring-2 ring-primary bg-beige/30"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedCoverDesignId(cover._id)}
                  >
                    <div className="relative aspect-square">
                      <img
                        src={cover.imageUrl}
                        alt={cover.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-center text-sm mt-3 font-medium",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {cover.name}
                    </p>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Order Summary */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium text-foreground mb-3">Order Summary</h4>
            {selectedBookType && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{selectedBookType.name}</span>
                <span className="text-foreground">${selectedBookType.price.toFixed(2)}</span>
              </div>
            )}
            {selectedPageOption && selectedPageOption.additionalPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedPageOption.pageCount} Pages (additional)
                </span>
                <span className="text-foreground">
                  +${selectedPageOption.additionalPrice.toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-border flex justify-between">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-bold text-foreground">${totalPrice.toFixed(2)}</span>
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
            size="xl"
            disabled={!selectedCoverDesignId}
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
