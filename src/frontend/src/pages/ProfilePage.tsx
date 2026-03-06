import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Camera,
  Edit3,
  Grid3X3,
  Loader2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { CgramBalance } from "../components/CgramToken";
import {
  IcpBadge,
  VERIFIED_PRINCIPALS,
  VerifiedBadge,
} from "../components/IcpBadge";
import { PostCard } from "../components/PostCard";
import { WideAppLayout } from "../components/layout/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useFollowUser,
  useGetFollowers,
  useGetFollowing,
  useGetPostsByUser,
  useGetUserProfile,
  useUnfollowUser,
  useUpdateUser,
} from "../hooks/useQueries";

export function ProfilePage() {
  const { principalId } = useParams({ from: "/profile/$principalId" });
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isInitializing,
    principal: myPrincipal,
    userProfile: myProfile,
  } = useAuth();

  const [profilePrincipal, setProfilePrincipal] = useState<Principal | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [_showPostModal, setShowPostModal] = useState<number | null>(null);

  const isOwnProfile = myPrincipal === principalId;

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  useEffect(() => {
    try {
      if (principalId) {
        setProfilePrincipal(
          PrincipalClass.fromText(principalId) as unknown as Principal,
        );
      }
    } catch {
      // Invalid principal
    }
  }, [principalId]);

  const { data: profile, isLoading: profileLoading } =
    useGetUserProfile(profilePrincipal);
  const { data: posts, isLoading: postsLoading } =
    useGetPostsByUser(profilePrincipal);
  const { data: followers } = useGetFollowers(profilePrincipal);
  const { data: following } = useGetFollowing(profilePrincipal);
  const { data: myFollowing } = useGetFollowing(
    myPrincipal
      ? (PrincipalClass.fromText(myPrincipal) as unknown as Principal)
      : null,
  );

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const updateUser = useUpdateUser();

  const isFollowing =
    myFollowing?.some((p) => p.toString() === principalId) ?? false;

  const displayProfile = isOwnProfile ? (myProfile ?? profile) : profile;
  const displayPosts = posts && posts.length > 0 ? posts : null;
  const shortPrincipal = `${principalId?.slice(0, 8) ?? ""}...${principalId?.slice(-5) ?? ""}`;

  const handleFollow = async () => {
    if (!profilePrincipal) return;
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(profilePrincipal);
        toast.success("Unfollowed");
      } else {
        await followUser.mutateAsync(profilePrincipal);
        toast.success("Following!");
      }
    } catch {
      toast.error("Action failed. Please try again.");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditSave = async () => {
    try {
      let blob: ExternalBlob | null = null;
      if (selectedImage) {
        const bytes = new Uint8Array(await selectedImage.arrayBuffer());
        blob = ExternalBlob.fromBytes(bytes);
      }
      await updateUser.mutateAsync({ bio: editBio, profilePicture: blob });
      toast.success("Profile updated!");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const openEditDialog = useCallback(() => {
    setEditBio(displayProfile?.bio ?? "");
    setEditOpen(true);
  }, [displayProfile]);

  if (profileLoading && !displayProfile) {
    return (
      <WideAppLayout>
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 border border-border/40">
            <div className="flex gap-6 items-start">
              <Skeleton className="w-24 h-24 rounded-full bg-secondary flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="w-40 h-5 bg-secondary rounded" />
                <Skeleton className="w-64 h-3 bg-secondary rounded" />
                <div className="flex gap-6">
                  <Skeleton className="w-16 h-8 bg-secondary rounded" />
                  <Skeleton className="w-16 h-8 bg-secondary rounded" />
                  <Skeleton className="w-16 h-8 bg-secondary rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </WideAppLayout>
    );
  }

  return (
    <WideAppLayout>
      <div className="space-y-6">
        {/* Profile header */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-border/40 shadow-glass">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="p-1 rounded-full story-ring">
                <div className="p-0.5 rounded-full bg-background">
                  <Avatar className="w-24 h-24">
                    {displayProfile?.profilePicture ? (
                      <AvatarImage
                        src={displayProfile.profilePicture.getDirectURL()}
                      />
                    ) : null}
                    <AvatarFallback className="bg-gradient-brand text-white text-3xl font-bold">
                      {displayProfile?.username?.charAt(0)?.toUpperCase() ??
                        principalId?.charAt(0)?.toUpperCase() ??
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-display font-bold">
                  {displayProfile?.username ?? "Unknown User"}
                </h1>
                {principalId && VERIFIED_PRINCIPALS.has(principalId) && (
                  <VerifiedBadge />
                )}
                <IcpBadge />
              </div>

              <p className="text-xs text-muted-foreground font-mono mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-brand" />
                {shortPrincipal}
              </p>

              {displayProfile?.bio && (
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-md">
                  {displayProfile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mb-4 items-end">
                <div className="text-center">
                  <div className="font-display font-bold text-foreground text-xl">
                    {displayPosts?.length ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-foreground text-xl">
                    {followers?.length ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-foreground text-xl">
                    {following?.length ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
                {/* CGRAM Balance */}
                <div className="border-l border-border/40 pl-4 ml-1">
                  <CgramBalance
                    balance={
                      (displayPosts?.length ?? 0) * 10 +
                      (followers?.length ?? 0) * 5 +
                      50
                    }
                  />
                </div>
              </div>

              {/* Action buttons */}
              {isOwnProfile ? (
                <Button
                  data-ocid="profile.edit_button"
                  variant="outline"
                  size="sm"
                  onClick={openEditDialog}
                  className="rounded-xl border-border/60 hover:border-primary/50 gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  data-ocid="profile.follow.button"
                  size="sm"
                  onClick={handleFollow}
                  disabled={followUser.isPending || unfollowUser.isPending}
                  className={`rounded-xl gap-2 ${isFollowing ? "btn-gradient" : "btn-gradient"}`}
                >
                  {followUser.isPending || unfollowUser.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-3.5 h-3.5" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Posts grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Grid3X3 className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display font-semibold text-sm">Posts</h2>
          </div>

          {postsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                  key={i}
                  className="aspect-square rounded-xl bg-secondary"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Grid view */}
              {(displayPosts ?? []).length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {(displayPosts ?? []).map((post, i) => {
                    const imgSrc = post.image.getDirectURL();
                    return (
                      <button
                        type="button"
                        key={post.id.toString()}
                        onClick={() => setShowPostModal(i)}
                        className="aspect-square rounded-xl overflow-hidden group relative hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={imgSrc}
                          alt={post.caption}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {(!displayPosts || displayPosts.length === 0) && (
                <div
                  data-ocid="profile.empty_state"
                  className="glass rounded-2xl p-10 text-center border border-border/40"
                >
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-muted-foreground text-sm">No posts yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          data-ocid="profile.edit.dialog"
          className="glass border-border/50 rounded-2xl max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Profile picture */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-primary/30">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} />
                ) : displayProfile?.profilePicture ? (
                  <AvatarImage
                    src={displayProfile.profilePicture.getDirectURL()}
                  />
                ) : null}
                <AvatarFallback className="bg-gradient-brand text-white text-xl font-bold">
                  {displayProfile?.username?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label
                  htmlFor="profile-pic"
                  className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  data-ocid="profile.upload_button"
                >
                  <Camera className="w-4 h-4" />
                  Change photo
                </Label>
                <input
                  id="profile-pic"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell your story..."
                className="bg-secondary border-border/50 rounded-xl resize-none"
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground text-right">
                {editBio.length}/150
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-border/60"
                onClick={() => setEditOpen(false)}
                data-ocid="profile.edit.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 btn-gradient rounded-xl"
                onClick={handleEditSave}
                disabled={updateUser.isPending}
                data-ocid="profile.edit.save_button"
              >
                {updateUser.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </WideAppLayout>
  );
}
