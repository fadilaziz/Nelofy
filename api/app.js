import express from 'express';
import dotenv from 'dotenv';
import router from './routes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { worker10s } from './common/worker.js';

const app = express();
dotenv.config();
app.use(express.json());

// Konfigurasi CORS
const corsOptions = {
  origin: [process.env.BASE_URL, process.env.URL_FRONTEND_PUBLIC, process.env.URL_FRONTEND_ADMIN],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Routes
app.use('/', router);

// Worker
worker10s();

// Server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server public Berjalan di port ${port}`);
});
