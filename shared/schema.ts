import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  displayName: varchar("display_name", { length: 100 }),
  bio: text("bio"),
  avatar: text("avatar"),
  isVerified: boolean("is_verified").default(false),
  isPremium: boolean("is_premium").default(false),
  premiumExpiresAt: timestamp("premium_expires_at"),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).default("0.00"),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  postsCount: integer("posts_count").default(0),
  isActive: boolean("is_active").default(true),
  isBanned: boolean("is_banned").default(false),
  bannedUntil: timestamp("banned_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 50 }),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  sharesCount: integer("shares_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 50 }),
  backgroundColor: varchar("background_color", { length: 7 }),
  viewsCount: integer("views_count").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }),
  commentId: integer("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  followingId: integer("following_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  isGroup: boolean("is_group").default(false),
  name: varchar("name", { length: 100 }),
  lastMessageId: integer("last_message_id"),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  senderId: integer("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 50 }),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  images: jsonb("images").$type<string[]>().default([]),
  condition: varchar("condition", { length: 50 }),
  location: varchar("location", { length: 200 }),
  isActive: boolean("is_active").default(true),
  isSold: boolean("is_sold").default(false),
  viewsCount: integer("views_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // deposit, withdraw, transfer, boost, premium
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  referenceId: varchar("reference_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("completed"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  reportedUserId: integer("reported_user_id").references(() => users.id, { onDelete: "cascade" }),
  reportedPostId: integer("reported_post_id").references(() => posts.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, reviewed, resolved
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const storyViews = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  viewerId: integer("viewer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  stories: many(stories),
  comments: many(comments),
  likes: many(likes),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
  products: many(products),
  walletTransactions: many(walletTransactions),
  reports: many(reports, { relationName: "reporter" }),
  reportedReports: many(reports, { relationName: "reported" }),
  sentMessages: many(messages),
  storyViews: many(storyViews),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
}));

export const storiesRelations = relations(stories, ({ one, many }) => ({
  user: one(users, {
    fields: [stories.userId],
    references: [users.id],
  }),
  views: many(storyViews),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  likes: many(likes),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [likes.commentId],
    references: [comments.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  reportedUser: one(users, {
    fields: [reports.reportedUserId],
    references: [users.id],
    relationName: "reported",
  }),
  reportedPost: one(posts, {
    fields: [reports.reportedPostId],
    references: [posts.id],
  }),
}));

export const storyViewsRelations = relations(storyViews, ({ one }) => ({
  story: one(stories, {
    fields: [storyViews.storyId],
    references: [stories.id],
  }),
  viewer: one(users, {
    fields: [storyViews.viewerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  viewsCount: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  likesCount: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  readAt: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  viewsCount: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type StoryView = typeof storyViews.$inferSelect;
