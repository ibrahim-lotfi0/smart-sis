import api from './axios';

// Student
export const getMyProfile = () => api.get('/student/profile').then(res => res.data);
export const getMyGrades = () => api.get('/student/grades').then(res => res.data);
export const getMyAttendance = () => api.get('/student/attendance').then(res => res.data);
export const getMyCourses = () => api.get('/student/courses').then(res => res.data);
export const getMySchedule = () => api.get('/student/schedule').then(res => res.data);
export const getMyExams = () => api.get('/student/exams').then(res => res.data);
export const submitFeedback = (data: any) => api.post('/student/feedback', data).then(res => res.data);

// Instructor
export const getInstructorCourses = () => api.get('/instructor/courses').then(res => res.data);
export const getCourseStudents = () => api.get('/instructor/students').then(res => res.data);
export const getInstructorSessions = () => api.get('/instructor/sessions').then(res => res.data);
export const getPendingGrades = () => api.get('/instructor/pending-grades').then(res => res.data);
export const createSession = (data: any) => api.post('/instructor/sessions', data).then(res => res.data);
export const saveGrades = (data: any) => api.post('/instructor/grades', data).then(res => res.data);
export const assignTA = (data: any) => api.post('/instructor/assign-ta', data).then(res => res.data);

// Admin
export const getAdminStats = () => api.get('/admin/stats').then(res => res.data);
export const getHighRiskStudents = () => api.get('/admin/high-risk').then(res => res.data);
export const getAllStudents = () => api.get('/admin/students').then(res => res.data);
export const getAllInstructors = () => api.get('/admin/instructors').then(res => res.data);
export const getDepartments = () => api.get('/admin/departments').then(res => res.data);
export const createDepartment = (data: any) => api.post('/admin/departments', data).then(res => res.data);
export const deleteDepartment = (id: number) => api.delete(`/admin/departments/${id}`).then(res => res.data);
export const createCourse = (data: any) => api.post('/admin/courses', data).then(res => res.data);
export const deleteCourse = (id: number) => api.delete(`/admin/courses/${id}`).then(res => res.data);
export const deleteUser = (id: number) => api.delete(`/admin/users/${id}`).then(res => res.data);
