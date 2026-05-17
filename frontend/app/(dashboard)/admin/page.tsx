'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { 
  getAdminStats, 
  getHighRiskStudents, 
  getDepartments
} from '@/lib/api/services';
import { 
  mockGetAdminStats, 
  mockGetHighRiskStudents, 
  mockGetCourseEnrollment, 
  mockGetDepartments 
} from '@/lib/api/mockApi';
import { StatCard, Badge } from '@/components/ui/DashboardUI';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { theme } from '@/lib/theme';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => getAdminStats(),
  });

  const { data: highRisk } = useQuery({
    queryKey: ['highRiskStudents'],
    queryFn: async () => {
      const data = await getHighRiskStudents();
      return data.map((s: any) => ({
        studentId: s.StudentID,
        fullName: s.FullName,
        cgpa: s.CGPA,
        attendanceRate: s.AttendanceRate,
        riskLevel: s.RiskLevel
      }));
    },
  });

  const { data: enrollment } = useQuery({
    queryKey: ['courseEnrollment'],
    queryFn: () => mockGetCourseEnrollment(), // Keep mock for chart
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const data = await getDepartments();
      return data.map((d: any) => ({
        departmentId: d.DepartmentID,
        name: d.Name,
        students: d.Students,
        instructors: d.Instructors,
        courses: d.Courses,
        avgGpa: d.AvgGPA
      }));
    },
  });

  const pieData = [
    { name: 'Low Risk', value: 85, color: theme.colors.risk.Low.text },
    { name: 'Medium Risk', value: 10, color: theme.colors.risk.Medium.text },
    { name: 'High Risk', value: 5, color: theme.colors.risk.High.text },
  ];

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
              System Administration 🧑‍💼
            </motion.h1>
            <p className="text-text-secondary font-medium mt-1">Global university oversight and predictive risk analytics.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn-ghost !border-primary/10">
              <Calendar size={18} />
              Semester Settings
            </button>
            <button className="btn-primary shadow-glow">
              <BarChart3 size={18} />
              Export Reports
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Enrollment" 
            value={stats?.studentCount || 0} 
            icon={Users}
            color="primary"
            trend={{ value: '12%', isUp: true }}
          />
          <StatCard 
            title="Faculty Members" 
            value={stats?.instructorCount || 0} 
            icon={Building2}
            color="secondary"
          />
          <StatCard 
            title="Active Courses" 
            value={stats?.courseCount || 0} 
            icon={BookOpen}
            color="success"
          />
          <StatCard 
            title="High Risk Alerts" 
            value={stats?.highRiskCount || 0} 
            icon={AlertTriangle}
            color="danger"
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrollment Trends */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg text-text-primary">Course Enrollment Trends</h3>
              <select className="bg-surface border-none text-xs font-bold text-primary focus:ring-0 cursor-pointer rounded-lg px-2 py-1">
                <option>Spring 2026</option>
                <option>Fall 2025</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollment}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(108, 92, 231, 0.05)" />
                  <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#636E72' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#636E72' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(108, 92, 231, 0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: theme.shadows.card }}
                  />
                  <Bar dataKey="enrolledCount" fill={theme.colors.primary} radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="card p-6">
            <h3 className="font-bold text-lg text-text-primary mb-8">Risk Distribution</h3>
            <div className="h-60 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="block text-2xl font-bold text-text-primary">5%</span>
                <span className="block text-[10px] font-bold text-risk-high uppercase">High Risk</span>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-semibold text-text-secondary">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-text-primary">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Management Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Departments Quick View */}
          <div className="card p-6 space-y-6">
            <h3 className="font-bold text-lg text-text-primary">Departments</h3>
            <div className="space-y-4">
              {departments?.map((dept) => (
                <div key={dept.departmentId} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-primary/5 transition-colors group cursor-pointer border border-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Building2 size={16} />
                    </div>
                    <span className="text-xs font-bold text-text-primary">{dept.name}</span>
                  </div>
                  <ArrowUpRight size={14} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <button className="btn-ghost w-full !text-xs font-bold !py-2">Manage All</button>
          </div>

          {/* High Risk Students Table */}
          <div className="lg:col-span-3 card overflow-hidden">
            <div className="p-6 border-b border-primary/5 flex items-center justify-between">
              <h3 className="font-bold text-lg text-text-primary">High Risk Students (Early Intervention)</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Filter size={18} /></button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Search size={18} /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="sis-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>CGPA</th>
                    <th>Attendance</th>
                    <th>Risk Level</th>
                    <th>Prediction Confidence</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {highRisk?.map((student) => (
                    <tr key={student.studentId}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {student.fullName.charAt(0)}
                          </div>
                          <span className="font-bold text-sm">{student.fullName}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`font-bold ${student.cgpa < 2.5 ? 'text-risk-high' : 'text-text-primary'}`}>
                          {student.cgpa}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${student.attendanceRate < 70 ? 'bg-risk-high' : 'bg-risk-medium'}`} 
                              style={{ width: `${student.attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold">{student.attendanceRate}%</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant={student.riskLevel.toLowerCase() as any}>{student.riskLevel}</Badge>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-text-secondary">91.5% Confidence</span>
                      </td>
                      <td>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface/50 border-t border-primary/5 text-center">
              <button className="text-xs font-bold text-primary hover:underline">View Predictive Analysis Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
