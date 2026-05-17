import { Router } from 'express';
import { verifyJWT, authorize } from '../middleware/authMiddleware';
import { 
  getStudentProfile, getStudentGrades, getStudentAttendance, 
  getStudentCourses, getStudentSchedule, getStudentExams, submitFeedback, registerCourse
} from '../controllers/studentController';

const router = Router();

router.get('/profile', verifyJWT, authorize(['Student']), getStudentProfile);
router.get('/grades', verifyJWT, authorize(['Student']), getStudentGrades);
router.get('/attendance', verifyJWT, authorize(['Student']), getStudentAttendance);
router.get('/courses', verifyJWT, authorize(['Student']), getStudentCourses);
router.get('/schedule', verifyJWT, authorize(['Student']), getStudentSchedule);
router.get('/exams', verifyJWT, authorize(['Student']), getStudentExams);
router.post('/feedback', verifyJWT, authorize(['Student']), submitFeedback);
router.post('/register-course', verifyJWT, authorize(['Student']), registerCourse);

export default router;
