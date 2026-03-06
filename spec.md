# Connectogram

## Current State
- Full social media backend in Motoko: users, posts, stories, follows, likes, comments, messages, notifications
- Internet Identity authentication
- Blob storage for media
- Authorization with role-based access control
- Frontend with dark theme, glassmorphism UI, feed, explore, messaging, notifications pages

## Requested Changes (Diff)

### Add
- **On-chain Post Ownership Certificates**: Each post gets a tamper-proof certificate with creator principal, post hash, and issue timestamp stored permanently on-chain. Users can view and share their certificate.
- **Creator Verification Badges**: Admin or self-attestation flow where users can apply for a verified badge. Badge stored on-chain with verification timestamp and type (e.g. `#creator`, `#brand`, `#official`). Badge visible on profile and posts.
- **Token-Based Engagement System (CGRAM tokens)**: Users earn CGRAM tokens for posting, liking, commenting, following, and receiving likes. Token balances stored on-chain per principal. Token ledger with transfer history. Token balance shown on profile.
- **Post Like Count query**: Public query to get like count per post (needed for token reward triggers).

### Modify
- `createPost` -- also issues an ownership certificate and awards CGRAM tokens to poster
- `likePost` -- also awards CGRAM tokens to liker and to post creator
- `addComment` -- also awards CGRAM tokens to commenter
- `followUser` -- also awards CGRAM tokens to the follower
- `registerUser` -- awards welcome CGRAM tokens on first registration
- User type -- add `isVerified`, `verificationBadge` fields

### Remove
- Nothing removed

## Implementation Plan
1. Add `OwnershipCertificate` type with postId, creator, issuedAt, certificateHash
2. Add `VerificationBadge` type with badgeType (#creator | #brand | #official), issuedAt, issuedBy
3. Add `TokenLedgerEntry` type with from, to, amount, reason, timestamp
4. Add state maps: `certificates`, `verificationBadges`, `tokenBalances`, `tokenLedger`
5. Add `getCertificate(postId)`, `verifyCertificateExists(postId)` queries
6. Add `applyForVerification()` shared (self-apply, stored pending), `grantVerification(user, badgeType)` admin-only
7. Add `getTokenBalance(user)` query, `getTokenLedger(user)` query
8. Internal helper `awardTokens(to, amount, reason)` 
9. Wire token awards into createPost, likePost, addComment, followUser, registerUser
10. Wire certificate issuance into createPost
11. Add `getLikeCount(postId)` public query
12. Frontend: show certificate badge on posts, show token balance on profile, show verified badge on usernames, add certificate viewer modal
