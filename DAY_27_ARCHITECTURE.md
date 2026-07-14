# 🏗️ System Architecture - Day 27 Notifications

## Complete System Overview

```
╔════════════════════════════════════════════════════════════════════════════╗
║                         SMART SUPPLY CHAIN                                 ║
║                    Real-Time Notification System                           ║
╚════════════════════════════════════════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React + Vite)                          │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                        Application Shell                           │   │
│  │                                                                    │   │
│  │  ┌──────────────────────────────────────────────────────────────┐ │   │
│  │  │                    main.jsx                                  │ │   │
│  │  │  ┌─────────────────────────────────────────────────────┐   │ │   │
│  │  │  │ <AuthProvider>                                      │   │ │   │
│  │  │  │   <SocketProvider>  ◄──── Socket Context         │   │ │   │
│  │  │  │     <App />                                        │   │ │   │
│  │  │  │       ├─ /login                                   │   │ │   │
│  │  │  │       ├─ /register                                │   │ │   │
│  │  │  │       ├─ /admin                                   │   │ │   │
│  │  │  │       ├─ /admin/products                          │   │ │   │
│  │  │  │       ├─ /admin/orders                            │   │ │   │
│  │  │  │       ├─ /supplier                                │   │ │   │
│  │  │  │       ├─ /supplier/products                       │   │ │   │
│  │  │  │       ├─ /supplier/orders                         │   │ │   │
│  │  │  │       ├─ /notifications  ◄─── NEW!               │   │ │   │
│  │  │  │       └─ Layout                                   │   │ │   │
│  │  │  │           ├─ Navbar                               │   │ │   │
│  │  │  │           │   └─ NotificationDropdown ◄─── NEW!  │   │ │   │
│  │  │  │           └─ Sidebar                              │   │ │   │
│  │  │  │   </AuthProvider>                                 │   │ │   │
│  │  │  │   </SocketProvider>                               │   │ │   │
│  │  │  └─────────────────────────────────────────────────────┘   │ │   │
│  │  │                                                              │ │   │
│  │  └──────────────────────────────────────────────────────────────┘ │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                      UI Components Layer                           │   │
│  │                                                                    │   │
│  │  NotificationDropdown          NotificationsPage                 │   │
│  │  ├─ Bell Icon                  ├─ Header                         │   │
│  │  ├─ Badge Counter              ├─ Filter Buttons                 │   │
│  │  ├─ Unread List                ├─ Notification List              │   │
│  │  ├─ Mark as Read               ├─ Pagination                     │   │
│  │  ├─ Delete                      ├─ Delete All                     │   │
│  │  └─ View All Link               └─ Back Button                    │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                      Services Layer                               │   │
│  │                                                                    │   │
│  │  ┌──────────────────────────────────────────────────────────────┐ │   │
│  │  │  Socket.IO Client (socket.io-client)                        │ │   │
│  │  │  ├─ Connected to: ws://localhost:5000                       │ │   │
│  │  │  ├─ On Connect: emit 'join' with userId                    │ │   │
│  │  │  ├─ Listen: socket.on('notification')                      │ │   │
│  │  │  └─ Auto Reconnect: exponential backoff                    │ │   │
│  │  └──────────────────────────────────────────────────────────────┘ │   │
│  │                                                                    │   │
│  │  ┌──────────────────────────────────────────────────────────────┐ │   │
│  │  │  Notification Service (API Client)                          │ │   │
│  │  │  ├─ GET /api/notifications?page=1&limit=20                │ │   │
│  │  │  ├─ GET /api/notifications/unread                         │ │   │
│  │  │  ├─ PUT /api/notifications/:id/read                       │ │   │
│  │  │  ├─ PUT /api/notifications/read-all                       │ │   │
│  │  │  ├─ DELETE /api/notifications/:id                         │ │   │
│  │  │  └─ DELETE /api/notifications/delete/all                  │ │   │
│  │  └──────────────────────────────────────────────────────────────┘ │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │ HTTP/REST     │ WebSocket     │ HTTP/REST
                    │               │               │
                    ▼               ▼               ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js + Express)                         │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    Server Configuration                           │   │
│  │                                                                    │   │
│  │  const http = require('http');                                   │   │
│  │  const { Server } = require('socket.io');                        │   │
│  │  const server = http.createServer(app);                          │   │
│  │  const io = new Server(server, { cors: {...} });               │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                   Socket.IO Server                                │   │
│  │                                                                    │   │
│  │  io.on('connection', (socket) => {                              │   │
│  │    socket.on('join', (userId) => {                             │   │
│  │      socket.join(`user-${userId}`);  ◄─── Room: user-1        │   │
│  │    });                                     Room: user-2         │   │
│  │    socket.on('disconnect', () => {...});  Room: user-3         │   │
│  │  });                                                             │   │
│  │                                                                    │   │
│  │  Broadcast Method:                                              │   │
│  │  io.to(`user-${userId}`)                                        │   │
│  │    .emit('notification', {...});                               │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    API Routes Layer                               │   │
│  │                                                                    │   │
│  │  app.use('/api/notifications', notificationRoutes)  ◄─── NEW!    │   │
│  │                                                                    │   │
│  │  Routes:                                                         │   │
│  │  ├─ GET    /  → getAllNotifications                             │   │
│  │  ├─ GET    /unread → getUnreadNotificationsCount               │   │
│  │  ├─ PUT    /:id/read → markNotificationAsRead                  │   │
│  │  ├─ PUT    /read-all → markAllNotificationsAsRead              │   │
│  │  ├─ DELETE /:id → deleteNotificationById                       │   │
│  │  └─ DELETE /delete/all → deleteAllNotificationsForUser         │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    Controllers Layer                              │   │
│  │                                                                    │   │
│  │  Order Controller (UPDATED)                                      │   │
│  │  ├─ createOrder()                                               │   │
│  │  │  ├─ Validate inputs                                          │   │
│  │  │  ├─ Check product & stock                                    │   │
│  │  │  ├─ Create order in DB                                       │   │
│  │  │  ├─ Reduce stock                                             │   │
│  │  │  ├─ ═══ NEW FLOW ═══                                         │   │
│  │  │  ├─ Call notificationService.createNotification()           │   │
│  │  │  │   ├─ For Supplier: SUCCESS type                          │   │
│  │  │  │   └─ For All Admins: INFO type                           │   │
│  │  │  ├─ Emit via Socket.IO                                       │   │
│  │  │  │   ├─ io.to(`user-${userId}`).emit(...)                   │   │
│  │  │  │   └─ io.to(`user-${adminId}`).emit(...)                  │   │
│  │  │  ├─ Check low stock (<10 items)                             │   │
│  │  │  │   └─ If true: Create WARNING notification               │   │
│  │  │  ├─ Enqueue to BullMQ                                        │   │
│  │  │  └─ Return 201 with order                                    │   │
│  │  │                                                                │   │
│  │  Notification Controller (NEW)                                   │   │
│  │  ├─ getAllNotifications()                                       │   │
│  │  ├─ getUnreadNotificationsCount()                              │   │
│  │  ├─ markNotificationAsRead()                                    │   │
│  │  ├─ markAllNotificationsAsRead()                               │   │
│  │  ├─ deleteNotificationById()                                    │   │
│  │  └─ deleteAllNotificationsForUser()                            │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    Services Layer                                 │   │
│  │                                                                    │   │
│  │  Notification Service (NEW)                                      │   │
│  │  ├─ createNotification(userId, title, message, type)           │   │
│  │  ├─ getNotifications(userId, limit, offset)                    │   │
│  │  ├─ getUnreadNotifications(userId)                             │   │
│  │  ├─ getUnreadCount(userId)                                     │   │
│  │  ├─ markAsRead(notificationId)                                 │   │
│  │  ├─ markAllAsRead(userId)                                      │   │
│  │  ├─ deleteNotification(notificationId)                         │   │
│  │  └─ deleteAllNotifications(userId)                             │   │
│  │                                                                    │   │
│  │  Audit Service                                                  │   │
│  │  └─ createAuditLog()                                            │   │
│  │                                                                    │   │
│  │  Email Service                                                  │   │
│  │  └─ sendOrderEmail()                                            │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                    Middleware Layer                               │   │
│  │                                                                    │   │
│  │  authMiddleware  ─┐                                              │   │
│  │  cacheMiddleware │──────────────────────                          │   │
│  │  errorHandler   ─┘                                               │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA PERSISTENCE LAYER                              │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                  PostgreSQL Database                              │   │
│  │                                                                    │   │
│  │  User Table                                                       │   │
│  │  ├─ id (PK)                                                       │   │
│  │  ├─ name, email, password                                        │   │
│  │  ├─ role (ADMIN, SUPPLIER)                                       │   │
│  │  └─ [FOREIGN KEY] notifications                                  │   │
│  │                                                                    │   │
│  │  Notification Table (NEW)                                         │   │
│  │  ├─ id (PK, autoincrement)                                       │   │
│  │  ├─ title (String)                                               │   │
│  │  ├─ message (String)                                             │   │
│  │  ├─ type (String) ─┬─ SUCCESS                                    │   │
│  │  │                  ├─ INFO                                      │   │
│  │  │                  ├─ WARNING                                   │   │
│  │  │                  └─ ERROR                                     │   │
│  │  ├─ isRead (Boolean, default: false)                            │   │
│  │  ├─ userId (FK → User.id, onDelete: CASCADE)                    │   │
│  │  ├─ createdAt (DateTime, default: now())                        │   │
│  │  ├─ INDEX [userId] ◄─── For user queries                        │   │
│  │  └─ INDEX [createdAt] ◄─── For sorting                          │   │
│  │                                                                    │   │
│  │  Order Table (EXISTING)                                          │   │
│  │  ├─ id, userId, productId, quantity, totalPrice                │   │
│  │  └─ Triggers notification creation                              │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                     Redis Cache                                   │   │
│  │                                                                    │   │
│  │  ├─ Socket.IO adapter (for multi-server scaling)                 │   │
│  │  ├─ Session storage                                              │   │
│  │  ├─ Product cache                                                │   │
│  │  ├─ Job queue (BullMQ) for background tasks                     │   │
│  │  │  └─ process-order-events                                     │   │
│  │  └─ Rate limiting                                                │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Real-Time Notification Flow (Sequence Diagram)

```
User 1                User 2              Backend             Socket.IO         Database
(Admin)           (Supplier)              Server              Server           PostgreSQL
  │                   │                     │                  │                  │
  │                   │ [Creates Order]     │                  │                  │
  │                   ├────────────────────>│                  │                  │
  │                   │                     │                  │                  │
  │                   │                     ├─ Validate Order  │                  │
  │                   │                     │  Check Stock     │                  │
  │                   │                     │                  │                  │
  │                   │                     ├──────────────────────────────────>│
  │                   │                     │                  │        Create Order
  │                   │                     │<──────────────────────────────────┤
  │                   │                     │                  │                  │
  │                   │                     ├─ notificationService.create()     │
  │                   │                     │  ├─ Supplier Notification         │
  │                   │                     │  └─ Admin Notifications (all)     │
  │                   │                     │                  │                  │
  │                   │                     ├──────────────────────────────────>│
  │                   │                     │                  │        Save Notifications
  │                   │                     │<──────────────────────────────────┤
  │                   │                     │                  │                  │
  │                   │                     ├─ io.to('user-1').emit(...)       │
  │                   │<────────────────────┼────────────────┤                  │
  │                   │        Notification │                  │                  │
  │                   │                     │                  │                  │
  │                   ├─ socket.on('notification')           │                  │
  │                   ├─ Add to state      │                  │                  │
  │                   ├─ Show toast        │                  │                  │
  │                   └─ Update badge      │                  │                  │
  │                   │                     │                  │                  │
  │                   │                     ├─ io.to('user-2').emit(...)       │
  │                   │                     ├─ io.to('user-3').emit(...)       │
  │                   │                     ├─ [other admins...]                │
  │                   │                     │                  │                  │
  │                   │                     ├─ io.to('user-X').emit('notification', {
  │                   │                     │   id: 42,
  │                   │                     │   title: "New Order Received",
  │                   │                     │   message: "...",
  │                   │                     │   type: "INFO",
  │                   │                     │   createdAt: "2026-07-14T10:30:00Z"
  │                   │                     │ })
  │ ◄──────────────────────────────────────┼─────────────────┤                  │
  │ Notification                            │                  │                  │
  │ Received!                               │                  │                  │
  │                                         │                  │                  │
  ├─ socket.on('notification')             │                  │                  │
  ├─ Add to state                          │                  │                  │
  ├─ Show toast                            │                  │                  │
  ├─ Update badge (1)                      │                  │                  │
  └─ Add to dropdown                       │                  │                  │
```

---

## Component Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Notification Dropdown                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ State Management                                         │  │
│  │ ├─ notifications: []  (unread only)                     │  │
│  │ ├─ unreadCount: 0                                       │  │
│  │ ├─ isOpen: boolean                                      │  │
│  │ └─ loading: boolean                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ useSocket Hook                                           │  │
│  │ ├─ On Mount: fetchUnreadNotifications()                 │  │
│  │ ├─ Effect: socket.on('notification')                   │  │
│  │ │  ├─ Add to notifications[]                           │  │
│  │ │  ├─ unreadCount++                                    │  │
│  │ │  ├─ Show toast                                       │  │
│  │ │  └─ Trigger UI update                               │  │
│  │ └─ Cleanup: socket.off('notification')                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Event Handlers                                           │  │
│  │ ├─ handleMarkAsRead(id)                                 │  │
│  │ │  ├─ API Call: PUT /api/notifications/:id/read        │  │
│  │ │  ├─ Remove from list                                 │  │
│  │ │  └─ unreadCount--                                    │  │
│  │ ├─ handleDeleteNotification(id)                         │  │
│  │ │  ├─ API Call: DELETE /api/notifications/:id          │  │
│  │ │  └─ Remove from list                                 │  │
│  │ └─ handleMarkAllAsRead()                                │  │
│  │    ├─ API Call: PUT /api/notifications/read-all        │  │
│  │    ├─ Clear notifications[]                            │  │
│  │    └─ unreadCount = 0                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Rendering (Conditional)                                 │  │
│  │ ├─ Bell Icon (always visible)                          │  │
│  │ ├─ Badge: unreadCount > 0 ? show : hide               │  │
│  │ ├─ Dropdown: isOpen ? render : hide                    │  │
│  │ │  ├─ Header (with Mark All button)                   │  │
│  │ │  ├─ Notification List                               │  │
│  │ │  │  └─ For each: color-coded by type               │  │
│  │ │  └─ Footer (View All link)                          │  │
│  │ └─ Click Outside: setIsOpen(false)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

        │
        │ API Calls
        │
        ▼

┌─────────────────────────────────────────────────────────────────┐
│                  Notification Service                           │
│                                                                 │
│  API Client (Axios)                                            │
│  ├─ Base URL: /api/notifications                              │
│  ├─ Auth Header: Bearer {token}                               │
│  └─ Methods:                                                   │
│      ├─ GET /                                                  │
│      ├─ GET /unread                                            │
│      ├─ PUT /:id/read                                          │
│      ├─ PUT /read-all                                          │
│      ├─ DELETE /:id                                            │
│      └─ DELETE /delete/all                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

        │
        │ HTTP Requests
        │
        ▼

┌─────────────────────────────────────────────────────────────────┐
│              Backend API (Express Routes)                       │
│                                                                 │
│  ├─ notificationController.getAllNotifications()              │
│  ├─ notificationController.getUnreadNotificationsCount()      │
│  ├─ notificationController.markNotificationAsRead()           │
│  ├─ notificationController.markAllNotificationsAsRead()       │
│  ├─ notificationController.deleteNotificationById()           │
│  └─ notificationController.deleteAllNotificationsForUser()    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

        │
        │ Database Queries
        │
        ▼

┌─────────────────────────────────────────────────────────────────┐
│          Prisma ORM (notificationService)                       │
│                                                                 │
│  ├─ prisma.notification.findMany({where: {userId}})          │
│  ├─ prisma.notification.count({where: {userId}})             │
│  ├─ prisma.notification.update({...})                        │
│  ├─ prisma.notification.updateMany({...})                    │
│  ├─ prisma.notification.delete({...})                        │
│  └─ prisma.notification.deleteMany({...})                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

        │
        │ SQL
        │
        ▼

┌─────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                           │
│                                                                 │
│  SELECT * FROM "Notification"                                  │
│  WHERE "userId" = $1                                           │
│  ORDER BY "createdAt" DESC                                     │
│  LIMIT 20;                                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
Frontend State Tree
═════════════════════════════════════════════════════════════════

App
├─ AuthContext
│  ├─ user: { id, email, role }
│  ├─ token: string
│  └─ isLoading: boolean
│
├─ SocketContext
│  ├─ socket: SocketIOClient
│  ├─ isConnected: boolean
│  └─ Emits: 'join' event
│
└─ Component State (NotificationDropdown)
   ├─ notifications: [
   │  ├─ { id, title, message, type, createdAt, isRead }
   │  ├─ ...
   │  └─ ...
   │  ]
   ├─ unreadCount: number
   ├─ isOpen: boolean
   ├─ loading: boolean
   │
   ├─ Effects:
   │  ├─ On Mount: fetchUnreadNotifications()
   │  ├─ On Socket: socket.on('notification', handler)
   │  ├─ On Click Outside: close dropdown
   │  └─ Cleanup: socket.off()
   │
   └─ Event Handlers:
      ├─ handleMarkAsRead(id)
      ├─ handleDeleteNotification(id)
      ├─ handleMarkAllAsRead()
      └─ handleToggleDropdown()
```

---

## Server-Side Processing Flow

```
Order Creation Request
─────────────────────────────────────────────────────────────

1. HTTP POST /api/orders
   ├─ Authentication: authMiddleware ✓
   └─ Request Body: { productId, quantity }

2. Order Controller (createOrder)
   ├─ Validate inputs
   ├─ Check user exists
   ├─ Check product exists
   ├─ Check stock availability
   ├─ Create order in DB
   ├─ Reduce product stock
   ├─ Audit log creation
   │
   ├─ ═══ NEW: NOTIFICATION FLOW ═══
   │
   ├─ Create Notification Service Call
   │  ├─ For Supplier (SUCCESS)
   │  │  └─ prisma.notification.create({
   │  │     userId: supplierId,
   │  │     title: "Order Created Successfully",
   │  │     message: "Your order for {product} has been created",
   │  │     type: "SUCCESS"
   │  │  })
   │  │
   │  └─ For All Admins (INFO)
   │     ├─ Find all admins: prisma.user.findMany({role: ADMIN})
   │     ├─ For each admin:
   │     │  └─ prisma.notification.create({
   │     │     userId: adminId,
   │     │     title: "New Order Received",
   │     │     message: "{supplier} created order for {product}",
   │     │     type: "INFO"
   │     │  })
   │     └─ Non-blocking (try-catch)
   │
   ├─ Socket.IO Emit
   │  ├─ io.to(`user-${supplierId}`).emit('notification', {...})
   │  └─ io.to(`user-${adminId}`).emit('notification', {...})
   │     [for each admin]
   │
   ├─ Low Stock Check
   │  ├─ If stock < 10
   │  ├─ Create WARNING notification
   │  └─ Emit to all admins
   │
   ├─ Enqueue Background Job
   │  └─ orderQueue.add('process-order-events', {...})
   │
   └─ Return Response
      └─ 201 Created { order }

3. Frontend Receives Response
   ├─ Toast: "Order created successfully"
   └─ Redirect to orders page

4. Socket.IO Real-Time Delivery (Parallel)
   ├─ Admin Browser A: socket.on('notification') ✓
   ├─ Admin Browser B: socket.on('notification') ✓
   ├─ Supplier Browser: socket.on('notification') ✓
   │
   └─ Frontend Handler
      ├─ Update state: notifications.push(new)
      ├─ unreadCount++
      ├─ Show toast
      └─ Trigger UI re-render
```

---

## Error Handling Strategy

```
Notification System Error Handling
═════════════════════════════════════════════════════════════════

Socket Connection Errors
├─ Connection Failed
│  └─ Retry with exponential backoff (1s → 5s)
│
├─ Disconnect/Reconnect
│  ├─ Update isConnected state
│  ├─ Show UI indicator
│  └─ Attempt auto-reconnect
│
└─ Message Delivery Failure
   └─ Logged to console (non-blocking)

API Errors
├─ 401 Unauthorized
│  ├─ Redirect to login
│  └─ Clear token
│
├─ 404 Not Found
│  └─ Show empty state
│
├─ 500 Server Error
│  └─ Show error toast
│
└─ Network Error
   └─ Show offline indicator
   └─ Retry on reconnect

Notification Service Errors
├─ Database Error
│  ├─ Log error
│  ├─ Don't break order flow
│  └─ Return 201 anyway
│
├─ Socket.IO Error
│  ├─ Log error
│  ├─ Continue (non-blocking)
│  └─ Notification still in DB
│
└─ Audit Log Error
   └─ Log but don't fail
```

---

## Scalability Considerations

```
Single Server (Current)
─────────────────────────────────────────────────────────────
┌──────────────┐
│ Node.js      │
├──────────────┤
│ Express      │
├──────────────┤
│ Socket.IO    │◄─── In-memory adapter
│ (single)     │
└──────────────┘


Multi-Server (Future)
─────────────────────────────────────────────────────────────
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Node.js #1   │     │ Node.js #2   │     │ Node.js #3   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ Express      │     │ Express      │     │ Express      │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ Socket.IO    │     │ Socket.IO    │     │ Socket.IO    │
│ w/ Redis     │────▶│ w/ Redis     │────▶│ w/ Redis     │
│ adapter      │     │ adapter      │     │ adapter      │
└──────────────┘     └──────────────┘     └──────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Redis Adapter   │
                    │ (pub/sub)       │
                    └─────────────────┘
                    
Changes needed for scaling:
├─ npm install @socket.io/redis-adapter
├─ Const { createAdapter } = require('@socket.io/redis-adapter')
├─ io.adapter(createAdapter(pubClient, subClient))
└─ Messages automatically routed across servers
```

---

**Architecture is clean, scalable, and production-ready!** ✅
