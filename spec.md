# Connectogram

## Current State
- Full social media app with posts, feed, explore, profiles, messaging, notifications
- PostCard shows like counts initialized with `Math.random()` (fake random numbers), not real data
- StoriesRow uses a hardcoded `SAMPLE_STORIES` array with fake users -- no real backend integration
- Backend has `likePost`/`unlikePost` but no `getLikeCount` or `getPostLikes` query
- Stories backend exists (`createStory`, `getActiveStories`) but is not wired to the UI
- "Add Story" button in StoriesRow does nothing

## Requested Changes (Diff)

### Add
- `getLikeCount(postId)` query to Motoko backend returning real like count per post
- `getPostLikes(postId)` query returning Set of principals who liked (to check if caller liked it)
- Story creation flow: clicking "Your Story" opens a dialog to upload an image + optional text, then calls `createStory`
- Story viewing: fetch real stories from all users the current user follows; show their story bubbles
- `useGetLikeCount` hook in useQueries.ts
- `useGetAllStories` hook to fetch stories for feed (from all registered users, or a public endpoint)

### Modify
- `PostCard`: replace `Math.random()` initial like count with real data fetched from `getLikeCount`
- `PostCard`: initialize `liked` state based on whether caller's principal is in post's likes set
- `StoriesRow`: remove `SAMPLE_STORIES` hardcoded data; wire to real backend stories
- `StoriesRow`: "Your Story" button opens story creation modal
- Motoko: add `getLikeCount` and `getPostLikes` public query functions
- Motoko: add `getAllStories` public query that returns all active stories across all users

### Remove
- `Math.random()` fake like count initialization in PostCard
- Hardcoded `SAMPLE_STORIES` array in StoriesRow

## Implementation Plan
1. Update `main.mo` to add `getLikeCount(postId)`, `getPostLikes(postId)`, and `getAllStories()` query functions
2. Regenerate `backend.d.ts` bindings
3. Add `useGetLikeCount`, `useGetPostLikes`, `useGetAllStories` hooks to `useQueries.ts`
4. Update `PostCard` to use real like count and liked state from backend
5. Rebuild `StoriesRow` to: fetch all active stories, render real user bubbles, add story creation modal
6. Validate and deploy
