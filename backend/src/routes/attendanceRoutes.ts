import { Router } from 'express';
import { searchParticipant, saveExternalAttendance, getAttendanceList } from '../controllers/attendanceController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Public routes for citizens at meetings
router.get('/buscar', searchParticipant);
router.post('/registro-externo', saveExternalAttendance);

// Protected route for coordinators/auditors viewing attendance lists
router.get('/evento/:eventId', verifyToken as any, getAttendanceList as any);

export default router;
