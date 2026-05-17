'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { 
  mockGetCourses, 
  mockGetCourseStudents, 
  mockGetSessions
} from '@/lib/api/mockApi';
import { StatCard, Badge } from '@/components/ui/DashboardUI';
import { 
  BookOpen, 
  Users, 
  Video, 
  CheckSquare,
  QrCode,
  Search,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TADashboard() {
  const { user } = useAuthStore();
  const taId = 4; // Demo TA ID (Dr. Awad Saleh in seed)

  const { data: courses } = useQuery({
    queryKey: ['taCourses'],
    queryFn: () => mockGetCourses(),
  });

  const { data: sessions } = useQuery({
    queryKey: ['taSessions'],
    queryFn: () => mockGetSessions(),
  });

  // For TA, we simulate they are assigned to CS101 as an assistant
  const taCourses = courses?.filter(c => c.code === 'CS101') || [];

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
              TA Portal 👨‍🔬
            </motion.h1>
            <p className="text-text-secondary font-medium mt-1">Limited Assistant access for designated courses.</p>
          </div>
          
          <Badge variant="primary">
            <Info size={14} />
            TA Permissions Active
          </Badge>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
          <Lock className="text-secondary shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-bold text-secondary">Limited Access Notice</h4>
            <p className="text-xs text-secondary/80 mt-1 font-medium">
              As a Teaching Assistant, you can take attendance and manage session QR codes. 
              Grade editing and course configuration are restricted to the primary Instructor.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Assigned Courses" 
            value={taCourses.length} 
            icon={BookOpen}
            color="primary"
          />
          <StatCard 
            title="Assigned Students" 
            value="42" 
            icon={Users}
            color="secondary"
          />
          <StatCard 
            title="Sessions Today" 
            value="1" 
            icon={Video}
            color="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-text-primary">Assigned Courses (Assistant)</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {taCourses.map((course) => (
                <div key={course.courseId} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-l-secondary">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{course.code}</span>
                      <h4 className="font-bold text-lg text-text-primary">{course.name}</h4>
                      <p className="text-xs text-text-secondary font-medium">Primary: {course.instructorName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="block text-lg font-bold text-text-primary">32</span>
                      <span className="block text-[10px] font-bold text-text-secondary uppercase">Students</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-lg font-bold text-text-primary">12</span>
                      <span className="block text-[10px] font-bold text-text-secondary uppercase">Sessions</span>
                    </div>
                    <button className="btn-secondary !py-2 !px-4 !text-xs">
                      Take Attendance
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Session Table */}
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-white">
                <h3 className="font-bold text-lg text-text-primary">Upcoming Sessions</h3>
                <button className="text-xs font-bold text-secondary">View Schedule</button>
              </div>
              <div className="overflow-x-auto">
                <table className="sis-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions?.slice(0, 3).map((session) => (
                      <tr key={session.sessionId}>
                        <td><span className="font-bold text-sm">{session.courseCode}</span></td>
                        <td>
                          <div className="text-xs font-medium">{session.sessionDate}</div>
                          <div className="text-[10px] text-text-secondary">{session.startTime}</div>
                        </td>
                        <td><Badge variant="primary">Active</Badge></td>
                        <td>
                          <button className="flex items-center gap-1.5 text-xs font-bold text-secondary">
                            <QrCode size={14} />
                            Launch QR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="card p-6 bg-surface border-dashed border-2 border-primary/20">
            <h3 className="font-bold text-lg text-text-primary mb-6 flex items-center gap-2">
              <CheckSquare size={20} className="text-primary" />
              Attendance Control
            </h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-white rounded-2xl border border-primary/5">
                <p className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">Active Session</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-text-primary">CS101 - Lecture</span>
                  <Badge variant="neutral">Started</Badge>
                </div>
                <button className="btn-primary w-full shadow-glow">
                  <QrCode size={18} />
                  Display QR Code
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Assigned Tasks</p>
                {[
                  "Verify manual attendance for Hall 101",
                  "Upload session materials for MA201",
                  "Prepare quiz room for Level 2 students"
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-primary/5 hover:border-primary/20 cursor-pointer transition-colors group">
                    <div className="w-4 h-4 rounded border-2 border-primary/20 group-hover:border-primary transition-colors"></div>
                    <span className="text-xs font-medium text-text-primary">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
