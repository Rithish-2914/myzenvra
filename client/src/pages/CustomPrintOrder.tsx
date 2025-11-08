import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomPrintOrderSchema, type InsertCustomPrintOrder } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle } from "lucide-react";

export default function CustomPrintOrder() {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertCustomPrintOrder>({
    resolver: zodResolver(insertCustomPrintOrderSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      category_type: "tshirt",
      custom_text: "",
      custom_image_url: "",
      selected_color: "",
      selected_size: "M",
      quantity: 1,
      special_instructions: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertCustomPrintOrder) => {
      return apiRequest("/api/custom-print-orders", "POST", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Order Submitted!",
        description: "We'll review your custom design and get back to you soon.",
      });
      form.reset();
      setImageFile(null);
      setImagePreview("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit order. Please try again.",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("custom_image_url", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: InsertCustomPrintOrder) => {
    createOrderMutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" data-testid="icon-success" />
            <h2 className="text-2xl font-bold mb-2" data-testid="text-success-title">Order Submitted!</h2>
            <p className="text-muted-foreground mb-6" data-testid="text-success-message">
              We'll review your custom design request and contact you within 24-48 hours with pricing and next steps.
            </p>
            <Button onClick={() => setSubmitted(false)} data-testid="button-submit-another">
              Submit Another Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Custom Print Your Design</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Upload your design, choose your garment, and we'll bring your vision to life.
            Our team will review and print your custom creation.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-contact-section">Contact Information</CardTitle>
                <CardDescription>Let us know how to reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="customer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle data-testid="text-design-section">Your Design</CardTitle>
                <CardDescription>Upload your image or add custom text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="custom_image_url"
                  render={() => (
                    <FormItem>
                      <FormLabel>Upload Image</FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed rounded-md p-6 text-center">
                          {imagePreview ? (
                            <div className="space-y-4">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-w-full h-48 mx-auto object-contain"
                                data-testid="img-preview"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview("");
                                  form.setValue("custom_image_url", "");
                                }}
                                data-testid="button-remove-image"
                              >
                                Remove Image
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" data-testid="icon-upload" />
                              <label htmlFor="image-upload" className="cursor-pointer">
                                <span className="text-primary hover:underline" data-testid="link-upload">Click to upload</span> or drag and drop
                                <Input
                                  id="image-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageChange}
                                  data-testid="input-image"
                                />
                              </label>
                              <p className="text-sm text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>Upload your design or logo (optional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="custom_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter text you want printed..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          data-testid="input-custom-text"
                        />
                      </FormControl>
                      <FormDescription>Add text to your design (optional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle data-testid="text-garment-section">Garment Selection</CardTitle>
                <CardDescription>Choose your product type and details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tshirt" data-testid="option-tshirt">T-Shirt</SelectItem>
                          <SelectItem value="hoodie" data-testid="option-hoodie">Hoodie</SelectItem>
                          <SelectItem value="sweatshirt" data-testid="option-sweatshirt">Sweatshirt</SelectItem>
                          <SelectItem value="jacket" data-testid="option-jacket">Jacket</SelectItem>
                          <SelectItem value="shorts" data-testid="option-shorts">Shorts</SelectItem>
                          <SelectItem value="pants" data-testid="option-pants">Pants</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="selected_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Black, White, Navy" {...field} data-testid="input-color" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="selected_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-size">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="XS" data-testid="option-xs">XS</SelectItem>
                            <SelectItem value="S" data-testid="option-s">S</SelectItem>
                            <SelectItem value="M" data-testid="option-m">M</SelectItem>
                            <SelectItem value="L" data-testid="option-l">L</SelectItem>
                            <SelectItem value="XL" data-testid="option-xl">XL</SelectItem>
                            <SelectItem value="XXL" data-testid="option-xxl">XXL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="special_instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requests or notes..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          data-testid="input-instructions"
                        />
                      </FormControl>
                      <FormDescription>Let us know if you have any special requirements</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={createOrderMutation.isPending}
              data-testid="button-submit-order"
            >
              {createOrderMutation.isPending ? "Submitting..." : "Submit Custom Order"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
