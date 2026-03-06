import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  // TYPES
  public type UserProfile = {
    username : Text;
    bio : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  public type User = {
    id : Principal;
    username : Text;
    bio : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  public type Post = {
    id : Nat;
    creator : Principal;
    image : Storage.ExternalBlob;
    caption : Text;
    hashtags : [Text];
    timestamp : Time.Time;
  };

  public type Comment = {
    id : Nat;
    postId : Nat;
    userId : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  public type Story = {
    id : Nat;
    userId : Principal;
    image : Storage.ExternalBlob;
    text : Text;
    createdAt : Time.Time;
  };

  public type Message = {
    id : Nat;
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type Notification = {
    id : Nat;
    userId : Principal;
    fromUser : Principal;
    notificationType : {
      #like;
      #comment;
      #follow;
    };
    postId : ?Nat;
    isRead : Bool;
    timestamp : Time.Time;
  };

  // FUNCTIONAL MODULES
  module Post {
    public func compareByNewestFirst(p1 : Post, p2 : Post) : Order.Order {
      if (p1.timestamp > p2.timestamp) { #less } else if (p1.timestamp < p2.timestamp) {
        #greater;
      } else { #equal };
    };
  };

  module Story {
    public func compareByNewestFirst(s1 : Story, s2 : Story) : Order.Order {
      if (s1.createdAt > s2.createdAt) { #less } else if (s1.createdAt < s2.createdAt) {
        #greater;
      } else { #equal };
    };
  };

  // STATE
  let users = Map.empty<Principal, User>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Nat, Post>();
  let comments = Map.empty<Nat, Comment>();
  let stories = Map.empty<Nat, Story>();
  let messages = Map.empty<Nat, Message>();
  let notifications = Map.empty<Nat, Notification>();
  let followers = Map.empty<Principal, Set.Set<Principal>>();
  let postLikes = Map.empty<Nat, Set.Set<Principal>>();
  var postCounter = 0;
  var commentCounter = 0;
  var storyCounter = 0;
  var messageCounter = 0;
  var notificationCounter = 0;

  // AUTHORIZATION
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // PROFILE MANAGEMENT (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // USER MANAGEMENT
  public shared ({ caller }) func registerUser(username : Text, bio : Text, profilePicture : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    if (users.containsKey(caller)) { Runtime.trap("User already registered") };

    let user : User = {
      id = caller;
      username;
      bio;
      profilePicture;
    };

    users.add(caller, user);

    // Also save to userProfiles for frontend compatibility
    let profile : UserProfile = {
      username;
      bio;
      profilePicture;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUser(user : Principal) : async User {
    // Public query - anyone can view user profiles
    switch (users.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };
  };

  public shared ({ caller }) func updateUser(bio : Text, profilePicture : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    let user = switch (users.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };

    let newUser = {
      user with
      bio;
      profilePicture;
    };
    users.add(caller, newUser);

    // Update userProfiles as well
    let profile : UserProfile = {
      username = user.username;
      bio;
      profilePicture;
    };
    userProfiles.add(caller, profile);
  };

  // POST MANAGEMENT
  public shared ({ caller }) func createPost(image : Storage.ExternalBlob, caption : Text, hashtags : [Text]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    if (not users.containsKey(caller)) {
      Runtime.trap("User does not exist");
    };

    postCounter += 1;
    let postId = postCounter;
    let post : Post = {
      id = postId;
      creator = caller;
      image;
      caption;
      hashtags;
      timestamp = Time.now();
    };

    posts.add(postId, post);
    postId;
  };

  public query ({ caller }) func getPost(postId : Nat) : async Post {
    // Public query - anyone can view posts
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) { post };
    };
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [Post] {
    // Public query - anyone can view user's posts
    let userPosts = posts.values().filter(
      func(p) { p.creator == user }
    ).toArray();
    userPosts.sort(Post.compareByNewestFirst);
  };

  public query ({ caller }) func getPosts() : async [Post] {
    // Public query - anyone can view all posts
    let allPosts = posts.values().toArray();
    allPosts.sort(Post.compareByNewestFirst);
  };

  // STORY MANAGEMENT
  public shared ({ caller }) func createStory(image : Storage.ExternalBlob, text : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };

    storyCounter += 1;
    let storyId = storyCounter;
    let story : Story = {
      id = storyId;
      userId = caller;
      image;
      text;
      createdAt = Time.now();
    };

    stories.add(storyId, story);
    storyId;
  };

  public query ({ caller }) func getActiveStories(user : Principal) : async [Story] {
    // Public query - anyone can view active stories
    let now = Time.now();
    let storyList = List.empty<Story>();

    for (story in stories.values()) {
      if (story.userId == user and now - story.createdAt < 24 * 60 * 60 * 1_000_000_000) {
        storyList.add(story);
      };
    };

    storyList.toArray().sort(Story.compareByNewestFirst);
  };

  // FOLLOW MANAGEMENT
  public shared ({ caller }) func followUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    if (caller == user) { Runtime.trap("Cannot follow yourself") };
    if (not users.containsKey(user)) { Runtime.trap("Target user not found") };

    var followerSet = switch (followers.get(user)) {
      case (?set) { set };
      case (null) {
        let newSet = Set.empty<Principal>();
        followers.add(user, newSet);
        newSet;
      };
    };
    if (followerSet.contains(caller)) { Runtime.trap("Already following user") };
    followerSet.add(caller);

    notificationCounter += 1;
    let notif : Notification = {
      id = notificationCounter;
      userId = user;
      fromUser = caller;
      notificationType = #follow;
      postId = null;
      isRead = false;
      timestamp = Time.now();
    };
    notifications.add(notificationCounter, notif);
  };

  public shared ({ caller }) func unfollowUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    let followerSet = switch (followers.get(user)) {
      case (null) { Runtime.trap("Not following user") };
      case (?set) { set };
    };
    if (not followerSet.contains(caller)) { Runtime.trap("Not following user") };
    followerSet.remove(caller);
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    // Public query - anyone can view followers
    switch (followers.get(user)) {
      case (null) {
        [];
      };
      case (?set) {
        set.toArray();
      };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    // Public query - anyone can view who a user follows
    let following = List.empty<Principal>();
    for ((followedUser, followerSet) in followers.entries()) {
      if (followerSet.contains(user)) {
        following.add(followedUser);
      };
    };
    following.toArray();
  };

  // LIKE MANAGEMENT
  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) { post };
    };

    switch (postLikes.get(postId)) {
      case (null) {
        let newSet = Set.empty<Principal>();
        newSet.add(caller);
        postLikes.add(postId, newSet);
      };
      case (?set) {
        if (set.contains(caller)) { Runtime.trap("Already liked post") };
        set.add(caller);
      };
    };

    // Don't notify if liking own post
    if (post.creator != caller) {
      notificationCounter += 1;
      let notif : Notification = {
        id = notificationCounter;
        userId = post.creator;
        fromUser = caller;
        notificationType = #like;
        postId = ?postId;
        isRead = false;
        timestamp = Time.now();
      };
      notifications.add(notificationCounter, notif);
    };
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };

    switch (postLikes.get(postId)) {
      case (null) { Runtime.trap("Post has no likes") };
      case (?set) {
        if (not set.contains(caller)) { Runtime.trap("Post not liked yet") };
        set.remove(caller);
      };
    };
  };

  // COMMENT MANAGEMENT
  public shared ({ caller }) func addComment(postId : Nat, text : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post does not exist") };
      case (?post) { post };
    };

    commentCounter += 1;
    let commentId = commentCounter;
    let comment : Comment = {
      id = commentId;
      postId;
      userId = caller;
      text;
      timestamp = Time.now();
    };

    comments.add(commentId, comment);

    // Don't notify if commenting on own post
    if (post.creator != caller) {
      notificationCounter += 1;
      let notif : Notification = {
        id = notificationCounter;
        userId = post.creator;
        fromUser = caller;
        notificationType = #comment;
        postId = ?postId;
        isRead = false;
        timestamp = Time.now();
      };
      notifications.add(notificationCounter, notif);
    };

    commentId;
  };

  public query ({ caller }) func getComments(postId : Nat) : async [Comment] {
    // Public query - anyone can view comments
    comments.values().filter(
      func(c) { c.postId == postId }
    ).toArray();
  };

  // MESSAGING
  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (caller == recipient) { Runtime.trap("Cannot send message to yourself") };
    if (not users.containsKey(recipient)) { Runtime.trap("Recipient does not exist") };

    messageCounter += 1;
    let message : Message = {
      id = messageCounter;
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
    };

    messages.add(messageCounter, message);
  };

  public query ({ caller }) func getMessages(user : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    // Only allow viewing messages where caller is a participant
    messages.values().filter(
      func(m) { (m.sender == caller and m.recipient == user) or (m.sender == user and m.recipient == caller) }
    ).toArray();
  };

  public query ({ caller }) func getConversations() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    let conversations = Set.empty<Principal>();
    for (msg in messages.values()) {
      if (msg.sender == caller) { conversations.add(msg.recipient) };
      if (msg.recipient == caller) { conversations.add(msg.sender) };
    };
    conversations.toArray();
  };

  // NOTIFICATIONS
  public shared ({ caller }) func createNotification(userId : Principal, fromUser : Principal, notificationType : { #like; #comment; #follow }, postId : ?Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create notifications");
    };

    notificationCounter += 1;
    let notif : Notification = {
      id = notificationCounter;
      userId;
      fromUser;
      notificationType;
      postId;
      isRead = false;
      timestamp = Time.now();
    };
    notifications.add(notificationCounter, notif);
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    // Only return notifications for the caller
    notifications.values().filter(
      func(n) { n.userId == caller }
    ).toArray();
  };

  public shared ({ caller }) func markNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    let allNotifs = notifications.values();
    for (notif in allNotifs) {
      if (notif.userId == caller and not notif.isRead) {
        let updatedNotif = {
          notif with isRead = true;
        };
        notifications.add(notif.id, updatedNotif);
      };
    };
  };

  // EXPLORE / TRENDING
  public query ({ caller }) func getExplorePosts() : async [Post] {
    // Public query - anyone can explore posts
    let allPosts = posts.values().toArray();
    allPosts.sort(Post.compareByNewestFirst);
  };

  public query ({ caller }) func getTrendingHashtags() : async [Text] {
    // Public query - anyone can view trending hashtags
    ["connectogram", "motoko", "web3", "icp"];
  };
};
