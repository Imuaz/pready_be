# Notification System Examples

## Creating Custom Notifications

```typescript
import { createNotification } from './services/notification.service.js';

// Basic notification
await createNotification({
  recipientId: '65a1b2c3...',
  type: 'info',
  title: 'Update Available',
  message: 'A new version is available.',
  priority: 'medium'
});

// Notification with action URL
await createNotification({
  recipientId: '65a1b2c3...',
  type: 'success',
  title: 'Payment Received',
  message: 'Your payment of $99.99 has been processed.',
  actionUrl: '/orders/12345',
  priority: 'high',
  data: {
    orderId: '12345',
    amount: 99.99
  }
});

// Urgent notification
await createNotification({
  recipientId: '65a1b2c3...',
  senderId: 'ADMIN_ID',
  type: 'error',
  title: 'Security Alert',
  message: 'Suspicious login attempt detected.',
  priority: 'urgent',
  data: {
    ip: '192.168.1.1',
    location: 'Unknown'
  }
});

// Self-expiring notification (auto-deleted by MongoDB TTL index)
await createNotification({
  recipientId: '65a1b2c3...',
  type: 'warning',
  title: 'Trial Ending Soon',
  message: 'Your trial ends in 3 days.',
  expiresInDays: 3
});
```

---

## Notification Types

| Type | Use for |
|------|---------|
| `info` | General information |
| `success` | Positive confirmations |
| `warning` | Important notices |
| `error` | Critical errors |
| `mention` | User @mentions |
| `system` | System-generated messages |

## Priority Levels

| Priority | Use for |
|----------|---------|
| `low` | Can be dismissed freely |
| `medium` | Standard importance (default) |
| `high` | Should be addressed soon |
| `urgent` | Requires immediate attention |

---

## REST API Quick Reference

All routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/notifications` | Get notifications (supports `?page=`, `?limit=`, `?unreadOnly=true`) |
| `GET` | `/api/notifications/stats` | Count total / unread / by type |
| `POST` | `/api/notifications/:id/read` | Mark one notification as read |
| `POST` | `/api/notifications/read-all` | Mark all as read |
| `DELETE` | `/api/notifications/:id` | Delete a notification |
| `DELETE` | `/api/notifications/clear-read` | Delete all read notifications |
| `GET` | `/api/notifications/preferences` | Get delivery preferences |
| `PUT` | `/api/notifications/preferences` | Update delivery preferences |
| `POST` | `/api/notifications/test` | Send a test notification (dev only) |

---

## WebSocket Events

### Connecting (client → server)
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: '<JWT access token>' }
});
```

### Server → Client events
```javascript
// Fired once on successful connection
socket.on('connected', ({ userId }) => {
  console.log('Connected as', userId);
});

// New notification delivered in real-time
socket.on('new-notification', ({ notification }) => {
  console.log(notification.title, notification.message);
});

// A single notification was marked read (via REST or another client tab)
socket.on('notification-read', ({ notificationId }) => {
  // update local UI state
});

// All notifications were marked read at once
socket.on('all-notifications-read', () => {
  // clear unread badge
});
```

---

## Best Practices

1. ✅ Keep titles under 100 characters
2. ✅ Keep messages under 500 characters
3. ✅ Use appropriate priority levels
4. ✅ Include `actionUrl` when there is a relevant page to navigate to
5. ✅ Set `expiresInDays` for time-sensitive notifications (TTL index auto-deletes them)
6. ✅ Respect user preferences — `createNotification` checks them before sending email/push
7. ✅ Wrap `createNotification` calls in `try/catch` so a notification failure never breaks the main flow
8. ✅ Use the helper functions in `notificationHelper.ts` for common events instead of calling `createNotification` directly