import { 
  users, posts, stories, comments, likes, follows, conversations, 
  conversationParticipants, messages, products, walletTransactions, 
  reports, storyViews,
  type User, type InsertUser, type Post, type InsertPost, 
  type Story, type InsertStory, type Comment, type InsertComment,
  type Message, type InsertMessage, type Product, type InsertProduct,
  type Conversation, type Follow, type Like
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, gt, count, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Posts
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getFeedPosts(userId: number, limit?: number, offset?: number): Promise<Post[]>;
  getUserPosts(userId: number, limit?: number, offset?: number): Promise<Post[]>;
  deletePost(id: number): Promise<void>;
  
  // Stories
  createStory(story: InsertStory): Promise<Story>;
  getActiveStories(userId: number): Promise<Story[]>;
  deleteExpiredStories(): Promise<void>;
  
  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getPostComments(postId: number): Promise<Comment[]>;
  
  // Likes
  toggleLike(userId: number, postId?: number, commentId?: number): Promise<{ liked: boolean }>;
  
  // Follows
  toggleFollow(followerId: number, followingId: number): Promise<{ following: boolean }>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  
  // Messages & Conversations
  createConversation(participants: number[]): Promise<Conversation>;
  getConversation(userId1: number, userId2: number): Promise<Conversation | undefined>;
  getUserConversations(userId: number): Promise<Conversation[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  
  // Products
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(category?: string, limit?: number, offset?: number): Promise<Product[]>;
  getUserProducts(userId: number): Promise<Product[]>;
  
  // Wallet
  updateWalletBalance(userId: number, amount: string, type: string, description?: string): Promise<void>;
  getWalletTransactions(userId: number): Promise<any[]>;
  
  // Search
  searchUsers(query: string): Promise<User[]>;
  searchPosts(query: string): Promise<Post[]>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    
    // Update user posts count
    await db
      .update(users)
      .set({ 
        postsCount: sql`${users.postsCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(users.id, post.userId));
    
    return newPost;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async getFeedPosts(userId: number, limit = 20, offset = 0): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.isActive, true))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUserPosts(userId: number, limit = 20, offset = 0): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(and(eq(posts.userId, userId), eq(posts.isActive, true)))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async deletePost(id: number): Promise<void> {
    await db
      .update(posts)
      .set({ isActive: false })
      .where(eq(posts.id, id));
  }

  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db
      .insert(stories)
      .values(story)
      .returning();
    return newStory;
  }

  async getActiveStories(userId: number): Promise<Story[]> {
    return await db
      .select()
      .from(stories)
      .where(and(
        eq(stories.isActive, true),
        gt(stories.expiresAt, new Date())
      ))
      .orderBy(desc(stories.createdAt));
  }

  async deleteExpiredStories(): Promise<void> {
    await db
      .update(stories)
      .set({ isActive: false })
      .where(and(
        eq(stories.isActive, true),
        sql`${stories.expiresAt} < NOW()`
      ));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    
    // Update post comments count
    await db
      .update(posts)
      .set({ 
        commentsCount: sql`${posts.commentsCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, comment.postId));
    
    return newComment;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.isActive, true)))
      .orderBy(asc(comments.createdAt));
  }

  async toggleLike(userId: number, postId?: number, commentId?: number): Promise<{ liked: boolean }> {
    const whereClause = postId 
      ? and(eq(likes.userId, userId), eq(likes.postId, postId))
      : and(eq(likes.userId, userId), eq(likes.commentId, commentId!));
    
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(whereClause);

    if (existingLike) {
      // Unlike
      await db.delete(likes).where(eq(likes.id, existingLike.id));
      
      // Update count
      if (postId) {
        await db
          .update(posts)
          .set({ likesCount: sql`${posts.likesCount} - 1` })
          .where(eq(posts.id, postId));
      } else if (commentId) {
        await db
          .update(comments)
          .set({ likesCount: sql`${comments.likesCount} - 1` })
          .where(eq(comments.id, commentId));
      }
      
      return { liked: false };
    } else {
      // Like
      await db.insert(likes).values({
        userId,
        postId: postId || null,
        commentId: commentId || null,
      });
      
      // Update count
      if (postId) {
        await db
          .update(posts)
          .set({ likesCount: sql`${posts.likesCount} + 1` })
          .where(eq(posts.id, postId));
      } else if (commentId) {
        await db
          .update(comments)
          .set({ likesCount: sql`${comments.likesCount} + 1` })
          .where(eq(comments.id, commentId));
      }
      
      return { liked: true };
    }
  }

  async toggleFollow(followerId: number, followingId: number): Promise<{ following: boolean }> {
    const [existingFollow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));

    if (existingFollow) {
      // Unfollow
      await db.delete(follows).where(eq(follows.id, existingFollow.id));
      
      // Update counts
      await db
        .update(users)
        .set({ followingCount: sql`${users.followingCount} - 1` })
        .where(eq(users.id, followerId));
      
      await db
        .update(users)
        .set({ followersCount: sql`${users.followersCount} - 1` })
        .where(eq(users.id, followingId));
      
      return { following: false };
    } else {
      // Follow
      await db.insert(follows).values({
        followerId,
        followingId,
      });
      
      // Update counts
      await db
        .update(users)
        .set({ followingCount: sql`${users.followingCount} + 1` })
        .where(eq(users.id, followerId));
      
      await db
        .update(users)
        .set({ followersCount: sql`${users.followersCount} + 1` })
        .where(eq(users.id, followingId));
      
      return { following: true };
    }
  }

  async getFollowers(userId: number): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
        isVerified: users.isVerified,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
  }

  async getFollowing(userId: number): Promise<User[]> {
    return await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatar,
        isVerified: users.isVerified,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
  }

  async createConversation(participants: number[]): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values({})
      .returning();

    // Add participants
    await db.insert(conversationParticipants).values(
      participants.map(userId => ({
        conversationId: conversation.id,
        userId,
      }))
    );

    return conversation;
  }

  async getConversation(userId1: number, userId2: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .innerJoin(
        conversationParticipants,
        eq(conversations.id, conversationParticipants.conversationId)
      )
      .where(
        and(
          eq(conversations.isGroup, false),
          or(
            eq(conversationParticipants.userId, userId1),
            eq(conversationParticipants.userId, userId2)
          )
        )
      )
      .groupBy(conversations.id)
      .having(sql`count(*) = 2`);

    return conversation || undefined;
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .innerJoin(
        conversationParticipants,
        eq(conversations.id, conversationParticipants.conversationId)
      )
      .where(eq(conversationParticipants.userId, userId))
      .orderBy(desc(conversations.lastActivity));
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();

    // Update conversation last activity
    await db
      .update(conversations)
      .set({ 
        lastMessageId: newMessage.id,
        lastActivity: new Date()
      })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async getProducts(category?: string, limit = 20, offset = 0): Promise<Product[]> {
    const whereClause = category 
      ? and(eq(products.isActive, true), eq(products.category, category))
      : eq(products.isActive, true);

    return await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUserProducts(userId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.sellerId, userId), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt));
  }

  async updateWalletBalance(userId: number, amount: string, type: string, description?: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Update balance
      await tx
        .update(users)
        .set({ 
          walletBalance: sql`${users.walletBalance} + ${amount}`,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Create transaction record
      await tx.insert(walletTransactions).values({
        userId,
        type,
        amount,
        description,
        status: 'completed',
      });
    });
  }

  async getWalletTransactions(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt));
  }

  async searchUsers(query: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isActive, true),
          or(
            sql`${users.username} ILIKE ${`%${query}%`}`,
            sql`${users.displayName} ILIKE ${`%${query}%`}`
          )
        )
      )
      .limit(20);
  }

  async searchPosts(query: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.isActive, true),
          sql`${posts.content} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(posts.createdAt))
      .limit(20);
  }
}

export const storage = new DatabaseStorage();
