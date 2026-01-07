import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrderStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, Palette } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

export function ThemeSelectionPage() {
  const themesWithCategories = useQuery(api.themes.listActiveWithCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"themeCategories"> | null>(null);

  // Auto-select first category when data loads
  const firstCategoryId = themesWithCategories?.[0]?.category._id;
  if (firstCategoryId && !selectedCategoryId) {
    setSelectedCategoryId(firstCategoryId);
  }

  const {
    selectedThemeId,
    setSelectedThemeId,
    nextStep,
    prevStep,
  } = useOrderStore();

  const handleNext = () => {
    if (selectedThemeId) {
      nextStep();
    }
  };

  // Get themes for selected category
  const selectedCategoryData = themesWithCategories?.find(
    (c) => c.category._id === selectedCategoryId
  );

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
              <span className="font-medium text-foreground">Choose Your Theme</span>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-primary rounded-full transition-all duration-300" />
            </div>
          </div>

          {/* Theme Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto bg-beige rounded-full flex items-center justify-center">
              <Palette className="w-8 h-8 text-foreground" />
            </div>
            <p className="mt-3 text-muted-foreground">
              Select a theme for your photobook
            </p>
          </div>

          {themesWithCategories === undefined ? (
            // Loading skeleton
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-24 bg-muted rounded-full animate-pulse shrink-0" />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-3 animate-pulse">
                    <div className="aspect-square bg-muted rounded-md" />
                    <div className="h-4 bg-muted rounded w-3/4 mt-3 mx-auto" />
                  </Card>
                ))}
              </div>
            </div>
          ) : themesWithCategories.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No themes available at the moment.
              </p>
            </Card>
          ) : (
            <>
              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
                {themesWithCategories.map(({ category }) => (
                  <Button
                    key={category._id}
                    variant={selectedCategoryId === category._id ? "default" : "outline"}
                    size="sm"
                    className="shrink-0 rounded-full"
                    onClick={() => setSelectedCategoryId(category._id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Show category selection prompt if no category selected */}
              {!selectedCategoryId ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Select a category above to see available themes
                  </p>
                </div>
              ) : (
                /* Themes Grid */
                <div className="grid grid-cols-2 gap-3">
                  {selectedCategoryData?.themes.map((theme) => {
                    const isSelected = selectedThemeId === theme._id;
                    return (
                      <Card
                        key={theme._id}
                        className={cn(
                          "p-3 cursor-pointer transition-all duration-200 active:scale-[0.98]",
                          isSelected
                            ? "ring-2 ring-primary bg-beige/30"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedThemeId(theme._id)}
                      >
                        <div className="relative aspect-square">
                          <img
                            src={theme.coverImageUrl}
                            alt={theme.name}
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
                          {theme.name}
                        </p>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
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
            disabled={!selectedThemeId}
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
