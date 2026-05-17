import { Router } from 'express';
import { verifyJWT, authorize } from '../middleware/authMiddleware';
import { 
  getInstructorCourses, getCourseStudents, createSession, 
  getInstructorSessions, getPendingGrades, saveGrades, assignTA,
  getAvailableTAs, getAssignedTAs, getSessionAttendance
} from '../controllers/instructorController';

const router = Router();

router.get('/courses', verifyJWT, authorize(['Instructor', 'TA']), getInstructorCourses);
router.get('/students', verifyJWT, authorize(['Instructor', 'TA']), getCourseStudents);
router.get('/sessions', verifyJWT, authorize(['Instructor', 'TA']), getInstructorSessions);
router.get('/sessions/:id/attendance', verifyJWT, authorize(['Instructor', 'TA']), getSessionAttendance);
router.get('/pending-grades', verifyJWT, authorize(['Instructor']), getPendingGrades);
router.get('/available-tas', verifyJWT, authorize(['Instructor']), getAvailableTAs);
router.get('/assigned-tas', verifyJWT, authorize(['Instructor']), getAssignedTAs);

router.post('/sessions', verifyJWT, authorize(['Instructor', 'TA']), createSession);
router.post('/grades', verifyJWT, authorize(['Instructor']), saveGrades);
router.post('/assign-ta', verifyJWT, authorize(['Instructor']), assignTA);

export default router;
