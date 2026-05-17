// ─── TypeScript Types — exactly matching Smart SIS SQL Schema ───────────────

export type UserRole = "Admin" | "Instructor" | "TA" | "Student";
export type RiskLevel = "Low" | "Medium" | "High";
export type RegistrationStatus = "enrolled" | "dropped" | "completed";
export type AttendanceStatus = "Present" | "Absent" | "Late";
export type AttendanceMethod = "QR" | "Manual";
export type SessionType = "Lecture" | "Section";
export type ExamType = "Midterm" | "Final" | "Quiz";
export type LetterGrade = "A" | "B" | "C" | "D" | "F";
export type Sentiment = "Positive" | "Neutral" | "Negative";
export type Gender = "Male" | "Female";

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Department {
  departmentId: number;
  name: string;
  createdAt: string;
}

export interface User {
  userId: number;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Instructor {
  instructorId: number;
  userId: number;
  departmentId: number;
  phone: string | null;
  hireDate: string;
  // joined fields
  fullName?: string;
  email?: string;
  departmentName?: string;
}

export interface Student {
  studentId: number;
  userId: number;
  departmentId: number;
  nationalId: string | null;
  gender: Gender | null;
  nationality: string | null;
  birthDate: string | null;
  mobile: string | null;
  enrollmentYear: number;
  currentLevel: number;
  cgpa: number;
  attendanceRate: number;
  riskLevel: RiskLevel;
  // joined fields
  fullName?: string;
  email?: string;
  departmentName?: string;
}

export interface Semester {
  semesterId: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Course {
  courseId: number;
  code: string;
  name: string;
  credits: number;
  departmentId: number;
  instructorId: number | null;
  // joined fields
  departmentName?: string;
  instructorName?: string;
  enrolledCount?: number;
}

export interface Registration {
  registrationId: number;
  studentId: number;
  courseId: number;
  semesterId: number;
  registrationDate: string;
  status: RegistrationStatus;
  // joined fields
  studentName?: string;
  courseCode?: string;
  courseName?: string;
  semesterName?: string;
}

export interface Session {
  sessionId: number;
  courseId: number;
  instructorId: number;
  semesterId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
  qrCode: string;
  qrExpiry: string;
  // joined fields
  courseCode?: string;
  courseName?: string;
}

export interface Attendance {
  attendanceId: number;
  studentId: number;
  sessionId: number;
  status: AttendanceStatus;
  method: AttendanceMethod;
  recordedAt: string;
  // joined fields
  studentName?: string;
  courseCode?: string;
  sessionDate?: string;
}

export interface Exam {
  examId: number;
  courseId: number;
  semesterId: number;
  examType: ExamType;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  // joined
  courseCode?: string;
  courseName?: string;
  semesterName?: string;
}

export interface Grade {
  gradeId: number;
  registrationId: number;
  numericGrade: number;
  letterGrade: LetterGrade;
  gradePoints: number;
  gradedAt: string;
}

export interface SemesterGPA {
  semesterGpaId: number;
  studentId: number;
  semesterId: number;
  gpa: number;
  creditsEarned: number;
  semesterName?: string;
}

export interface Feedback {
  feedbackId: number;
  studentId: number;
  courseId: number;
  feedbackText: string;
  sentiment: Sentiment;
  submittedAt: string;
  // joined
  studentName?: string;
  courseCode?: string;
  courseName?: string;
}

export interface RiskPrediction {
  predictionId: number;
  studentId: number;
  predictedRisk: RiskLevel;
  confidence: number;
  gpaUsed: number;
  attendanceUsed: number;
  predictedAt: string;
}

export interface CourseAssistant {
  courseAssistantId: number;
  courseId: number;
  instructorId: number;
  assignedAt: string;
}

// ─── View Models (matching SQL Views) ────────────────────────────────────────

/** vw_StudentProfile & vw_MyStudentProfile */
export interface StudentProfile {
  studentId: number;
  fullName: string;
  email: string;
  department: string;
  currentLevel: number;
  cgpa: number;
  attendanceRate: number;
  riskLevel: RiskLevel;
}

/** vw_MyGrades */
export interface MyGrade {
  gradeId: number;
  code: string;
  courseName: string;
  semester: string;
  numericGrade: number;
  letterGrade: LetterGrade;
  gradePoints: number;
  gradedAt: string;
}

/** vw_MyAttendance */
export interface MyAttendance {
  attendanceId: number;
  code: string;
  sessionDate: string;
  startTime: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
}

/** vw_CourseEnrollment */
export interface CourseEnrollment {
  courseId: number;
  code: string;
  name: string;
  semester: string;
  enrolledCount: number;
}

/** vw_HighRiskStudents */
export interface HighRiskStudent {
  studentId: number;
  fullName: string;
  cgpa: number;
  attendanceRate: number;
  riskLevel: RiskLevel;
}

/** vw_MyCourseStudents */
export interface CourseStudent {
  registrationId: number;
  studentId: number;
  fullName: string;
  courseId: number;
  code: string;
  courseName: string;
  semester: string;
  status: RegistrationStatus;
}

/** vw_MyCourseGrades */
export interface CourseGrade {
  gradeId: number;
  registrationId: number;
  studentId: number;
  courseId: number;
  code: string;
  numericGrade: number;
  letterGrade: LetterGrade;
  gradePoints: number;
}

/** vw_AttendanceSummary */
export interface AttendanceSummary {
  studentId: number;
  courseId: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalSessions: number;
}

// ─── DTO / API Response Models ────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  email: string;
  fullName: string;
  userId: number;
}

export interface AdminStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  activeSemester: string;
  highRiskCount: number;
  avgCGPA: number;
  avgAttendance: number;
}
