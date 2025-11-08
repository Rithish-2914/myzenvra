import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload } from "lucide-react";

const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const colors = [
  { name: "Beige", value: "#F5F1E8" },
  { name: "Black", value: "#0A0A0A" },
  { name: "White", value: "#FFFFFF" },
  { name: "Gold", value: "#D4AF37" },
];

export default function CustomizeForm() {
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("#F5F1E8");
  const [customText, setCustomText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      console.log("File uploaded:", file.name);
    }
  };

  const handleSubmit = () => {
    console.log("Customization:", { selectedSize, selectedColor, customText, uploadedFile });
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Customize Your Product</h3>

      <div className="space-y-6">
        <div>
          <Label className="mb-3 block">Upload Design Image</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              data-testid="input-file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {uploadedFile || "Click to upload or drag and drop"}
              </p>
            </label>
          </div>
        </div>

        <div>
          <Label className="mb-3 block">Choose Color</Label>
          <div className="flex gap-3 flex-wrap">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-12 h-12 rounded-md border-2 transition-all ${
                  selectedColor === color.value ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
                style={{ backgroundColor: color.value }}
                data-testid={`button-color-${color.name.toLowerCase()}`}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-3 block">Select Size</Label>
          <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <div key={size}>
                <RadioGroupItem
                  value={size}
                  id={`size-${size}`}
                  className="peer sr-only"
                  data-testid={`radio-size-${size}`}
                />
                <Label
                  htmlFor={`size-${size}`}
                  className="flex items-center justify-center px-4 py-2 border-2 border-border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover-elevate"
                >
                  {size}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="custom-text" className="mb-3 block">
            Add Custom Text (Optional)
          </Label>
          <Textarea
            id="custom-text"
            placeholder="Enter your custom text here..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="resize-none"
            rows={3}
            data-testid="textarea-custom-text"
          />
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">Total Price:</span>
            <span className="text-2xl font-bold text-primary" data-testid="text-total-price">₹2,499</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            data-testid="button-add-to-cart"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
