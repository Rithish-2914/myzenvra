import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Category } from "@/../../shared/schema";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  priceRange: number[];
  onPriceRangeChange: (range: number[]) => void;
  isLoading?: boolean;
}

export default function ProductFilters({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  priceRange,
  onPriceRangeChange,
  isLoading 
}: ProductFiltersProps) {

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-6">Filters</h3>

      <div className="space-y-6">
        <div>
          <Label className="mb-3 block">Category</Label>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-2">
              <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => onCategorySelect(null)}
                data-testid="button-category-all"
              >
                All Products
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onCategorySelect(category.id)}
                  data-testid={`button-category-${category.slug}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label className="mb-3 block">
            Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
          </Label>
          <Slider
            value={priceRange}
            onValueChange={onPriceRangeChange}
            max={5000}
            step={100}
            data-testid="slider-price"
          />
        </div>
      </div>
    </Card>
  );
}
