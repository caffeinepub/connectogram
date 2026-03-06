import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { Story, UserProfile } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";

// Sample story users for demo
const SAMPLE_STORIES = [
  {
    id: "1",
    username: "sofia.art",
    avatar: "/assets/generated/avatar-sofia.dim_200x200.jpg",
  },
  {
    id: "2",
    username: "alex.dev",
    avatar: "/assets/generated/avatar-alex.dim_200x200.jpg",
  },
  {
    id: "3",
    username: "maya.web3",
    avatar: "/assets/generated/avatar-maya.dim_200x200.jpg",
  },
  { id: "4", username: "crypto.kai", avatar: "" },
  { id: "5", username: "nft.nova", avatar: "" },
];

interface StoriesRowProps {
  stories?: Story[];
  isLoading?: boolean;
}

interface ViewingStory {
  username: string;
  avatar: string;
  image?: string;
}

export function StoriesRow({ isLoading }: StoriesRowProps) {
  const { isAuthenticated } = useAuth();
  const [viewingStory, setViewingStory] = useState<ViewingStory | null>(null);

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
        {/* Add story button */}
        {isAuthenticated && (
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              data-ocid="story.add.button"
              className="w-16 h-16 rounded-full bg-secondary border-2 border-dashed border-primary/40 flex items-center justify-center hover:border-primary transition-all duration-200 hover:scale-105 hover:bg-primary/10 group"
            >
              <Plus className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            </button>
            <span className="text-[10px] text-muted-foreground">
              Your Story
            </span>
          </div>
        )}

        {/* Story bubbles */}
        {SAMPLE_STORIES.map((story, idx) => (
          <button
            type="button"
            key={story.id}
            data-ocid={`story.item.${idx + 1}`}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer bg-transparent border-0 p-0"
            onClick={() =>
              setViewingStory({
                username: story.username,
                avatar: story.avatar,
              })
            }
          >
            <div className="p-0.5 rounded-full story-ring">
              <div className="p-0.5 rounded-full bg-background">
                <Avatar className="w-14 h-14">
                  {story.avatar ? <AvatarImage src={story.avatar} /> : null}
                  <AvatarFallback className="bg-gradient-brand text-white font-bold text-lg">
                    {story.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground w-16 text-center truncate">
              {story.username}
            </span>
          </button>
        ))}
      </div>

      {/* Story viewer */}
      <Dialog open={!!viewingStory} onOpenChange={() => setViewingStory(null)}>
        <DialogContent className="glass border-border/50 max-w-sm p-0 overflow-hidden rounded-2xl">
          {viewingStory && (
            <>
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-3">
                <div className="h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-white rounded-full" />
                </div>
              </div>
              {/* Header */}
              <div className="absolute top-6 left-0 right-0 z-10 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 ring-2 ring-white/50">
                    {viewingStory.avatar ? (
                      <AvatarImage src={viewingStory.avatar} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-brand text-white text-xs">
                      {viewingStory.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm font-semibold drop-shadow">
                    {viewingStory.username}
                  </span>
                </div>
                <DialogClose asChild>
                  <button
                    type="button"
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </DialogClose>
              </div>
              {/* Story image or colored bg */}
              <div
                className="w-full aspect-[9/16] flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.58 0.24 298), oklch(0.6 0.2 250), oklch(0.74 0.18 200))",
                }}
              >
                <div className="text-center text-white space-y-2 px-8">
                  <div className="text-5xl">✨</div>
                  <p className="text-lg font-semibold drop-shadow">
                    {viewingStory.username}'s story
                  </p>
                  <p className="text-sm text-white/70">Building on ICP 🚀</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
