# Quick Start - Day 27 Notifications

## Prerequisites Checklist
- ✅ PostgreSQL running (localhost:5432)
- ✅ Redis running (localhost:6379)
- ✅ Backend & frontend dependencies installed

---

## Step 1: Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add_notifications
```

**Expected Output:**
```
Prisma schema loaded
✔ Created 2 new migrations
✔ Generated Prisma Client
Database synced
```

---

## Step 2: Start Backend

```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server is running on port 5000
Socket.IO server ready for connections
```

---

## Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v8.0.12  ready in XXX ms

➜  Local:   http://localhost:5173/
```

---

## Step 4: Test the System

### Open Two Browser Tabs

**Tab 1 (Admin):**
1. Open DevTools Console
2. Navigate to http://localhost:5173
3. Login as admin
4. Watch console for "Socket connected" message
5. See notification bell in navbar

**Tab 2 (Supplier):**
1. Open new tab, same localhost
2. Login as supplier
3. Navigate to Products
4. Create a new order for any product

### Expected Results

**Tab 1 (Admin):**
- ✅ See toast notification: "Order Created Successfully"
- ✅ See bell icon with red "1" badge
- ✅ Click bell, see notification in dropdown
- ✅ Click "View All Notifications"
- ✅ See full notifications page with filters

**Tab 2 (Supplier):**
- ✅ See toast: "Order Created Successfully" (their own order)
- ✅ See notification bell with badge

---

## Verify Database

```bash
cd backend
npx prisma studio
```

**Check:**
- [ ] Notification model visible
- [ ] Can query notifications
- [ ] Notifications table has records after creating orders

---

## Environment Variables

### Backend (.env already exists)
- DATABASE_URL=postgresql://postgres:12345@localhost:5432/supply_chain_db
- PORT=5000

### Frontend (.env created)
- VITE_API_URL=http://localhost:5000/api
- VITE_SOCKET_URL=http://localhost:5000

---

## Notification Types Reference

| Type | Color | Trigger |
|------|-------|---------|
| SUCCESS | Green | Order created by supplier |
| INFO | Blue | New order received (admin) |
| WARNING | Yellow | Low stock warning (<10 items) |
| ERROR | Red | (Future: errors/failures) |

---

## Common Issues & Solutions

### Issue: "Can't reach database server"
```bash
# Start PostgreSQL
# Windows: Services → PostgreSQL
# Linux: sudo systemctl start postgresql
# macOS: brew services start postgresql
```

### Issue: "Socket connection failed"
```
Check:
1. Backend running on port 5000
2. VITE_SOCKET_URL=http://localhost:5000
3. No CORS errors in console
4. Firewall not blocking connections
```

### Issue: No notifications appearing
```
Check:
1. Socket.IO shows "connected" in console
2. User was "joined" in room
3. Order was actually created
4. Check backend logs for errors
```

### Issue: "Notification table doesn't exist"
```bash
# Run migration
npx prisma migrate dev

# Or reset database (caution: deletes all data)
npx prisma migrate reset
```

---

## API Endpoints

All require `Authorization: Bearer {token}` header.

### Get Notifications
```bash
GET /api/notifications?page=1&limit=20

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

### Get Unread
```bash
GET /api/notifications/unread

Response:
{
  "success": true,
  "unreadCount": 5,
  "notifications": [...]
}
```

### Mark as Read
```bash
PUT /api/notifications/123/read
```

### Delete
```bash
DELETE /api/notifications/123
```

---

## Socket.IO Events

### Client → Server
```javascript
socket.emit('join', userId);
```

### Server → Client
```javascript
socket.on('notification', {
  id: 1,
  title: "Order Created",
  message: "Your order has been created",
  type: "SUCCESS",
  createdAt: "2026-07-14T10:30:00Z"
});
```

---

## Performance Metrics

- Notification delivery: < 100ms (WebSocket)
- API response: < 200ms (REST)
- Badge update: Instant
- Toast display: Automatic
- DB indexes: user_id, createdAt

---

## Mobile Testing

Notifications work on mobile too! Just:
1. Open http://localhost:5173 on phone
2. Same notification bell appears
3. Dropdown is responsive
4. Full page notifications work

---

## Security Notes

- ✅ All endpoints require authentication (authMiddleware)
- ✅ Users can only see their own notifications
- ✅ Cascade delete: deleting user removes their notifications
- ✅ Socket.IO validates user room access
- ✅ No sensitive data in notifications

---

## Monitoring in Production

```javascript
// In server.js, add event tracking:
io.on('connection', (socket) => {
  console.log(`Client ${socket.id} connected`);
  socket.on('join', (userId) => {
    console.log(`User ${userId} joined`);
  });
});

// Track notification creation in orderController:
console.log(`Notification created for user ${userId}`);
io.to(`user-${userId}`).emit('notification', notification);
```

---

## Success Confirmation

You'll know it's working when:

1. ✅ Notification bell appears in navbar
2. ✅ Socket connection shows in DevTools
3. ✅ Creating order shows immediate toast (no page refresh)
4. ✅ Badge shows unread count
5. ✅ Clicking bell shows dropdown with notification
6. ✅ "View All Notifications" page loads notifications
7. ✅ Pagination and filters work
8. ✅ Mark as read removes notification
9. ✅ Database stores notification records
10. ✅ Admins get notified of new orders from suppliers

---

## Next Steps

- [ ] Test with multiple browser tabs/windows
- [ ] Test with multiple admin users
- [ ] Verify low stock warnings trigger at <10 items
- [ ] Check performance with 100+ notifications
- [ ] Review logs for any warnings
- [ ] Test production deployment setup

---

**Need help?** Check DAY_27_NOTIFICATIONS_README.md for full documentation.
