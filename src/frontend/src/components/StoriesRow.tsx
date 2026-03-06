import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Loader2, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Story } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import {
  useCreateStory,
  useGetAllStories,
  useGetUserProfile,
} from "../hooks/useQueries";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatStoryTime(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

// ── Story bubble for a user ───────────────────────────────────────────────────

interface StoryBubbleProps {
  userId: string;
  stories: Story[];
  index: number;
  onView: (stories: Story[], userId: string) => void;
}

function StoryBubble({ userId, stories, index, onView }: StoryBubbleProps) {
  // We import Principal type but pass userId as string; convert for query
  const principalLike = { toString: () => userId } as Parameters<
    typeof useGetUserProfile
  >[0];
  const { data: profile } = useGetUserProfile(principalLike);
  const username = profile?.username ?? `${userId.slice(0, 6)}...`;
  const avatarUrl = profile?.profilePicture?.getDirectURL();

  return (
    <button
      type="button"
      data-ocid={`story.item.${index}`}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer bg-transparent border-0 p-0 group"
      onClick={() => onView(stories, userId)}
    >
      <div className="p-0.5 rounded-full story-ring transition-transform duration-200 group-hover:scale-105">
        <div className="p-0.5 rounded-full bg-background">
          <Avatar className="w-14 h-14">
            {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
            <AvatarFallback className="bg-gradient-brand text-white font-bold text-lg">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground w-16 text-center truncate">
        {username}
      </span>
    </button>
  );
}

// ── Story viewer ─────────────────────────────────────────────────────────────

interface StoryViewerProps {
  stories: Story[];
  viewerUserId: string;
  open: boolean;
  onClose: () => void;
}

function StoryViewer({
  stories,
  viewerUserId,
  open,
  onClose,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const STORY_DURATION = 5000;

  const principalLike = { toString: () => viewerUserId } as Parameters<
    typeof useGetUserProfile
  >[0];
  const { data: profile } = useGetUserProfile(principalLike);
  const username = profile?.username ?? `${viewerUserId.slice(0, 6)}...`;
  const avatarUrl = profile?.profilePicture?.getDirectURL();

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  // Auto-advance via progress — re-runs when goNext identity changes (i.e. currentIndex changes)
  useEffect(() => {
    if (!open) return;
    setProgress(0);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        goNext();
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, goNext]);

  // Reset index when dialog opens
  useEffect(() => {
    if (open) setCurrentIndex(0);
  }, [open]);

  const current = stories[currentIndex];
  if (!current) return null;

  const imageUrl = current.image.getDirectURL();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        data-ocid="story.dialog"
        className="glass border-border/50 max-w-sm p-0 overflow-hidden rounded-2xl"
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 flex gap-1">
          {stories.map((story, i) => (
            <div
              key={story.id.toString()}
              className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-20 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 ring-2 ring-white/50">
              {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
              <AvatarFallback className="bg-gradient-brand text-white text-xs">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-white text-sm font-semibold drop-shadow block">
                {username}
              </span>
              <span className="text-white/60 text-[10px]">
                {formatStoryTime(current.createdAt)}
              </span>
            </div>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              data-ocid="story.close_button"
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </div>

        {/* Story image — clicking anywhere advances */}
        <button
          type="button"
          className="w-full aspect-[9/16] relative overflow-hidden border-0 p-0 block"
          onClick={goNext}
          aria-label="Next story"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.58 0.24 298), oklch(0.6 0.2 250), oklch(0.74 0.18 200))",
              }}
            />
          )}

          {/* Text overlay */}
          {current.text && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-sm font-medium text-center drop-shadow-lg">
                {current.text}
              </p>
            </div>
          )}
        </button>
      </DialogContent>
    </Dialog>
  );
}

// ── Story creation modal ──────────────────────────────────────────────────────

interface StoryCreateModalProps {
  open: boolean;
  onClose: () => void;
}

function StoryCreateModal({ open, onClose }: StoryCreateModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createStory = useCreateStory();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }
    try {
      const bytes = new Uint8Array(await imageFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
      await createStory.mutateAsync({ image: blob, text: caption });
      toast.success("Story posted!");
      setImageFile(null);
      setImagePreview(null);
      setCaption("");
      setUploadProgress(0);
      onClose();
    } catch {
      toast.error("Failed to post story");
    }
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setImageFile(null);
      setImagePreview(null);
      setCaption("");
      setUploadProgress(0);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        data-ocid="story.modal"
        className="glass border-border/50 max-w-sm rounded-2xl p-0 overflow-hidden"
      >
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-display font-bold text-gradient">
            Add Your Story
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Visible for 24 hours
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Image picker */}
          <button
            type="button"
            data-ocid="story.dropzone"
            className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border-2 border-dashed border-border/60 hover:border-primary/60 transition-colors cursor-pointer group p-0"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Pick story image"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Story preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                <Camera className="w-10 h-10" />
                <span className="text-sm font-medium">Tap to select image</span>
                <span className="text-xs opacity-70">JPG, PNG, WEBP</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="story.upload_button"
            />
          </button>

          {/* Caption */}
          <Input
            data-ocid="story.input"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption… (optional)"
            className="bg-secondary/60 border-border/50 rounded-xl text-sm"
            maxLength={200}
          />

          {/* Upload progress */}
          {createStory.isPending && uploadProgress > 0 && (
            <div data-ocid="story.loading_state" className="space-y-1">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-brand rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              data-ocid="story.cancel_button"
              variant="ghost"
              className="flex-1 rounded-xl border border-border/50"
              onClick={onClose}
              disabled={createStory.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="story.submit_button"
              className="btn-gradient flex-1 rounded-xl"
              disabled={createStory.isPending || !imageFile}
            >
              {createStory.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {createStory.isPending ? "Posting…" : "Share Story"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main StoriesRow ───────────────────────────────────────────────────────────

interface StoriesRowProps {
  isLoading?: boolean;
}

export function StoriesRow({ isLoading: externalLoading }: StoriesRowProps) {
  const { isAuthenticated } = useAuth();
  const { data: stories, isLoading: storiesLoading } = useGetAllStories();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingStories, setViewingStories] = useState<Story[] | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string>("");

  const isLoading = externalLoading || storiesLoading;

  // Group stories by userId
  const storiesByUser = (stories ?? []).reduce<Record<string, Story[]>>(
    (acc, story) => {
      const userId = story.userId.toString();
      if (!acc[userId]) acc[userId] = [];
      acc[userId].push(story);
      return acc;
    },
    {},
  );

  const userIds = Object.keys(storiesByUser);

  const handleViewStory = (userStories: Story[], userId: string) => {
    setViewingStories(userStories);
    setViewingUserId(userId);
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {(["sk1", "sk2", "sk3", "sk4", "sk5"] as const).map((sk) => (
          <div
            key={sk}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <Skeleton className="w-16 h-16 rounded-full bg-secondary" />
            <Skeleton className="w-12 h-2 rounded bg-secondary" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {/* Add story button (authenticated users only) */}
        {isAuthenticated && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <button
                type="button"
                data-ocid="story.add.button"
                className="w-16 h-16 rounded-full bg-secondary border-2 border-dashed border-primary/40 flex items-center justify-center hover:border-primary transition-all duration-200 hover:scale-105 hover:bg-primary/10 group"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              </button>
              <span className="text-[10px] text-muted-foreground">
                Your Story
              </span>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Story bubbles per user */}
        {userIds.map((userId, idx) => (
          <motion.div
            key={userId}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <StoryBubble
              userId={userId}
              stories={storiesByUser[userId]}
              index={idx + 1}
              onView={handleViewStory}
            />
          </motion.div>
        ))}

        {/* Empty state when no stories and authenticated */}
        {userIds.length === 0 && isAuthenticated && (
          <div
            data-ocid="story.empty_state"
            className="flex items-center text-xs text-muted-foreground pl-2 py-2"
          >
            No stories yet — be the first!
          </div>
        )}
      </div>

      {/* Story creation modal */}
      <StoryCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Story viewer */}
      {viewingStories && viewingUserId && (
        <StoryViewer
          stories={viewingStories}
          viewerUserId={viewingUserId}
          open={!!viewingStories}
          onClose={() => {
            setViewingStories(null);
            setViewingUserId("");
          }}
        />
      )}
    </>
  );
}
