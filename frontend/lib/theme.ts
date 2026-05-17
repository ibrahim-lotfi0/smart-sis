// ─── Theme Design Tokens ────────────────────────────────────────────
export const theme = {
  colors: {
    primary: "#6C5CE7",
    primaryDark: "#5647C8",
    primaryLight: "#8575FF",
    secondary: "#0984E3",
    secondaryDark: "#076DB8",

    // Risk Level Colors
    risk: {
      Low: { bg: "rgba(0,184,148,0.12)", text: "#00B894", border: "rgba(0,184,148,0.3)" },
      Medium: { bg: "rgba(253,203,110,0.15)", text: "#E17055", border: "rgba(253,203,110,0.4)" },
      High: { bg: "rgba(214,48,49,0.1)", text: "#D63031", border: "rgba(214,48,49,0.3)" },
    },

    // Status Colors
    status: {
      enrolled: { bg: "rgba(9,132,227,0.1)", text: "#0984E3" },
      completed: { bg: "rgba(0,184,148,0.1)", text: "#00B894" },
      dropped: { bg: "rgba(214,48,49,0.1)", text: "#D63031" },
    },

    // Attendance
    attendance: {
      Present: { bg: "rgba(0,184,148,0.1)", text: "#00B894" },
      Absent: { bg: "rgba(214,48,49,0.1)", text: "#D63031" },
      Late: { bg: "rgba(253,203,110,0.12)", text: "#E17055" },
    },

    // Sentiment
    sentiment: {
      Positive: { bg: "rgba(0,184,148,0.1)", text: "#00B894" },
      Neutral: { bg: "rgba(108,92,231,0.1)", text: "#6C5CE7" },
      Negative: { bg: "rgba(214,48,49,0.1)", text: "#D63031" },
    },

    // Grade Letters
    grade: {
      A: "#00B894",
      B: "#0984E3",
      C: "#FDCB6E",
      D: "#E17055",
      F: "#D63031",
    },

    surface: "#F5F9FF",
    card: "#FFFFFF",
    border: "rgba(108, 92, 231, 0.1)",

    text: {
      primary: "#1A1A2E",
      secondary: "#636E72",
      muted: "#B2BEC3",
    },

    sidebar: {
      bg: "linear-gradient(180deg, #2D1B69 0%, #1A0E3D 50%, #0D0723 100%)",
      text: "rgba(255,255,255,0.7)",
      textActive: "#FFFFFF",
      itemActive: "rgba(108,92,231,0.25)",
      itemHover: "rgba(255,255,255,0.07)",
    },
  },

  shadows: {
    card: "0 4px 24px rgba(108, 92, 231, 0.08)",
    cardHover: "0 8px 32px rgba(108, 92, 231, 0.16)",
    glass: "0 8px 32px rgba(31, 38, 135, 0.1)",
    glow: "0 0 20px rgba(108, 92, 231, 0.4)",
    glowBlue: "0 0 20px rgba(9, 132, 227, 0.4)",
  },

  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
  },

  transitions: {
    fast: "all 0.15s ease",
    normal: "all 0.2s ease",
    slow: "all 0.3s ease",
  },
} as const;

// Role-specific sidebar navigation
export const roleNavigation = {
  Admin: [
    { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { label: "Departments", href: "/admin/departments", icon: "Building2" },
    { label: "Users", href: "/admin/users", icon: "Users" },
    { label: "Students", href: "/admin/students", icon: "GraduationCap" },
    { label: "Instructors", href: "/admin/instructors", icon: "Briefcase" },
    { label: "Courses", href: "/admin/courses", icon: "BookOpen" },
    { label: "Semesters", href: "/admin/semesters", icon: "Calendar" },
    { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
    { label: "High Risk", href: "/admin/risk", icon: "AlertTriangle" },
  ],
  Instructor: [
    { label: "Dashboard", href: "/instructor", icon: "LayoutDashboard" },
    { label: "My Courses", href: "/instructor/courses", icon: "BookOpen" },
    { label: "Sessions", href: "/instructor/sessions", icon: "Video" },
    { label: "Attendance", href: "/instructor/attendance", icon: "CheckSquare" },
    { label: "Grades", href: "/instructor/grades", icon: "Award" },
    { label: "Students", href: "/instructor/students", icon: "GraduationCap" },
    { label: "Exams", href: "/instructor/exams", icon: "FileText" },
  ],
  TA: [
    { label: "Dashboard", href: "/ta", icon: "LayoutDashboard" },
    { label: "My Courses", href: "/ta/courses", icon: "BookOpen" },
    { label: "Sessions", href: "/ta/sessions", icon: "Video" },
    { label: "Attendance", href: "/ta/attendance", icon: "CheckSquare" },
    { label: "Students", href: "/ta/students", icon: "GraduationCap" },
  ],
  Student: [
    { label: "Dashboard", href: "/student", icon: "LayoutDashboard" },
    { label: "My Profile", href: "/student/profile", icon: "User" },
    { label: "Grades", href: "/student/grades", icon: "Award" },
    { label: "Attendance", href: "/student/attendance", icon: "CheckSquare" },
    { label: "Courses", href: "/student/courses", icon: "BookOpen" },
    { label: "Feedback", href: "/student/feedback", icon: "MessageSquare" },
  ],
} as const;
