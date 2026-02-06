import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { authMiddleware, requireAdmin } from './middleware/auth.middleware';
import { getMe } from './controllers/me.controller';
import { listGroups, createGroup, deleteGroup, addUserToGroup, removeUserFromGroup } from './controllers/groups.controller';
import useCaseRoutes from './routes/usecase.routes';
import userRoutes from './routes/user.routes';
import toolRoutes from './routes/tool.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug auth endpoint (non-production only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/auth', authMiddleware, (req, res) => {
    const forwardedHeaders: Record<string, string> = {};
    const headerPrefixes = ['x-auth', 'x-user', 'x-email', 'x-forwarded', 'x-groups'];

    Object.keys(req.headers).forEach((key) => {
      if (headerPrefixes.some((prefix) => key.toLowerCase().startsWith(prefix))) {
        forwardedHeaders[key] = String(req.headers[key]);
      }
    });

    return res.json({
      auth: req.auth || null,
      headers: forwardedHeaders
    });
  });
}

// Current user endpoint
app.get('/api/me', authMiddleware, getMe);

// Groups endpoints
app.get('/api/groups', authMiddleware, listGroups);
app.post('/api/groups', authMiddleware, requireAdmin, createGroup);
app.delete('/api/groups/:id', authMiddleware, requireAdmin, deleteGroup);
app.post('/api/groups/members', authMiddleware, requireAdmin, addUserToGroup);
app.delete('/api/groups/:groupId/members/:userId', authMiddleware, requireAdmin, removeUserFromGroup);

// Use case routes
app.use('/api/use-cases', useCaseRoutes);

// User management routes (Admin)
app.use('/api/users', userRoutes);

// Tool routes
app.use('/api/tools', toolRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
