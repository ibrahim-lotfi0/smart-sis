'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { 
  getMyProfile, 
  getMyGrades, 
  getMyAttendance 
} from '@/lib/api/services';
import { 
  mockGetMyProfile, 
  mockGetSemesterGPA, 
  mockGetAttendanceSummary, 
  mockGetMyGrades 
} from '@/lib/api/mockApi';
import { StatCard, Badge } from '@/components/ui/DashboardUI';
import { GPAChart, AttendanceBarChart } from '@/components/charts/DashboardCharts';
import { 
  GraduationCap, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const userId = user?.userId || 7;

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['studentProfile', userId],
    queryFn: async () => {
      const data = await getMyProfile();
      return {
        ...data,
        studentId: data.StudentID,
        fullName: data.FullName,
        email: data.Email,
        department: data.Department,
        currentLevel: data.CurrentLevel,
        cgpa: data.CGPA,
        attendanceRate: data.AttendanceRate,
        riskLevel: data.RiskLevel
      };
    },
  });

  const { data: gpaHistory } = useQuery({
    queryKey: ['studentGPA', profile?.studentId],
    queryFn: () => mockGetSemesterGPA(profile!.studentId),
    enabled: !!profile,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['studentAttendance', profile?.studentId],
    queryFn: () => getMyAttendance(),
    enabled: !!profile,
  });

  const { data: recentGrades } = useQuery({
    queryKey: ['studentGrades'],
    queryFn: async () => {
      const data = await getMyGrades();
      return data.map((g: any) => ({
        gradeId: g.GradeID,
        code: g.Code,
        courseName: g.CourseName,
        semester: g.Semester,
        numericGrade: g.NumericGrade,
        letterGrade: g.LetterGrade,
        gradePoints: g.GradePoints,
        gradedAt: g.GradedAt
      }));
    },
  });

  const studentAtt = attendanceData ? [{ courseCode: 'Total', presentCount: Math.round((profile?.attendanceRate || 0) / 10) }] : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-extrabold text-text-primary tracking-tight"
            >
              Welcome back, <span className="text-primary">{user?.fullName?.split(' ')[0]}!</span> 👋
            </motion.h1>
            <p className="text-text-secondary font-medium mt-1">Here&apos;s your academic performance overview.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={profile?.riskLevel.toLowerCase() as any}>
              <AlertCircle size={14} />
              Risk Level: {profile?.riskLevel || '...'}
            </Badge>
            <div className="bg-white p-2 rounded-xl shadow-sm border border-primary/10 flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <span className="text-xs font-bold text-text-secondary">May 13, 2026</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Cumulative GPA" 
            value={profile?.cgpa || '0.00'} 
            icon={TrendingUp}
            trend={{ value: '0.12', isUp: true }}
            color="primary"
          />
          <StatCard 
            title="Attendance Rate" 
            value={`${profile?.attendanceRate || 0}%`} 
            icon={CheckCircle}
            trend={{ value: '2%', isUp: false }}
            color="secondary"
          />
          <StatCard 
            title="Current Level" 
            value={`Level ${profile?.currentLevel || 0}`} 
            icon={GraduationCap}
            color="success"
          />
          <StatCard 
            title="Total Credits" 
            value="124" 
            icon={Calendar}
            color="warning"
          />
        </div>

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GPA Progression */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                GPA Progression
              </h3>
              <button className="text-xs font-bold text-primary hover:underline">View History</button>
            </div>
            {gpaHistory && <GPAChart data={gpaHistory} />}
          </div>

          {/* Attendance Overview */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                <CheckCircle size={20} className="text-secondary" />
                Attendance by Course
              </h3>
              <button className="text-xs font-bold text-secondary hover:underline">Full Report</button>
            </div>
            {studentAtt.length > 0 && (
              <AttendanceBarChart 
                data={studentAtt.map(a => ({ 
                  courseCode: a.courseId === 1 ? 'CS101' : 'MA201', 
                  presentCount: a.presentCount 
                }))} 
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Grades */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-white">
              <h3 className="font-bold text-lg text-text-primary">Recent Exam Results</h3>
              <button className="btn-ghost !py-1.5 !px-3 !text-xs font-bold">See All Grades</button>
            </div>
            <div className="overflow-x-auto">
              <table className="sis-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Exam</th>
                    <th>Grade</th>
                    <th>Result</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGrades?.slice(0, 4).map((grade) => (
                    <tr key={grade.gradeId}>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{grade.code}</span>
                          <span className="text-[10px] text-text-secondary uppercase">{grade.courseName}</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant="neutral">Final Exam</Badge>
                      </td>
                      <td>
                        <span className="font-bold text-lg" style={{ color: (theme.colors.grade as any)[grade.letterGrade] }}>
                          {grade.letterGrade}
                        </span>
                        <span className="text-xs text-text-secondary ml-1">({grade.numericGrade}%)</span>
                      </td>
                      <td>
                        <Badge variant="primary">Passed</Badge>
                      </td>
                      <td>
                        <button className="p-2 hover:bg-primary/5 rounded-lg text-primary transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Profile Card */}
          <div className="card p-6 flex flex-col items-center text-center bg-gradient-to-br from-white to-primary/5">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-primary/10 flex items-center justify-center">
                <UserIcon size={48} className="text-primary" />
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            
            <h3 className="font-bold text-xl text-text-primary">{profile?.fullName}</h3>
            <p className="text-text-secondary text-sm font-medium">{profile?.email}</p>
            
            <div className="w-full mt-8 space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-primary/5">
                <span className="text-xs font-semibold text-text-secondary uppercase">Department</span>
                <span className="text-xs font-bold text-primary">{profile?.department}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-primary/5">
                <span className="text-xs font-semibold text-text-secondary uppercase">Student ID</span>
                <span className="text-xs font-bold text-text-primary">#ST-2024-{profile?.studentId}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-primary/5">
                <span className="text-xs font-semibold text-text-secondary uppercase">Academic Status</span>
                <Badge variant="primary">Active</Badge>
              </div>
            </div>

            <button className="btn-primary w-full mt-8 h-11">
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
