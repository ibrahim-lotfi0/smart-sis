'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { 
  getInstructorCourses, 
  getCourseStudents,
  getInstructorSessions
} from '@/lib/api/services';
import { 
  mockGetCourses, 
  mockGetCourseStudents, 
  mockGetFeedback, 
  mockGetSessions 
} from '@/lib/api/mockApi';
import { StatCard, Badge } from '@/components/ui/DashboardUI';
import { 
  BookOpen, 
  Users, 
  Video, 
  Award, 
  MessageSquare,
  QrCode,
  Plus,
  MoreVertical,
  Search,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';

export default function InstructorDashboard() {
  const { user } = useAuthStore();
  const instructorId = 1; // Demo instructor ID

  const { data: courses } = useQuery({
    queryKey: ['instructorCourses'],
    queryFn: async () => {
      const data = await getInstructorCourses();
      return data.map((c: any) => ({
        courseId: c.CourseID,
        code: c.Code,
        name: c.Name,
        credits: c.Credits,
        enrolledCount: c.EnrolledCount
      }));
    },
  });

  const { data: students } = useQuery({
    queryKey: ['courseStudents'],
    queryFn: () => getCourseStudents(),
  });

  const { data: feedback } = useQuery({
    queryKey: ['courseFeedback'],
    queryFn: () => mockGetFeedback(), // Keep mock for now
  });

  const { data: sessions } = useQuery({
    queryKey: ['instructorSessions'],
    queryFn: async () => {
      const data = await getInstructorSessions();
      return data.map((s: any) => ({
        sessionId: s.SessionID,
        courseCode: s.Code,
        sessionDate: new Date(s.SessionDate).toLocaleDateString(),
        startTime: s.StartTime,
        endTime: s.EndTime,
        sessionType: s.SessionType
      }));
    },
  });

  const instructorCourses = courses || [];
  const totalEnrolled = students?.length || 0;

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
              Instructor Portal 👨‍🏫
            </motion.h1>
            <p className="text-text-secondary font-medium mt-1">Manage your courses, sessions, and student grades.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn-primary shadow-glow">
              <Plus size={18} />
              Create Session
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Active Courses" 
            value={instructorCourses.length} 
            icon={BookOpen}
            color="primary"
          />
          <StatCard 
            title="Total Students" 
            value={totalEnrolled} 
            icon={Users}
            color="secondary"
          />
          <StatCard 
            title="Avg. Attendance" 
            value="84%" 
            icon={Video}
            color="success"
          />
          <StatCard 
            title="Pending Grades" 
            value="12" 
            icon={Award}
            color="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-text-primary">My Assigned Courses</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input type="text" placeholder="Search courses..." className="sis-input pl-10 !py-1.5 !text-xs w-48" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {instructorCourses.map((course) => (
                <motion.div 
                  key={course.courseId}
                  whileHover={{ y: -4 }}
                  className="card p-5 border-l-4 border-l-primary"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{course.code}</span>
                      <h4 className="font-bold text-lg text-text-primary truncate w-40">{course.name}</h4>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary">{course.enrolledCount} Enrolled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-text-secondary" />
                      <span className="text-xs font-semibold text-text-secondary">{course.credits} Credits</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      Manage Grades <ChevronRight size={14} />
                    </button>
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[8px] font-bold">
                          S{i}
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[8px] font-bold">
                        +{course.enrolledCount! - 3}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Sessions */}
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-lg text-text-primary">Upcoming & Recent Sessions</h3>
                <button className="text-xs font-bold text-primary">Schedule New</button>
              </div>
              <div className="overflow-x-auto">
                <table className="sis-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Date / Time</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>QR Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions?.slice(0, 5).map((session) => (
                      <tr key={session.sessionId}>
                        <td>
                          <span className="font-bold text-sm">{session.courseCode}</span>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{session.sessionDate}</span>
                            <span className="text-[10px] text-text-secondary">{session.startTime} - {session.endTime}</span>
                          </div>
                        </td>
                        <td>
                          <Badge variant="neutral">{session.sessionType}</Badge>
                        </td>
                        <td>
                          <Badge variant="primary">Scheduled</Badge>
                        </td>
                        <td>
                          <button className="p-2 hover:bg-primary/5 rounded-lg text-primary" title="Show QR">
                            <QrCode size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Area: Feedback & Tasks */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
            <div className="card p-6 bg-gradient-to-br from-primary to-primary-dark text-white shadow-glow">
              <h3 className="font-bold text-lg mb-4">Quick Classroom</h3>
              <p className="text-white/70 text-xs mb-6 font-medium">Create a session instantly to start taking attendance via QR codes.</p>
              <div className="space-y-3">
                <button className="w-full py-2.5 bg-white text-primary font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                  <QrCode size={18} />
                  Generate Lecture QR
                </button>
                <button className="w-full py-2.5 bg-white/10 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
                  Manual Attendance
                </button>
              </div>
            </div>

            {/* Student Feedback */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                  <MessageSquare size={20} className="text-secondary" />
                  Latest Feedback
                </h3>
              </div>
              <div className="space-y-4">
                {feedback?.slice(0, 3).map((fb) => (
                  <div key={fb.feedbackId} className="p-4 rounded-xl bg-surface border border-gray-100 relative group">
                    <div className="absolute top-4 right-4">
                      <Badge variant={fb.sentiment.toLowerCase() as any}>{fb.sentiment}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                        {fb.studentName?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-text-primary">{fb.studentName}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed italic">&quot;{fb.feedbackText}&quot;</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary">{fb.courseCode}</span>
                      <span className="text-[10px] text-text-secondary">2 days ago</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 border-2 border-primary/10 rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-colors">
                View All Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
