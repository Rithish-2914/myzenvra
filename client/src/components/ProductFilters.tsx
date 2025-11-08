import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const categories = ["Hoodies", "Tees", "Pants", "Accessories"];
const sizes = ["XS", "S", "M", "L", "XL", "2XL"];

export default function ProductFilters() {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [customizableOnly, setCustomizableOnly] = useState(false);

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-6">Filters</h3>

      <div className="space-y-6">
        <div>
          <Label className="mb-3 block">Category</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center gap-2">
                <Checkbox
                  id={`category-${category}`}
                  data-testid={`checkbox-category-${category.toLowerCase()}`}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-3 block">Size</Label>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <Checkbox
                key={size}
                id={`size-${size}`}
                data-testid={`checkbox-size-${size}`}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-3 block">
            Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
          </Label>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={5000}
            step={100}
            data-testid="slider-price"
          />
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <Checkbox
            id="customizable"
            checked={customizableOnly}
            onCheckedChange={(checked) => setCustomizableOnly(checked as boolean)}
            data-testid="checkbox-customizable"
          />
          <label htmlFor="customizable" className="text-sm cursor-pointer">
            Customizable Only
          </label>
        </div>
      </div>
    </Card>
  );
}
