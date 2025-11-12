import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  label?: string;
  bucket?: string;
  currentImage?: string;
}

export function ImageUpload({ 
  onImageUploaded, 
  label = "Upload Image", 
  bucket = "categories",
  currentImage
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!storage) {
      toast({
        title: "Error",
        description: "Firebase Storage is not configured",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 9);
      const extension = file.name.split(".").pop();
      const filename = `${timestamp}_${randomId}.${extension}`;
      const storageRef = ref(storage, `${bucket}/${filename}`);

      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          });
          setIsUploading(false);
          setPreviewUrl(currentImage || null);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onImageUploaded(downloadURL);
          setIsUploading(false);
          toast({
            title: "Success",
            description: "Image uploaded successfully",
          });
        }
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
      setPreviewUrl(currentImage || null);
    }
  };

  const handleClearPreview = () => {
    setPreviewUrl(null);
    onImageUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as any;
      handleFileChange(fakeEvent);
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {previewUrl ? (
        <div className="relative">
          <div className="relative rounded-md overflow-hidden border border-card-border bg-muted">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-3/4 space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-white text-sm text-center">
                    {Math.round(uploadProgress)}% uploaded
                  </p>
                </div>
              </div>
            )}
          </div>
          {!isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleClearPreview}
              data-testid="button-remove-image"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-card-border rounded-md p-8 text-center hover-elevate cursor-pointer transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          data-testid="dropzone-image-upload"
        >
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(uploadProgress)}%
                </p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  Max 5MB • JPG, PNG, WEBP
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
