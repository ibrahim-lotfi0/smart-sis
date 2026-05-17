import { Router } from 'express';
import { verifyJWT, authorize } from '../middleware/authMiddleware';
import { 
  getAdminStats, getHighRiskStudents, 
  getAllStudents, getAllInstructors, getDepartments, getAllCourses,
  createDepartment, deleteDepartment, createCourse, deleteCourse, deleteUser,
  createStudent, createInstructor,
  updateStudent, updateInstructor, updateDepartment, updateCourse,
  getSemesters, updateSemester, getSystemLogs, toggleUserStatus
} from '../controllers/adminController';

const router = Router();

router.get('/stats', verifyJWT, authorize(['Admin']), getAdminStats);
router.get('/high-risk', verifyJWT, authorize(['Admin']), getHighRiskStudents);
router.get('/students', verifyJWT, authorize(['Admin']), getAllStudents);
router.get('/instructors', verifyJWT, authorize(['Admin']), getAllInstructors);
router.get('/departments', verifyJWT, authorize(['Admin']), getDepartments);
router.get('/courses', verifyJWT, authorize(['Admin']), getAllCourses);

router.post('/departments', verifyJWT, authorize(['Admin']), createDepartment);
router.delete('/departments/:id', verifyJWT, authorize(['Admin']), deleteDepartment);
router.put('/departments/:id', verifyJWT, authorize(['Admin']), updateDepartment);

router.post('/courses', verifyJWT, authorize(['Admin']), createCourse);
router.delete('/courses/:id', verifyJWT, authorize(['Admin']), deleteCourse);
router.put('/courses/:id', verifyJWT, authorize(['Admin']), updateCourse);

router.delete('/users/:id', verifyJWT, authorize(['Admin']), deleteUser);

router.post('/students', verifyJWT, authorize(['Admin']), createStudent);
router.put('/students/:id', verifyJWT, authorize(['Admin']), updateStudent);

router.post('/instructors', verifyJWT, authorize(['Admin']), createInstructor);
router.put('/instructors/:id', verifyJWT, authorize(['Admin']), updateInstructor);

// System Settings
router.get('/semesters', verifyJWT, authorize(['Admin']), getSemesters);
router.put('/semesters/:id', verifyJWT, authorize(['Admin']), updateSemester);
router.get('/logs', verifyJWT, authorize(['Admin']), getSystemLogs);
router.put('/users/:id/status', verifyJWT, authorize(['Admin']), toggleUserStatus);

export default router;
