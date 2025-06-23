import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertPostSchema, insertStorySchema, insertCommentSchema, insertMessageSchema, insertProductSchema } from "@shared/schema";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }

  // Posts routes
  app.post("/api/posts", requireAuth, async (req, res, next) => {
    try {
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/posts/feed", requireAuth, async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getFeedPosts(req.user.id, limit, offset);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/posts/user/:userId", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getUserPosts(userId, limit, offset);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/posts/:postId/like", requireAuth, async (req, res, next) => {
    try {
      const postId = parseInt(req.params.postId);
      const result = await storage.toggleLike(req.user.id, postId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Comments routes
  app.post("/api/posts/:postId/comments", requireAuth, async (req, res, next) => {
    try {
      const postId = parseInt(req.params.postId);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId,
        userId: req.user.id,
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/posts/:postId/comments", async (req, res, next) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  });

  // Stories routes
  app.post("/api/stories", requireAuth, async (req, res, next) => {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now
      
      const storyData = insertStorySchema.parse({
        ...req.body,
        userId: req.user.id,
        expiresAt,
      });
      
      const story = await storage.createStory(storyData);
      res.status(201).json(story);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/stories", requireAuth, async (req, res, next) => {
    try {
      const stories = await storage.getActiveStories(req.user.id);
      res.json(stories);
    } catch (error) {
      next(error);
    }
  });

  // Follow routes
  app.post("/api/users/:userId/follow", requireAuth, async (req, res, next) => {
    try {
      const followingId = parseInt(req.params.userId);
      
      if (followingId === req.user.id) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const result = await storage.toggleFollow(req.user.id, followingId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:userId/followers", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:userId/following", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      next(error);
    }
  });

  // Conversations and Messages routes
  app.get("/api/conversations", requireAuth, async (req, res, next) => {
    try {
      const conversations = await storage.getUserConversations(req.user.id);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/conversations", requireAuth, async (req, res, next) => {
    try {
      const { participantId } = req.body;
      
      // Check if conversation already exists
      let conversation = await storage.getConversation(req.user.id, participantId);
      
      if (!conversation) {
        conversation = await storage.createConversation([req.user.id, participantId]);
      }
      
      res.json(conversation);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/conversations/:conversationId/messages", requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  // Products routes
  app.post("/api/products", requireAuth, async (req, res, next) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: req.user.id,
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products", async (req, res, next) => {
    try {
      const category = req.query.category as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const products = await storage.getProducts(category, limit, offset);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  // Search routes
  app.get("/api/search/users", async (req, res, next) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      
      const users = await storage.searchUsers(query);
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/search/posts", async (req, res, next) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      
      const posts = await storage.searchPosts(query);
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  // Wallet routes
  app.get("/api/wallet/transactions", requireAuth, async (req, res, next) => {
    try {
      const transactions = await storage.getWalletTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/wallet/deposit", requireAuth, async (req, res, next) => {
    try {
      const { amount } = req.body;
      await storage.updateWalletBalance(req.user.id, amount, "deposit", "Wallet deposit");
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server for real-time chat
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          // Handle authentication via session
          // In a real implementation, you'd validate the session/token
          ws.userId = message.userId;
          ws.send(JSON.stringify({ type: 'auth', success: true }));
        }
        
        if (message.type === 'message' && ws.userId) {
          const messageData = insertMessageSchema.parse({
            conversationId: message.conversationId,
            senderId: ws.userId,
            content: message.content,
          });
          
          const newMessage = await storage.sendMessage(messageData);
          
          // Broadcast to all clients in the conversation
          wss.clients.forEach((client: AuthenticatedWebSocket) => {
            if (client.readyState === WebSocket.OPEN && client.userId) {
              client.send(JSON.stringify({
                type: 'message',
                message: newMessage,
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return httpServer;
}
