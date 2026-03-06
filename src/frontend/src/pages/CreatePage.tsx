import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Hash, ImageIcon, Loader2, Plus, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { AppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { useCreatePost } from "../hooks/useQueries";

export function CreatePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPost = useCreatePost();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags((prev) => [...prev, tag]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }
    if (!caption.trim()) {
      toast.error("Please add a caption");
      return;
    }

    try {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });

      await createPost.mutateAsync({
        image: blob,
        caption: caption.trim(),
        hashtags,
      });

      toast.success("Post created! 🎉");
      void navigate({ to: "/feed" });
    } catch {
      toast.error("Failed to create post. Please try again.");
      setUploadProgress(0);
    }
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-xl font-display font-bold text-gradient">
          Create Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>Image</Label>
            {!preview ? (
              <label
                data-ocid="create.image.dropzone"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                htmlFor="dropzone-input"
                className={`glass rounded-2xl border-2 border-dashed aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? "border-primary/80 bg-primary/5 shadow-glow"
                    : "border-border/40 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    dragOver ? "bg-gradient-brand shadow-glow" : "bg-secondary"
                  }`}
                >
                  <Upload
                    className={`w-7 h-7 ${dragOver ? "text-white" : "text-muted-foreground"}`}
                  />
                </div>
                <p className="font-semibold text-foreground mb-1">
                  {dragOver ? "Drop to upload" : "Drop image here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG, GIF up to 10MB
                </p>
                <input
                  id="dropzone-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden aspect-square">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-destructive hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 glass px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 hover:border-primary/50 transition-all"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Change
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              data-ocid="create.caption.textarea"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share your story... What's this moment about?"
              className="bg-secondary border-border/50 focus:border-primary/50 rounded-xl resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">
                {caption.length > 0 && `${caption.length}/500`}
              </span>
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtags</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="create.hashtag.input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="photography, travel, web3..."
                  className="pl-9 bg-secondary border-border/50 focus:border-primary/50 rounded-xl"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTag}
                className="rounded-xl border-border/60 hover:border-primary/50 hover:bg-primary/10 flex-shrink-0"
                disabled={!tagInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add a tag
            </p>

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="glass border-primary/20 text-gradient font-medium cursor-pointer hover:border-destructive/40 hover:text-destructive transition-all group"
                    onClick={() => removeTag(tag)}
                  >
                    #{tag}
                    <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Upload progress */}
          {createPost.isPending && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading to ICP...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress
                value={uploadProgress}
                className="h-1.5 bg-secondary [&>div]:bg-gradient-brand"
              />
            </div>
          )}

          {/* Preview summary */}
          {selectedFile && caption && (
            <div className="glass rounded-xl p-4 border border-primary/20">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-brand" />
                Post preview
              </p>
              <p className="text-sm">{caption}</p>
              {hashtags.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {hashtags.map((t) => (
                    <span key={t} className="text-xs text-gradient">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            data-ocid="create.submit_button"
            className="w-full btn-gradient rounded-xl h-12 font-semibold text-base"
            disabled={createPost.isPending || !selectedFile || !caption.trim()}
          >
            {createPost.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing to blockchain...
              </>
            ) : (
              "Share Post 🚀"
            )}
          </Button>
        </form>
      </motion.div>
    </AppLayout>
  );
}
