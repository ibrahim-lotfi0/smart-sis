// ── API Base ──
const API_BASE = 'http://localhost:5000/api';

function getToken() { return localStorage.getItem('sis_token'); }

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const res = await fetch(API_BASE + endpoint, {
    headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
    ...options,
  });
  if (res.status === 401) { logout(); return null; }
  if (!res.ok) {
    let msg = 'Server error';
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch (e) {
      msg = await res.text() || msg;
    }
    throw new Error(msg);
  }
  return res.json();
}

async function apiLogin(email, password) {
  const res = await fetch(API_BASE + '/auth/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
  return res.json();
}

const studentApi = {
  profile:    () => apiFetch('/student/profile'),
  grades:     () => apiFetch('/student/grades'),
  attendance: () => apiFetch('/student/attendance'),
  courses:    () => apiFetch('/student/courses'),
  schedule:   () => apiFetch('/student/schedule'),
  exams:      () => apiFetch('/student/exams'),
  submitFeedback: (d) => apiFetch('/student/feedback', {method:'POST', body:JSON.stringify(d)}),
  registerCourse: (courseId) => apiFetch('/student/register-course', {method:'POST', body:JSON.stringify({courseId})}),
};
const instructorApi = {
  courses:       () => apiFetch('/instructor/courses'),
  students:      () => apiFetch('/instructor/students'),
  sessions:      () => apiFetch('/instructor/sessions'),
  pendingGrades: () => apiFetch('/instructor/pending-grades'),
  createSession: (d) => apiFetch('/instructor/sessions', {method:'POST', body:JSON.stringify(d)}),
  saveGrades:    (d) => apiFetch('/instructor/grades', {method:'POST', body:JSON.stringify(d)}),
  assignTA:      (d) => apiFetch('/instructor/assign-ta', {method:'POST', body:JSON.stringify(d)}),
  availableTAs:  () => apiFetch('/instructor/available-tas'),
  assignedTAs:   () => apiFetch('/instructor/assigned-tas'),
  sessionAttendance: (id) => apiFetch(`/instructor/sessions/${id}/attendance`),
};
const adminApi = {
  stats:         () => apiFetch('/admin/stats'),
  highRisk:      () => apiFetch('/admin/high-risk'),
  allStudents:   () => apiFetch('/admin/students'),
  allInstructors:() => apiFetch('/admin/instructors'),
  departments:   () => apiFetch('/admin/departments'),
  allCourses:    () => apiFetch('/admin/courses'),
  createDepartment: (d) => apiFetch('/admin/departments', {method:'POST', body:JSON.stringify(d)}),
  deleteDepartment: (id) => apiFetch(`/admin/departments/${id}`, {method:'DELETE'}),
  updateDepartment: (id, d) => apiFetch(`/admin/departments/${id}`, {method:'PUT', body:JSON.stringify(d)}),
  createCourse:     (d) => apiFetch('/admin/courses', {method:'POST', body:JSON.stringify(d)}),
  deleteCourse:     (id) => apiFetch(`/admin/courses/${id}`, {method:'DELETE'}),
  updateCourse:     (id, d) => apiFetch(`/admin/courses/${id}`, {method:'PUT', body:JSON.stringify(d)}),
  deleteUser:       (id) => apiFetch(`/admin/users/${id}`, {method:'DELETE'}),
  createStudent:    (d) => apiFetch('/admin/students', {method:'POST', body:JSON.stringify(d)}),
  updateStudent:    (id, d) => apiFetch(`/admin/students/${id}`, {method:'PUT', body:JSON.stringify(d)}),
  createInstructor: (d) => apiFetch('/admin/instructors', {method:'POST', body:JSON.stringify(d)}),
  updateInstructor: (id, d) => apiFetch(`/admin/instructors/${id}`, {method:'PUT', body:JSON.stringify(d)}),
  getSemesters:     () => apiFetch('/admin/semesters'),
  updateSemester:   (id, d) => apiFetch(`/admin/semesters/${id}`, {method:'PUT', body:JSON.stringify(d)}),
  getLogs:          () => apiFetch('/admin/logs'),
  toggleUserStatus: (id, active) => apiFetch(`/admin/users/${id}/status`, {method:'PUT', body:JSON.stringify({isActive: active})}),
};
