import express from 'express';
import cors from 'cors';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';
import { connectDB } from './lib/db.lib.js';
import { app, server } from './lib/socket.js';
import path from 'path';

dotenv.config();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`); // Server is listening on port 5001
  connectDB();
});
