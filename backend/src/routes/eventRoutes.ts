import { Router } from 'express';
import { getEvents, getEventDetails, saveEvent } from '../controllers/eventController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

// Apply auth protection to all event routes
router.use(verifyToken as any);

router.get('/', getEvents as any);
router.get('/:id', getEventDetails as any);
router.post('/', saveEvent as any);
router.put('/:id', saveEvent as any);

export default router;
