import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './src/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // --- Authentication Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  app.post('/api/auth/register', async (req, res) => {
    const { username, password, name, age } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (username, password_hash, name, age) VALUES (?, ?, ?, ?)');
      const info = stmt.run(username, hashedPassword, name, age || null);
      
      const token = jwt.sign({ id: info.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true, user: { id: info.lastInsertRowid, username, name, age } });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Username already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
      const user = stmt.get(username) as any;

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true, user: { id: user.id, username: user.username, name: user.name, age: user.age } });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const stmt = db.prepare('SELECT id, username, name, age, preferences FROM users WHERE id = ?');
    const user = stmt.get(req.user.id);
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.get('/api/reminders', authenticateToken, (req: any, res) => {
    const stmt = db.prepare('SELECT * FROM reminders WHERE user_id = ? ORDER BY time ASC');
    const reminders = stmt.all(req.user.id);
    res.json({ reminders });
  });

  app.post('/api/reminders', authenticateToken, (req: any, res) => {
    const { title, time, recurring } = req.body;
    const stmt = db.prepare('INSERT INTO reminders (user_id, title, time, recurring) VALUES (?, ?, ?, ?)');
    const info = stmt.run(req.user.id, title, time, recurring ? 1 : 0);
    res.json({ success: true, id: info.lastInsertRowid });
  });

  app.put('/api/reminders/:id/complete', authenticateToken, (req: any, res) => {
    const stmt = db.prepare('UPDATE reminders SET completed = 1 WHERE id = ? AND user_id = ?');
    const info = stmt.run(req.params.id, req.user.id);
    if (info.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Reminder not found' });
    }
  });

  app.get('/api/emergency-contacts', authenticateToken, (req: any, res) => {
    const stmt = db.prepare('SELECT * FROM emergency_contacts WHERE user_id = ?');
    const contacts = stmt.all(req.user.id);
    res.json({ contacts });
  });

  app.post('/api/emergency-contacts', authenticateToken, (req: any, res) => {
    const { name, phone, relationship } = req.body;
    const stmt = db.prepare('INSERT INTO emergency_contacts (user_id, name, phone, relationship) VALUES (?, ?, ?, ?)');
    const info = stmt.run(req.user.id, name, phone, relationship);
    res.json({ success: true, id: info.lastInsertRowid });
  });

  app.post('/api/chat/history', authenticateToken, (req: any, res) => {
    const { role, content } = req.body;
    const stmt = db.prepare('INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)');
    stmt.run(req.user.id, role, content);
    res.json({ success: true });
  });

  app.get('/api/chat/history', authenticateToken, (req: any, res) => {
    const stmt = db.prepare('SELECT * FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20');
    const history = stmt.all(req.user.id);
    res.json({ history: history.reverse() });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
