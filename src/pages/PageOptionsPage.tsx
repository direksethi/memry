import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrderStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

export function PageOptionsPage() {
  const pageOptions = useQuery(api.pageOptions.listActive);
  const selectedBookType = useQuery(
    api.bookTypes.getById,
    useOrderStore.getState().selectedBookTypeId
      ? { id: useOrderStore.getState().selectedBookTypeId! }
      : "skip",
  );

  const { selectedPageOptionId, setSelectedPageOptionId, nextStep, prevStep } =
    useOrderStore();

  const handleNext = () => {
    if (selectedPageOptionId) {
      nextStep();
    }
  };

  const basePrice = selectedBookType?.price ?? 0;

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
                2
              </span>
              <span className="font-medium text-foreground">
                Choose Page Count
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-primary rounded-full transition-all duration-300" />
            </div>
          </div>

          {/* Page Count Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-beige rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-foreground" />
            </div>
            <p className="mt-3 text-muted-foreground">
              How many pages do you need?
            </p>
          </div>

          {/* Page Options Selection */}
          <div className="space-y-3">
            {pageOptions === undefined ? (
              // Loading skeleton
              <>
                {[1, 2].map((i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-6 bg-muted rounded w-24" />
                        <div className="h-4 bg-muted rounded w-32" />
                      </div>
                      <div className="h-8 bg-muted rounded w-20" />
                    </div>
                  </Card>
                ))}
              </>
            ) : pageOptions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No page options available at the moment.
                </p>
              </Card>
            ) : (
              pageOptions.map((option) => {
                const isSelected = selectedPageOptionId === option._id;
                const totalPrice = basePrice + option.additionalPrice;

                return (
                  <Card
                    key={option._id}
                    className={cn(
                      "p-5 cursor-pointer transition-all duration-200 active:scale-[0.98]",
                      isSelected
                        ? "ring-2 ring-primary bg-beige/30"
                        : "hover:bg-muted/50",
                    )}
                    onClick={() => setSelectedPageOptionId(option._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Selection indicator */}
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary-foreground" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-foreground text-lg">
                            {option.pageCount} Pages
                          </h3>
                          {option.additionalPrice > 0 ? (
                            <p className="text-sm text-muted-foreground">
                              +${option.additionalPrice.toFixed(2)} additional
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Base option
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">
                          ${totalPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">total</p>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Selected book type reminder */}
          {selectedBookType && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {selectedBookType.name}
                </span>
              </p>
            </div>
          )}
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
            disabled={!selectedPageOptionId}
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
