import {
  AuthResponse,
  UserRole,
  AdminStats,
  StudentProfile,
  MyGrade,
  MyAttendance,
  CourseEnrollment,
  HighRiskStudent,
  CourseStudent,
  Department,
  User,
  Student,
  Instructor,
  Course,
  Semester,
  Session,
  Attendance,
  Exam,
  Feedback,
  RiskPrediction,
  SemesterGPA,
  AttendanceSummary,
} from "@/types";

// ─── Simulated delay ──────────────────────────────────────────────────────────
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// ─── Predefined Mock Users (matching SQL seed data) ──────────────────────────
export const MOCK_USERS: Array<AuthResponse & { password: string }> = [
  {
    token: "mock-jwt-admin-001",
    role: "Admin",
    email: "admin@uni.edu",
    fullName: "Dr. Admin",
    userId: 1,
    password: "admin123",
  },
  {
    token: "mock-jwt-instructor-002",
    role: "Instructor",
    email: "khalil@uni.edu",
    fullName: "Dr. Khalil Mansour",
    userId: 2,
    password: "instr123",
  },
  {
    token: "mock-jwt-instructor-003",
    role: "Instructor",
    email: "nasser@uni.edu",
    fullName: "Dr. Nasser Awad",
    userId: 3,
    password: "instr123",
  },
  {
    token: "mock-jwt-ta-004",
    role: "TA",
    email: "awad@uni.edu",
    fullName: "Dr. Awad Saleh",
    userId: 4,
    password: "ta123",
  },
  {
    token: "mock-jwt-student-007",
    role: "Student",
    email: "student1000@uni.edu",
    fullName: "Sara Hassan",
    userId: 7,
    password: "student123",
  },
  {
    token: "mock-jwt-student-008",
    role: "Student",
    email: "student1001@uni.edu",
    fullName: "Ahmed Khalil",
    userId: 8,
    password: "student123",
  },
  {
    token: "mock-jwt-student-009",
    role: "Student",
    email: "student1002@uni.edu",
    fullName: "Layla Nasser",
    userId: 9,
    password: "student123",
  },
];

// ─── Auth ──────────────────────────────────────────────────────────────────────
export async function mockLogin(
  email: string,
  password: string
): Promise<AuthResponse> {
  await delay(600);
  const user = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) throw new Error("Invalid email or password");
  const { password: _, ...authResponse } = user;
  return authResponse;
}

export function decodeToken(token: string): AuthResponse | null {
  const user = MOCK_USERS.find((u) => u.token === token);
  if (!user) return null;
  const { password: _, ...authResponse } = user;
  return authResponse;
}

// ─── Departments ──────────────────────────────────────────────────────────────
export const MOCK_DEPARTMENTS: Department[] = [
  { departmentId: 1, name: "Computer Science", createdAt: "2023-01-01T00:00:00Z" },
  { departmentId: 2, name: "Mathematics", createdAt: "2023-01-01T00:00:00Z" },
  { departmentId: 3, name: "Physics", createdAt: "2023-01-01T00:00:00Z" },
  { departmentId: 4, name: "Engineering", createdAt: "2023-01-01T00:00:00Z" },
  { departmentId: 5, name: "Business", createdAt: "2023-01-01T00:00:00Z" },
];

export async function mockGetDepartments(): Promise<Department[]> {
  await delay(400);
  return MOCK_DEPARTMENTS;
}

// ─── Semesters ────────────────────────────────────────────────────────────────
export const MOCK_SEMESTERS: Semester[] = [
  { semesterId: 1, name: "Fall 2024", startDate: "2024-09-15", endDate: "2025-01-20", isActive: false },
  { semesterId: 2, name: "Spring 2025", startDate: "2025-02-10", endDate: "2025-06-15", isActive: false },
  { semesterId: 3, name: "Fall 2025", startDate: "2025-09-15", endDate: "2026-01-20", isActive: false },
  { semesterId: 4, name: "Spring 2026", startDate: "2026-02-10", endDate: "2026-06-15", isActive: true },
];

export async function mockGetSemesters(): Promise<Semester[]> {
  await delay(300);
  return MOCK_SEMESTERS;
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export const MOCK_COURSES: Course[] = [
  { courseId: 1, code: "CS101", name: "Intro to Programming", credits: 3, departmentId: 1, instructorId: 1, departmentName: "Computer Science", instructorName: "Dr. Khalil Mansour", enrolledCount: 3 },
  { courseId: 2, code: "MA201", name: "Linear Algebra", credits: 4, departmentId: 2, instructorId: 2, departmentName: "Mathematics", instructorName: "Dr. Nasser Awad", enrolledCount: 3 },
  { courseId: 3, code: "CS305", name: "Machine Learning", credits: 3, departmentId: 1, instructorId: 3, departmentName: "Computer Science", instructorName: "Dr. Awad Saleh", enrolledCount: 3 },
  { courseId: 4, code: "PH102", name: "Physics II", credits: 4, departmentId: 3, instructorId: 4, departmentName: "Physics", instructorName: "Dr. Fares Habib", enrolledCount: 0 },
  { courseId: 5, code: "BU210", name: "Microeconomics", credits: 3, departmentId: 5, instructorId: 5, departmentName: "Business", instructorName: "Dr. Saleh Qasim", enrolledCount: 0 },
];

export async function mockGetCourses(): Promise<Course[]> {
  await delay(400);
  return MOCK_COURSES;
}

// ─── Students ─────────────────────────────────────────────────────────────────
export const MOCK_STUDENTS: Student[] = [
  { studentId: 1, userId: 7, departmentId: 1, nationalId: "29901000001", gender: "Female", nationality: "Egyptian", birthDate: "2003-05-10", mobile: "+20 1011000001", enrollmentYear: 2023, currentLevel: 2, cgpa: 3.45, attendanceRate: 92, riskLevel: "Low", fullName: "Sara Hassan", email: "student1000@uni.edu", departmentName: "Computer Science" },
  { studentId: 2, userId: 8, departmentId: 2, nationalId: "29901000002", gender: "Male", nationality: "Egyptian", birthDate: "2002-07-21", mobile: "+20 1011000002", enrollmentYear: 2023, currentLevel: 3, cgpa: 2.10, attendanceRate: 65, riskLevel: "High", fullName: "Ahmed Khalil", email: "student1001@uni.edu", departmentName: "Mathematics" },
  { studentId: 3, userId: 9, departmentId: 1, nationalId: "29901000003", gender: "Female", nationality: "Egyptian", birthDate: "2003-11-03", mobile: "+20 1011000003", enrollmentYear: 2023, currentLevel: 2, cgpa: 2.75, attendanceRate: 80, riskLevel: "Medium", fullName: "Layla Nasser", email: "student1002@uni.edu", departmentName: "Computer Science" },
];

export async function mockGetStudents(): Promise<Student[]> {
  await delay(400);
  return MOCK_STUDENTS;
}

// ─── Instructors ─────────────────────────────────────────────────────────────
export const MOCK_INSTRUCTORS: Instructor[] = [
  { instructorId: 1, userId: 2, departmentId: 1, phone: "+20 100 111 2233", hireDate: "2018-09-01", fullName: "Dr. Khalil Mansour", email: "khalil@uni.edu", departmentName: "Computer Science" },
  { instructorId: 2, userId: 3, departmentId: 2, phone: "+20 100 222 3344", hireDate: "2015-02-15", fullName: "Dr. Nasser Awad", email: "nasser@uni.edu", departmentName: "Mathematics" },
  { instructorId: 3, userId: 4, departmentId: 1, phone: "+20 100 333 4455", hireDate: "2020-01-10", fullName: "Dr. Awad Saleh", email: "awad@uni.edu", departmentName: "Computer Science" },
  { instructorId: 4, userId: 5, departmentId: 3, phone: "+20 100 444 5566", hireDate: "2012-08-20", fullName: "Dr. Fares Habib", email: "fares@uni.edu", departmentName: "Physics" },
  { instructorId: 5, userId: 6, departmentId: 5, phone: "+20 100 555 6677", hireDate: "2019-03-12", fullName: "Dr. Saleh Qasim", email: "saleh@uni.edu", departmentName: "Business" },
];

export async function mockGetInstructors(): Promise<Instructor[]> {
  await delay(400);
  return MOCK_INSTRUCTORS;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const MOCK_SESSIONS: Session[] = [
  { sessionId: 1, courseId: 1, instructorId: 1, semesterId: 4, sessionDate: "2026-05-01", startTime: "09:00", endTime: "10:30", sessionType: "Lecture", qrCode: "QR-CS101-DEMO-001", qrExpiry: "2026-05-01T10:30:00", courseCode: "CS101", courseName: "Intro to Programming" },
  { sessionId: 2, courseId: 1, instructorId: 1, semesterId: 4, sessionDate: "2026-05-08", startTime: "09:00", endTime: "10:30", sessionType: "Lecture", qrCode: "QR-CS101-DEMO-002", qrExpiry: "2026-05-08T10:30:00", courseCode: "CS101", courseName: "Intro to Programming" },
  { sessionId: 3, courseId: 2, instructorId: 2, semesterId: 4, sessionDate: "2026-05-02", startTime: "11:00", endTime: "12:30", sessionType: "Section", qrCode: "QR-MA201-DEMO-001", qrExpiry: "2026-05-02T12:30:00", courseCode: "MA201", courseName: "Linear Algebra" },
];

export async function mockGetSessions(): Promise<Session[]> {
  await delay(400);
  return MOCK_SESSIONS;
}

// ─── Attendance ────────────────────────────────────────────────────────────────
export const MOCK_ATTENDANCE: Attendance[] = [
  { attendanceId: 1, studentId: 1, sessionId: 1, status: "Present", method: "QR", recordedAt: "2026-05-01T09:05:00Z", studentName: "Sara Hassan", courseCode: "CS101", sessionDate: "2026-05-01" },
  { attendanceId: 2, studentId: 1, sessionId: 2, status: "Present", method: "QR", recordedAt: "2026-05-08T09:03:00Z", studentName: "Sara Hassan", courseCode: "CS101", sessionDate: "2026-05-08" },
  { attendanceId: 3, studentId: 2, sessionId: 1, status: "Absent", method: "Manual", recordedAt: "2026-05-01T09:00:00Z", studentName: "Ahmed Khalil", courseCode: "CS101", sessionDate: "2026-05-01" },
  { attendanceId: 4, studentId: 3, sessionId: 1, status: "Late", method: "Manual", recordedAt: "2026-05-01T09:20:00Z", studentName: "Layla Nasser", courseCode: "CS101", sessionDate: "2026-05-01" },
  { attendanceId: 5, studentId: 1, sessionId: 3, status: "Present", method: "QR", recordedAt: "2026-05-02T11:04:00Z", studentName: "Sara Hassan", courseCode: "MA201", sessionDate: "2026-05-02" },
];

export async function mockGetAttendance(): Promise<Attendance[]> {
  await delay(400);
  return MOCK_ATTENDANCE;
}

// ─── Exams ────────────────────────────────────────────────────────────────────
export const MOCK_EXAMS: Exam[] = [
  { examId: 1, courseId: 1, semesterId: 4, examType: "Midterm", examDate: "2026-04-15", startTime: "09:00", endTime: "11:00", room: "Hall 101", courseCode: "CS101", courseName: "Intro to Programming", semesterName: "Spring 2026" },
  { examId: 2, courseId: 2, semesterId: 4, examType: "Quiz", examDate: "2026-04-20", startTime: "11:00", endTime: "12:00", room: "Lab 203", courseCode: "MA201", courseName: "Linear Algebra", semesterName: "Spring 2026" },
  { examId: 3, courseId: 1, semesterId: 4, examType: "Final", examDate: "2026-06-10", startTime: "09:00", endTime: "12:00", room: "Hall 101", courseCode: "CS101", courseName: "Intro to Programming", semesterName: "Spring 2026" },
];

export async function mockGetExams(): Promise<Exam[]> {
  await delay(400);
  return MOCK_EXAMS;
}

// ─── Feedback ──────────────────────────────────────────────────────────────────
export const MOCK_FEEDBACK: Feedback[] = [
  { feedbackId: 1, studentId: 1, courseId: 1, feedbackText: "The lectures are engaging and well-paced.", sentiment: "Positive", submittedAt: "2026-04-10T10:00:00Z", studentName: "Sara Hassan", courseCode: "CS101", courseName: "Intro to Programming" },
  { feedbackId: 2, studentId: 2, courseId: 2, feedbackText: "Too much content, need more practice sessions.", sentiment: "Negative", submittedAt: "2026-04-12T14:00:00Z", studentName: "Ahmed Khalil", courseCode: "MA201", courseName: "Linear Algebra" },
  { feedbackId: 3, studentId: 3, courseId: 1, feedbackText: "Good course overall, lab sessions are helpful.", sentiment: "Positive", submittedAt: "2026-04-15T09:00:00Z", studentName: "Layla Nasser", courseCode: "CS101", courseName: "Intro to Programming" },
];

export async function mockGetFeedback(): Promise<Feedback[]> {
  await delay(400);
  return MOCK_FEEDBACK;
}

// ─── Risk Predictions ─────────────────────────────────────────────────────────
export const MOCK_RISK: RiskPrediction[] = [
  { predictionId: 1, studentId: 2, predictedRisk: "High", confidence: 91.5, gpaUsed: 2.10, attendanceUsed: 65, predictedAt: "2026-05-10T08:00:00Z" },
  { predictionId: 2, studentId: 3, predictedRisk: "Medium", confidence: 74.2, gpaUsed: 2.75, attendanceUsed: 80, predictedAt: "2026-05-10T08:00:00Z" },
  { predictionId: 3, studentId: 1, predictedRisk: "Low", confidence: 95.1, gpaUsed: 3.45, attendanceUsed: 92, predictedAt: "2026-05-10T08:00:00Z" },
];

export async function mockGetRiskPredictions(): Promise<RiskPrediction[]> {
  await delay(400);
  return MOCK_RISK;
}

// ─── Semester GPA ─────────────────────────────────────────────────────────────
export const MOCK_SEMESTER_GPA: SemesterGPA[] = [
  { semesterGpaId: 1, studentId: 1, semesterId: 1, gpa: 3.2, creditsEarned: 15, semesterName: "Fall 2024" },
  { semesterGpaId: 2, studentId: 1, semesterId: 2, gpa: 3.5, creditsEarned: 16, semesterName: "Spring 2025" },
  { semesterGpaId: 3, studentId: 1, semesterId: 3, gpa: 3.7, creditsEarned: 15, semesterName: "Fall 2025" },
  { semesterGpaId: 4, studentId: 1, semesterId: 4, gpa: 3.45, creditsEarned: 10, semesterName: "Spring 2026" },
  { semesterGpaId: 5, studentId: 2, semesterId: 1, gpa: 2.5, creditsEarned: 12, semesterName: "Fall 2024" },
  { semesterGpaId: 6, studentId: 2, semesterId: 2, gpa: 2.2, creditsEarned: 14, semesterName: "Spring 2025" },
  { semesterGpaId: 7, studentId: 2, semesterId: 3, gpa: 2.1, creditsEarned: 13, semesterName: "Fall 2025" },
];

export async function mockGetSemesterGPA(studentId: number): Promise<SemesterGPA[]> {
  await delay(400);
  return MOCK_SEMESTER_GPA.filter((g) => g.studentId === studentId);
}

// ─── View: Student Profile ─────────────────────────────────────────────────────
export async function mockGetMyProfile(userId: number): Promise<StudentProfile> {
  await delay(500);
  const student = MOCK_STUDENTS.find((s) => s.userId === userId);
  if (!student) throw new Error("Student not found");
  return {
    studentId: student.studentId,
    fullName: student.fullName!,
    email: student.email!,
    department: student.departmentName!,
    currentLevel: student.currentLevel,
    cgpa: student.cgpa,
    attendanceRate: student.attendanceRate,
    riskLevel: student.riskLevel,
  };
}

// ─── View: My Grades ──────────────────────────────────────────────────────────
const GRADE_DATA: MyGrade[] = [
  { gradeId: 1, code: "CS101", courseName: "Intro to Programming", semester: "Fall 2024", numericGrade: 88, letterGrade: "B", gradePoints: 3.0, gradedAt: "2025-01-15T10:00:00Z" },
  { gradeId: 2, code: "MA201", courseName: "Linear Algebra", semester: "Fall 2024", numericGrade: 95, letterGrade: "A", gradePoints: 4.0, gradedAt: "2025-01-16T10:00:00Z" },
  { gradeId: 3, code: "CS305", courseName: "Machine Learning", semester: "Spring 2025", numericGrade: 72, letterGrade: "C", gradePoints: 2.0, gradedAt: "2025-06-10T10:00:00Z" },
  { gradeId: 4, code: "CS101", courseName: "Intro to Programming", semester: "Spring 2026", numericGrade: 91, letterGrade: "A", gradePoints: 4.0, gradedAt: "2026-05-01T10:00:00Z" },
];

export async function mockGetMyGrades(): Promise<MyGrade[]> {
  await delay(500);
  return GRADE_DATA;
}

// ─── View: My Attendance ──────────────────────────────────────────────────────
const MY_ATT_DATA: MyAttendance[] = [
  { attendanceId: 1, code: "CS101", sessionDate: "2026-05-01", startTime: "09:00", status: "Present", method: "QR" },
  { attendanceId: 2, code: "CS101", sessionDate: "2026-05-08", startTime: "09:00", status: "Present", method: "QR" },
  { attendanceId: 5, code: "MA201", sessionDate: "2026-05-02", startTime: "11:00", status: "Present", method: "QR" },
  { attendanceId: 6, code: "CS305", sessionDate: "2026-04-28", startTime: "13:00", status: "Late", method: "Manual" },
  { attendanceId: 7, code: "CS101", sessionDate: "2026-04-25", startTime: "09:00", status: "Absent", method: "Manual" },
];

export async function mockGetMyAttendance(): Promise<MyAttendance[]> {
  await delay(400);
  return MY_ATT_DATA;
}

// ─── View: Course Enrollment (Admin) ─────────────────────────────────────────
export async function mockGetCourseEnrollment(): Promise<CourseEnrollment[]> {
  await delay(400);
  return MOCK_COURSES.map((c) => ({
    courseId: c.courseId,
    code: c.code,
    name: c.name,
    semester: "Spring 2026",
    enrolledCount: c.enrolledCount ?? 0,
  }));
}

// ─── View: High Risk Students (Admin) ────────────────────────────────────────
export async function mockGetHighRiskStudents(): Promise<HighRiskStudent[]> {
  await delay(400);
  return MOCK_STUDENTS.filter((s) => s.riskLevel !== "Low").map((s) => ({
    studentId: s.studentId,
    fullName: s.fullName!,
    cgpa: s.cgpa,
    attendanceRate: s.attendanceRate,
    riskLevel: s.riskLevel,
  }));
}

// ─── View: Course Students (Instructor) ──────────────────────────────────────
export async function mockGetCourseStudents(instructorId: number): Promise<CourseStudent[]> {
  await delay(500);
  return [
    { registrationId: 1, studentId: 1, fullName: "Sara Hassan", courseId: 1, code: "CS101", courseName: "Intro to Programming", semester: "Spring 2026", status: "enrolled" },
    { registrationId: 2, studentId: 2, fullName: "Ahmed Khalil", courseId: 1, code: "CS101", courseName: "Intro to Programming", semester: "Spring 2026", status: "enrolled" },
    { registrationId: 3, studentId: 3, fullName: "Layla Nasser", courseId: 1, code: "CS101", courseName: "Intro to Programming", semester: "Spring 2026", status: "enrolled" },
    { registrationId: 4, studentId: 1, fullName: "Sara Hassan", courseId: 2, code: "MA201", courseName: "Linear Algebra", semester: "Spring 2026", status: "enrolled" },
    { registrationId: 5, studentId: 2, fullName: "Ahmed Khalil", courseId: 2, code: "MA201", courseName: "Linear Algebra", semester: "Spring 2026", status: "enrolled" },
  ];
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────
export async function mockGetAdminStats(): Promise<AdminStats> {
  await delay(600);
  return {
    totalStudents: 3,
    totalInstructors: 5,
    totalCourses: 5,
    activeSemester: "Spring 2026",
    highRiskCount: 1,
    avgCGPA: 2.77,
    avgAttendance: 79,
  };
}

// ─── Attendance Summary ────────────────────────────────────────────────────────
export async function mockGetAttendanceSummary(): Promise<AttendanceSummary[]> {
  await delay(400);
  return [
    { studentId: 1, courseId: 1, presentCount: 8, absentCount: 1, lateCount: 1, totalSessions: 10 },
    { studentId: 1, courseId: 2, presentCount: 7, absentCount: 2, lateCount: 1, totalSessions: 10 },
    { studentId: 2, courseId: 1, presentCount: 4, absentCount: 5, lateCount: 1, totalSessions: 10 },
    { studentId: 3, courseId: 1, presentCount: 6, absentCount: 2, lateCount: 2, totalSessions: 10 },
  ];
}
