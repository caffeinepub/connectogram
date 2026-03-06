# Connectogram

## Current State
- Backend has full user, post, story, messaging, follow, like, comment, notification system in Motoko
- `sendMessage`, `getMessages`, `getConversations` endpoints exist and are functional
- `getUser`, `getUserProfile` endpoints exist for fetching individual users
- No `getAllUsers` or `searchUsers` endpoint exists
- Frontend MessagesPage has hardcoded DEMO_CONVERSATIONS and DEMO_MESSAGES arrays with fake users (sofia.art, alex.dev, maya.web3)
- Frontend MessagesPage falls back to demo conversations/messages when real backend data is empty
- Frontend FeedPage has SAMPLE_POSTS with hardcoded dummy creator principals
- Frontend ExplorePage has SAMPLE_EXPLORE_POSTS with dummy creators and local image paths
- Frontend ExplorePage search only filters posts by caption/hashtag, no user search
- Frontend ProfilePage has SAMPLE_POSTS_BY_USER fallback data

## Requested Changes (Diff)

### Add
- Backend: `getAllUsers()` query returning all registered User records
- Backend: `searchUsers(query: Text)` query returning users whose username contains the query string (case-insensitive)
- Frontend hook: `useGetAllUsers()` and `useSearchUsers(query)`
- Frontend ExplorePage: "People" search tab that searches real users by username; shows user cards with avatar, username, bio, and a "Message" button that navigates to that user's conversation
- Frontend MessagesPage: "New Message" button to start a conversation with any registered user (search by username)

### Modify
- Frontend MessagesPage: Remove DEMO_CONVERSATIONS and DEMO_MESSAGES constants entirely; show only real on-chain conversations; fetch and display actual usernames/avatars from backend for each conversation partner; show empty state when no conversations exist
- Frontend FeedPage: Remove SAMPLE_POSTS fallback; show empty state when no posts exist
- Frontend ExplorePage: Remove SAMPLE_EXPLORE_POSTS and SAMPLE_HASHTAGS fallbacks; show only real posts and real trending hashtags; user search integrated into explore search bar (toggle between Posts and People tabs)
- Frontend ProfilePage: Remove SAMPLE_POSTS_BY_USER fallback; show real empty state

### Remove
- DEMO_CONVERSATIONS array in MessagesPage
- DEMO_MESSAGES function in MessagesPage
- SAMPLE_POSTS in FeedPage
- SAMPLE_EXPLORE_POSTS and SAMPLE_HASHTAGS in ExplorePage
- SAMPLE_POSTS_BY_USER in ProfilePage

## Implementation Plan
1. Add `getAllUsers()` and `searchUsers(query)` Motoko endpoints
2. Update backend.d.ts to include new methods
3. Add `useGetAllUsers` and `useSearchUsers` hooks in useQueries.ts
4. Remove DEMO_CONVERSATIONS, DEMO_MESSAGES from MessagesPage; wire to real backend only; add "New Message" dialog with user search
5. Add conversation partner name/avatar resolution using real user profiles
6. Remove SAMPLE_POSTS from FeedPage; show true empty state
7. Refactor ExplorePage to add People/Posts tabs in search; remove SAMPLE_EXPLORE_POSTS; user search calls searchUsers API
8. Remove SAMPLE_POSTS_BY_USER from ProfilePage
