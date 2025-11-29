# 🗨️ TalkSphere - Real-Time Chat Application

> A feature-rich, real-time chat application built with the MERN stack. TalkSphere enables users to register, log in, find other users, and engage in one-on-one or group conversations with a modern, responsive user interface.

---

## ✨ Features

### 🔐 Authentication & User Management
* **Secure Registration & Login** - User registration and login with bcrypt password hashing
* **Google OAuth Integration** - Sign in seamlessly with Google accounts
* **Password Reset via Email** - OTP-based password recovery using Nodemailer
* **JWT Authentication** - Secure token-based authentication for API routes
* **Profile Management** - Update profile picture, name, and password
* **Username Generation** - Automatic unique username generation from email

### 💬 Real-Time Messaging
* **One-on-One Chats** - Private conversations between two users
* **Group Chats** - Create and manage group conversations with multiple users
* **Real-Time Message Delivery** - Instant message transmission using Socket.IO
* **Typing Indicators** - See when other users are typing in real-time
* **Message Editing** - Edit your sent messages
* **Message Deletion** - Delete your messages from the chat
* **Reply to Messages** - Reply to specific messages in a conversation

### 📌 Message Interactions
* **Emoji Reactions** - React to messages with emojis
* **Star Messages** - Mark important messages for quick reference
* **Pin Messages** - Pin important messages within a chat for easy access
* **Emoji Picker** - Built-in emoji picker for expressive messaging

### 👥 User Experience
* **User Search** - Find and start conversations with new users by name or email
* **Online/Offline Presence** - Real-time user presence indicators
* **Toast Notifications** - Instant alerts for new messages using react-toastify
* **Responsive Design** - Fully responsive UI for desktop and mobile devices

### ⚙️ Group Chat Management
* **Create Group Chats** - Form groups with multiple users
* **Rename Groups** - Update group chat names
* **Add/Remove Members** - Manage group membership
* **Group Admin Controls** - Admin privileges for group creators

### 🛡️ Admin Panel
* **User Management** - View, update roles, and delete users
* **Statistics Dashboard** - View user and chat statistics
* **Chat Management** - Administrative overview of all chats
* **Announcements** - System-wide announcement capabilities

---

## 🛠️ How It Was Made

### Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | `React 19`, `Vite`, `React Router v7`, `Axios`, `Socket.IO Client` |
| **Backend** | `Node.js`, `Express 5`, `Mongoose`, `Socket.IO` |
| **Database** | `MongoDB` |
| **Authentication** | `JSON Web Tokens (JWT)`, `bcryptjs`, `Google OAuth 2.0` |
| **Email Service** | `Nodemailer` with Gmail SMTP |
| **UI Components** | `react-icons`, `emoji-picker-react`, `react-toastify` |
| **Security** | `Helmet`, `CORS` |
| **Deployment** | **Vercel** (Frontend), **Render** (Backend) |

### Architecture Overview

```
TalkSphere/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components (ChatBox, ChatList, Modals)
│   │   ├── pages/         # Page components (Login, Register, Chat, Admin)
│   │   ├── context/       # React Context for global state (Auth, Chat, Socket)
│   │   ├── services/      # API service functions
│   │   ├── hooks/         # Custom React hooks
│   │   └── styles/        # CSS stylesheets
│   └── public/            # Static assets
│
├── backend/               # Node.js + Express server
│   ├── config/            # Configuration files (JWT generation, DB connection)
│   ├── controllers/       # Route handlers (user, chat, message)
│   ├── middleware/        # Auth middleware, admin checks
│   ├── models/            # Mongoose schemas (User, Chat, Message)
│   ├── routes/            # API route definitions
│   ├── socket.js          # Socket.IO event handlers
│   └── server.js          # Express server entry point
```

### Key Implementation Details

* **Real-Time Communication:** WebSocket connections via Socket.IO enable instant message delivery, typing indicators, and presence updates
* **State Management:** React Context API manages authentication state, chat data, and socket connections
* **RESTful APIs:** Express.js handles user authentication, chat operations, and message management
* **Database Design:** MongoDB with Mongoose ODM for flexible document storage of users, chats, and messages
* **Security:** JWT tokens protect API routes, bcrypt hashes passwords, and Helmet secures HTTP headers

---

## 🚀 Development Roadmap

> **Overall Status:** `(43/43 tasks complete)` - **100% Progress**

### 🔐 Phase 1: Backend Foundation & Authentication
> **Progress: (10/10) - 100% Complete**
>
> * ✅ Initialize Git repository and project structure (`backend`/`frontend`).
> * ✅ Set up Express server with dependencies like `express`, `mongoose`, `dotenv`.
> * ✅ Define MongoDB Schemas for `User`, `Chat`, and `Message`.
> * ✅ Establish connection to the MongoDB database.
> * ✅ Implement user registration and login controllers using `bcrypt` for hashing.
> * ✅ Create a JWT generation utility for authentication.
> * ✅ Define API routes for user authentication: `POST /api/user/register` & `POST /api/user/login`.
> * ✅ Create JWT verification middleware to protect routes.
> * ✅ Implement the user search API endpoint: `GET /api/user?search=...`.
> * ✅ Test all authentication and user endpoints.

### 🎨 Phase 2: Frontend Setup & Chat APIs
> **Progress: (10/10) - 100% Complete**
>
> #### **Frontend**
> * ✅ Initialize React project with dependencies: `axios`, `react-router-dom`.
> * ✅ Configure styling using CSS variables for a themed interface.
> * ✅ Set up frontend folder structure (`pages`, `components`, `context`) and routing.
> * ✅ Create `AuthContext` to manage global user state.
> * ✅ Build the UI for Login, Register, and Forgot Password pages.
> * ✅ Connect authentication forms to backend APIs using `axios`.
> * ✅ Implement a protected route system for authenticated routes.
>
> #### **Backend**
> * ✅ Create REST APIs for Chat management (e.g., `POST /api/chat`, `GET /api/chat`).
> * ✅ Create REST APIs for Message management (e.g., `POST /api/message`, `GET /api/message/:chatId`).
> * ✅ Secure all new Chat and Message routes with JWT middleware.

### ⚡ Phase 3: Real-Time Integration & UI
> **Progress: (10/10) - 100% Complete**
>
> #### **Backend**
> * ✅ Install `socket.io` and integrate with the Express server.
> * ✅ Implement initial socket logic: `connection` event creates a user-specific room.
> * ✅ Handle `new message` event: Save to DB and broadcast to the correct chat room.
>
> #### **Frontend**
> * ✅ Install `socket.io-client` library.
> * ✅ Establish and manage socket connection via Context after user login.
> * ✅ Build the main `ChatPage` UI layout, including `ChatList` and `ChatBox` components.
> * ✅ Fetch and render the user's existing chats into the `ChatList`.
> * ✅ Emit `new message` event to the server from the `ChatBox`.
> * ✅ Create a `message received` listener to update the chat UI in real-time.
> * ✅ Implement `typing` and `stop typing` indicators.
> * ✅ Integrate `react-toastify` to show notifications for new messages.

### 🚢 Phase 4: Final Features, Testing & Deployment
> **Progress: (10/10) - 100% Complete**
>
> #### **Features & UI/UX**
> * ✅ Implement the User Search UI to find and start chats with new users.
> * ✅ Build modals for Group Chat Creation and User Profile Updates.
> * ✅ Implement Online/Offline user presence indicators.
>
> #### **Admin & Quality Assurance**
> * ✅ Implement an Admin role to view all registered users.
> * ✅ Conduct thorough responsive design testing and fix CSS issues.
> * ✅ Perform complete end-to-end testing of all application features and fix bugs.
>
> #### **Deployment**
> * ✅ Finalize production `.env` files with Render/Vercel URLs and secrets.
> * ✅ **Deploy Backend:** Deploy the Node.js/Express application to **Render**.
> * ✅ **Deploy Frontend:** Deploy the React application to **Vercel**.
> * ✅ Conduct final smoke testing on the live production URLs.

### ✨ Phase 5: Advanced Messaging Features
> **Progress: (3/3) - 100% Complete**
>
> * ✅ Implement message reactions.
> * ✅ Implement starring messages.
> * ✅ Implement pinning messages.

---