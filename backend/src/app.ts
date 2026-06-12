import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import sesionRoutes from './routes/sesionRoutes';
import attendanceRoutes from './routes/attendanceRoutes';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Permitir peticiones desde cualquier origen en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' })); // Permitir firmas en base64 de tamaño grande
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload folders exist
const uploadsDir = path.resolve(__dirname, '../uploads');
const signaturesDir = path.resolve(__dirname, '../uploads/signatures');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(signaturesDir)) fs.mkdirSync(signaturesDir, { recursive: true });

// Expose static uploads folder
app.use('/uploads', express.static(uploadsDir));

// Route endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/sesiones', sesionRoutes);
app.use('/api/v1/asistencias', attendanceRoutes);

// Base route test
app.get('/', (req, res) => {
  res.json({
    name: 'SeguimientoPP Backend API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

export default app;
