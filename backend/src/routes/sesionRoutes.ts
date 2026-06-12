import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadEvidence, setQualityFeedback } from '../controllers/eventController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Configure storage for multer evidence files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Secure all session routes
router.use(verifyToken as any);

router.post('/:id/evidence', upload.single('file'), uploadEvidence as any);
router.post('/:id/quality', setQualityFeedback as any);

export default router;
