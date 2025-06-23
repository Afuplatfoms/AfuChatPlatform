# AfuChat - Mobile-First Social Platform

A comprehensive social media platform built with modern web technologies, featuring real-time messaging, social posts, stories, marketplace, and digital wallet functionality.

## 🚀 Features

- **Social Media**: Create posts, share stories, like and comment
- **Real-time Chat**: WebSocket-powered messaging with presence indicators
- **User Profiles**: Customizable profiles with analytics dashboard
- **Follow System**: Follow/unfollow users with relationship tracking
- **Digital Wallet**: Internal transaction system with balance management
- **Marketplace**: Buy and sell digital products
- **Mobile-First Design**: Optimized for mobile devices with responsive design
- **Dark/Light Theme**: Toggle between themes with persistent preferences

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and build tooling
- **Tailwind CSS** + **shadcn/ui** for styling
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **Framer Motion** for animations

### Backend
- **Node.js** with **Express.js**
- **TypeScript** with ES modules
- **PostgreSQL** database with **Drizzle ORM**
- **Passport.js** for authentication
- **WebSocket** for real-time communication
- **Zod** for validation

## 🏗 Architecture

- **Session-based Authentication**: Secure login with scrypt password hashing
- **Real-time Communication**: WebSocket server for live messaging
- **Type-safe API**: Full TypeScript coverage with shared schemas
- **Mobile-first Responsive**: Progressive enhancement for larger screens
- **Modular Components**: Reusable UI components with consistent design

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd afuchat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Required environment variables
   DATABASE_URL=postgresql://username:password@host:port/database
   SESSION_SECRET=your-session-secret-key
   NODE_ENV=development
   ```

4. **Push database schema**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

### Railway
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push

### Netlify (Frontend only)
1. Connect repository to Netlify
2. Build command: `npm run build:frontend`
3. Publish directory: `dist`
4. Set environment variables:
   - `VITE_API_BASE_URL`: Your backend API URL (e.g., Railway deployment)
   - `VITE_WS_HOST`: Your WebSocket host

**Important**: For full functionality, deploy the backend separately on Railway or another platform and update the environment variables.

### Docker
```bash
docker build -t afuchat .
docker run -p 5000:5000 -e DATABASE_URL=<your-db-url> afuchat
```

## 📝 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Posts & Social
- `GET /api/posts` - Get feed posts
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/like` - Toggle like on post
- `GET /api/posts/:id/comments` - Get post comments

### Messaging
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id/messages` - Get conversation messages

### User Management
- `GET /api/users/:id` - Get user profile
- `PATCH /api/user/profile` - Update user profile
- `POST /api/users/:id/follow` - Follow/unfollow user

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## 🌟 Key Features Explained

### Real-time Messaging
WebSocket connections provide instant messaging with connection status indicators and presence awareness.

### Mobile-First Design
Bottom navigation, swipe gestures, and touch-optimized interfaces ensure excellent mobile experience.

### Digital Wallet
Users can manage internal currency for marketplace transactions and premium features.

### Stories System
24-hour expiring content similar to Instagram/Snapchat stories.

### Analytics Dashboard
User profiles include engagement metrics and content performance analytics.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@afuchat.com or join our Discord community.