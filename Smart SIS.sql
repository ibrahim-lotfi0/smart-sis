/* =====================================================================
   SMART UNIVERSITY MANAGEMENT SYSTEM
   Microsoft SQL Server (T-SQL) - Clean Version
   ---------------------------------------------------------------------
   Includes:
     - Database
     - Tables
     - Constraints
     - Indexes
     - Views
     - Roles & Security
     - Seed Data
   Removed:
     - Stored Procedures
     - Triggers
   ===================================================================== */

/* =========================================================
   0) DATABASE
   ========================================================= */
IF DB_ID('SmartUniversity') IS NOT NULL
BEGIN
    ALTER DATABASE SmartUniversity SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SmartUniversity;
END
GO
CREATE DATABASE SmartUniversity;
GO
USE SmartUniversity;
GO

/* =========================================================
   1) CORE TABLES
   ========================================================= */

-- 1.1 Departments
CREATE TABLE Department (
    DepartmentID   INT IDENTITY(1,1) PRIMARY KEY,
    Name           NVARCHAR(100) NOT NULL UNIQUE,
    CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 1.2 Users (authentication)
CREATE TABLE [User] (
    UserID         INT IDENTITY(1,1) PRIMARY KEY,
    Email          NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash   NVARCHAR(255) NOT NULL,
    FullName       NVARCHAR(150) NOT NULL,
    Role           NVARCHAR(20)  NOT NULL
                   CONSTRAINT CK_User_Role CHECK (Role IN ('Admin','Instructor','Student')),
    IsActive       BIT NOT NULL DEFAULT 1,
    CreatedAt      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 1.3 Instructors
CREATE TABLE Instructor (
    InstructorID   INT IDENTITY(1,1) PRIMARY KEY,
    UserID         INT NOT NULL UNIQUE,
    DepartmentID   INT NOT NULL,
    Phone          NVARCHAR(25),
    HireDate       DATE NOT NULL,
    CONSTRAINT FK_Instructor_User       FOREIGN KEY (UserID)       REFERENCES [User](UserID)       ON DELETE CASCADE,
    CONSTRAINT FK_Instructor_Department FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

-- 1.4 Students
CREATE TABLE Student (
    StudentID      INT IDENTITY(1,1) PRIMARY KEY,
    UserID         INT NOT NULL UNIQUE,
    DepartmentID   INT NOT NULL,
    NationalID     NVARCHAR(20) UNIQUE,
    Gender         NVARCHAR(10) CHECK (Gender IN ('Male','Female')),
    Nationality    NVARCHAR(50),
    BirthDate      DATE,
    Mobile         NVARCHAR(25),
    EnrollmentYear INT NOT NULL,
    CurrentLevel   INT NOT NULL CHECK (CurrentLevel BETWEEN 1 AND 6),
    CGPA           DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (CGPA BETWEEN 0 AND 4),
    AttendanceRate DECIMAL(5,2) NOT NULL DEFAULT 100.00 CHECK (AttendanceRate BETWEEN 0 AND 100),
    RiskLevel      NVARCHAR(10) NOT NULL DEFAULT 'Low'
                   CHECK (RiskLevel IN ('Low','Medium','High')),
    CONSTRAINT FK_Student_User       FOREIGN KEY (UserID)       REFERENCES [User](UserID) ON DELETE CASCADE,
    CONSTRAINT FK_Student_Department FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);

-- 1.5 Semesters
CREATE TABLE Semester (
    SemesterID   INT IDENTITY(1,1) PRIMARY KEY,
    Name         NVARCHAR(50) NOT NULL UNIQUE,
    StartDate    DATE NOT NULL,
    EndDate      DATE NOT NULL,
    IsActive     BIT NOT NULL DEFAULT 0,
    CONSTRAINT CK_Semester_Dates CHECK (EndDate > StartDate)
);

-- 1.6 Courses
CREATE TABLE Course (
    CourseID      INT IDENTITY(1,1) PRIMARY KEY,
    Code          NVARCHAR(15) NOT NULL UNIQUE,
    Name          NVARCHAR(150) NOT NULL,
    Credits       INT NOT NULL CHECK (Credits BETWEEN 1 AND 6),
    DepartmentID  INT NOT NULL,
    InstructorID  INT NULL,
    CONSTRAINT FK_Course_Department FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID),
    CONSTRAINT FK_Course_Instructor FOREIGN KEY (InstructorID) REFERENCES Instructor(InstructorID)
);

-- 1.7 Registrations
CREATE TABLE Registration (
    RegistrationID   INT IDENTITY(1,1) PRIMARY KEY,
    StudentID        INT NOT NULL,
    CourseID         INT NOT NULL,
    SemesterID       INT NOT NULL,
    RegistrationDate DATE NOT NULL DEFAULT CAST(SYSUTCDATETIME() AS DATE),
    Status           NVARCHAR(15) NOT NULL DEFAULT 'enrolled'
                     CHECK (Status IN ('enrolled','dropped','completed')),
    CONSTRAINT UQ_Registration UNIQUE (StudentID, CourseID, SemesterID),
    CONSTRAINT FK_Reg_Student  FOREIGN KEY (StudentID)  REFERENCES Student(StudentID)  ON DELETE CASCADE,
    CONSTRAINT FK_Reg_Course   FOREIGN KEY (CourseID)   REFERENCES Course(CourseID),
    CONSTRAINT FK_Reg_Semester FOREIGN KEY (SemesterID) REFERENCES Semester(SemesterID)
);

-- 1.8 Sessions
CREATE TABLE [Session] (
    SessionID    INT IDENTITY(1,1) PRIMARY KEY,
    CourseID     INT NOT NULL,
    InstructorID INT NOT NULL,
    SemesterID   INT NOT NULL,
    SessionDate  DATE NOT NULL,
    StartTime    TIME NOT NULL,
    EndTime      TIME NOT NULL,
    SessionType  NVARCHAR(15) NOT NULL CHECK (SessionType IN ('Lecture','Section')),
    QRCode       NVARCHAR(100) NOT NULL UNIQUE,
    QRExpiry     DATETIME2 NOT NULL,
    CONSTRAINT CK_Session_Time CHECK (EndTime > StartTime),
    CONSTRAINT FK_Session_Course     FOREIGN KEY (CourseID)     REFERENCES Course(CourseID),
    CONSTRAINT FK_Session_Instructor FOREIGN KEY (InstructorID) REFERENCES Instructor(InstructorID),
    CONSTRAINT FK_Session_Semester   FOREIGN KEY (SemesterID)   REFERENCES Semester(SemesterID)
);

-- 1.9 Attendance
CREATE TABLE Attendance (
    AttendanceID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID    INT NOT NULL,
    SessionID    INT NOT NULL,
    Status       NVARCHAR(10) NOT NULL CHECK (Status IN ('Present','Absent','Late')),
    Method       NVARCHAR(10) NOT NULL CHECK (Method IN ('QR','Manual')),
    RecordedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Attendance UNIQUE (StudentID, SessionID),
    CONSTRAINT FK_Att_Student FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    CONSTRAINT FK_Att_Session FOREIGN KEY (SessionID) REFERENCES [Session](SessionID) ON DELETE CASCADE
);

-- 1.10 Exams
CREATE TABLE Exam (
    ExamID     INT IDENTITY(1,1) PRIMARY KEY,
    CourseID   INT NOT NULL,
    SemesterID INT NOT NULL,
    ExamType   NVARCHAR(15) NOT NULL CHECK (ExamType IN ('Midterm','Final','Quiz')),
    ExamDate   DATE NOT NULL,
    StartTime  TIME NOT NULL,
    EndTime    TIME NOT NULL,
    Room       NVARCHAR(50),
    CONSTRAINT CK_Exam_Time CHECK (EndTime > StartTime),
    CONSTRAINT FK_Exam_Course   FOREIGN KEY (CourseID)   REFERENCES Course(CourseID),
    CONSTRAINT FK_Exam_Semester FOREIGN KEY (SemesterID) REFERENCES Semester(SemesterID)
);

-- 1.11 Grades
CREATE TABLE Grade (
    GradeID        INT IDENTITY(1,1) PRIMARY KEY,
    RegistrationID INT NOT NULL UNIQUE,
    NumericGrade   DECIMAL(5,2) NOT NULL CHECK (NumericGrade BETWEEN 0 AND 100),
    LetterGrade    CHAR(1) NOT NULL CHECK (LetterGrade IN ('A','B','C','D','F')),
    GradePoints    DECIMAL(3,2) NOT NULL CHECK (GradePoints BETWEEN 0 AND 4),
    GradedAt       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Grade_Registration FOREIGN KEY (RegistrationID) REFERENCES Registration(RegistrationID) ON DELETE CASCADE
);

-- 1.12 Semester GPA snapshot
CREATE TABLE SemesterGPA (
    SemesterGPAID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID     INT NOT NULL,
    SemesterID    INT NOT NULL,
    GPA           DECIMAL(3,2) NOT NULL CHECK (GPA BETWEEN 0 AND 4),
    CreditsEarned INT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_SemesterGPA UNIQUE (StudentID, SemesterID),
    CONSTRAINT FK_SGPA_Student  FOREIGN KEY (StudentID)  REFERENCES Student(StudentID)  ON DELETE CASCADE,
    CONSTRAINT FK_SGPA_Semester FOREIGN KEY (SemesterID) REFERENCES Semester(SemesterID)
);

-- 1.13 Feedback
CREATE TABLE Feedback (
    FeedbackID   INT IDENTITY(1,1) PRIMARY KEY,
    StudentID    INT NOT NULL,
    CourseID     INT NOT NULL,
    FeedbackText NVARCHAR(2000) NOT NULL,
    Sentiment    NVARCHAR(10) NOT NULL DEFAULT 'Neutral'
                 CHECK (Sentiment IN ('Positive','Neutral','Negative')),
    SubmittedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Fb_Student FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    CONSTRAINT FK_Fb_Course  FOREIGN KEY (CourseID)  REFERENCES Course(CourseID)
);

-- 1.14 ML Risk Predictions
CREATE TABLE RiskPrediction (
    PredictionID   INT IDENTITY(1,1) PRIMARY KEY,
    StudentID      INT NOT NULL,
    PredictedRisk  NVARCHAR(10) NOT NULL CHECK (PredictedRisk IN ('Low','Medium','High')),
    Confidence     DECIMAL(5,2) NOT NULL CHECK (Confidence BETWEEN 0 AND 100),
    GPAUsed        DECIMAL(3,2) NOT NULL,
    AttendanceUsed DECIMAL(5,2) NOT NULL,
    PredictedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Risk_Student FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE
);

/* =========================================================
   2) INDEXES
   ========================================================= */
CREATE INDEX IX_Student_Risk          ON Student(RiskLevel);
CREATE INDEX IX_Registration_Semester ON Registration(SemesterID, CourseID);
CREATE INDEX IX_Attendance_Session    ON Attendance(SessionID);
CREATE INDEX IX_Session_Date          ON [Session](SessionDate);
CREATE INDEX IX_Feedback_Course       ON Feedback(CourseID);
CREATE INDEX IX_Grade_Letter          ON Grade(LetterGrade);
GO

/* =========================================================
   3) VIEWS
   ========================================================= */

-- 3.1 Student profile with department + user info
CREATE OR ALTER VIEW vw_StudentProfile AS
SELECT s.StudentID, u.FullName, u.Email, d.Name AS Department,
       s.CurrentLevel, s.CGPA, s.AttendanceRate, s.RiskLevel
FROM Student s
JOIN [User] u       ON u.UserID = s.UserID
JOIN Department d   ON d.DepartmentID = s.DepartmentID;
GO

-- 3.2 Course enrollment counts per semester
CREATE OR ALTER VIEW vw_CourseEnrollment AS
SELECT c.CourseID, c.Code, c.Name, sem.Name AS Semester,
       COUNT(r.RegistrationID) AS EnrolledCount
FROM Course c
LEFT JOIN Registration r ON r.CourseID = c.CourseID AND r.Status = 'enrolled'
LEFT JOIN Semester sem   ON sem.SemesterID = r.SemesterID
GROUP BY c.CourseID, c.Code, c.Name, sem.Name;
GO

-- 3.3 Attendance summary per student / course
CREATE OR ALTER VIEW vw_AttendanceSummary AS
SELECT a.StudentID, s.CourseID,
       SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) AS PresentCount,
       SUM(CASE WHEN a.Status = 'Absent'  THEN 1 ELSE 0 END) AS AbsentCount,
       SUM(CASE WHEN a.Status = 'Late'    THEN 1 ELSE 0 END) AS LateCount,
       COUNT(*) AS TotalSessions
FROM Attendance a
JOIN [Session] s ON s.SessionID = a.SessionID
GROUP BY a.StudentID, s.CourseID;
GO

-- 3.4 High-risk students dashboard
CREATE OR ALTER VIEW vw_HighRiskStudents AS
SELECT s.StudentID, u.FullName, s.CGPA, s.AttendanceRate, s.RiskLevel
FROM Student s
JOIN [User] u ON u.UserID = s.UserID
WHERE s.RiskLevel = 'High';
GO

/* =========================================================
   4) ROLES & SECURITY
   ========================================================= */

IF DATABASE_PRINCIPAL_ID('app_admin')      IS NULL CREATE ROLE app_admin;
IF DATABASE_PRINCIPAL_ID('app_instructor') IS NULL CREATE ROLE app_instructor;
IF DATABASE_PRINCIPAL_ID('app_ta')         IS NULL CREATE ROLE app_ta;
IF DATABASE_PRINCIPAL_ID('app_student')    IS NULL CREATE ROLE app_student;
GO

/* -------- Course Assistants table (TA <-> Course mapping) -------- */
IF OBJECT_ID('dbo.CourseAssistant', 'U') IS NULL
BEGIN
    CREATE TABLE CourseAssistant (
        CourseAssistantID INT IDENTITY(1,1) PRIMARY KEY,
        CourseID     INT NOT NULL,
        InstructorID INT NOT NULL,
        AssignedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_CourseAssistant UNIQUE (CourseID, InstructorID),
        CONSTRAINT FK_CA_Course     FOREIGN KEY (CourseID)     REFERENCES Course(CourseID) ON DELETE CASCADE,
        CONSTRAINT FK_CA_Instructor FOREIGN KEY (InstructorID) REFERENCES Instructor(InstructorID) ON DELETE CASCADE
    );
END
GO

/* -------- Helper functions: map current login -> StudentID / InstructorID -------- */
CREATE OR ALTER FUNCTION dbo.fn_CurrentStudentID() RETURNS INT
AS
BEGIN
    DECLARE @id INT;
    SELECT @id = s.StudentID
    FROM Student s
    JOIN [User] u ON u.UserID = s.UserID
    WHERE u.Email = SUSER_SNAME();
    RETURN @id;
END
GO

CREATE OR ALTER FUNCTION dbo.fn_CurrentInstructorID() RETURNS INT
AS
BEGIN
    DECLARE @id INT;
    SELECT @id = i.InstructorID
    FROM Instructor i
    JOIN [User] u ON u.UserID = i.UserID
    WHERE u.Email = SUSER_SNAME();
    RETURN @id;
END
GO

/* -------- Row-filtered views -------- */

CREATE OR ALTER VIEW vw_MyStudentProfile AS
SELECT s.StudentID, u.FullName, u.Email, d.Name AS Department,
       s.CurrentLevel, s.CGPA, s.AttendanceRate, s.RiskLevel
FROM Student s
JOIN [User] u     ON u.UserID = s.UserID
JOIN Department d ON d.DepartmentID = s.DepartmentID
WHERE s.StudentID = dbo.fn_CurrentStudentID();
GO

CREATE OR ALTER VIEW vw_MyGrades AS
SELECT g.GradeID, c.Code, c.Name AS CourseName, sem.Name AS Semester,
       g.NumericGrade, g.LetterGrade, g.GradePoints, g.GradedAt
FROM Grade g
JOIN Registration r ON r.RegistrationID = g.RegistrationID
JOIN Course c       ON c.CourseID = r.CourseID
JOIN Semester sem   ON sem.SemesterID = r.SemesterID
WHERE r.StudentID = dbo.fn_CurrentStudentID();
GO

CREATE OR ALTER VIEW vw_MyAttendance AS
SELECT a.AttendanceID, c.Code, s.SessionDate, s.StartTime, a.Status, a.Method
FROM Attendance a
JOIN [Session] s ON s.SessionID = a.SessionID
JOIN Course c    ON c.CourseID = s.CourseID
WHERE a.StudentID = dbo.fn_CurrentStudentID();
GO

CREATE OR ALTER VIEW vw_MyCourseStudents AS
SELECT r.RegistrationID, r.StudentID, u.FullName, c.CourseID, c.Code, c.Name AS CourseName,
       sem.Name AS Semester, r.Status
FROM Registration r
JOIN Student   st  ON st.StudentID = r.StudentID
JOIN [User]    u   ON u.UserID = st.UserID
JOIN Course    c   ON c.CourseID = r.CourseID
JOIN Semester  sem ON sem.SemesterID = r.SemesterID
WHERE c.InstructorID = dbo.fn_CurrentInstructorID()
   OR EXISTS (
       SELECT 1
       FROM CourseAssistant ca
       WHERE ca.CourseID = c.CourseID
         AND ca.InstructorID = dbo.fn_CurrentInstructorID()
   );
GO

CREATE OR ALTER VIEW vw_MyCourseGrades AS
SELECT g.GradeID, g.RegistrationID, r.StudentID, c.CourseID, c.Code,
       g.NumericGrade, g.LetterGrade, g.GradePoints
FROM Grade g
JOIN Registration r ON r.RegistrationID = g.RegistrationID
JOIN Course c       ON c.CourseID = r.CourseID
WHERE c.InstructorID = dbo.fn_CurrentInstructorID()
   OR EXISTS (
       SELECT 1
       FROM CourseAssistant ca
       WHERE ca.CourseID = c.CourseID
         AND ca.InstructorID = dbo.fn_CurrentInstructorID()
   );
GO

CREATE OR ALTER VIEW vw_MyCourseAttendance AS
SELECT a.AttendanceID, a.StudentID, a.Status, a.Method, s.SessionID, s.SessionDate, c.CourseID, c.Code
FROM Attendance a
JOIN [Session] s ON s.SessionID = a.SessionID
JOIN Course c    ON c.CourseID = s.CourseID
WHERE c.InstructorID = dbo.fn_CurrentInstructorID()
   OR EXISTS (
       SELECT 1
       FROM CourseAssistant ca
       WHERE ca.CourseID = c.CourseID
         AND ca.InstructorID = dbo.fn_CurrentInstructorID()
   );
GO

/* -------- GRANTS / REVOKES -------- */
REVOKE SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo FROM app_admin, app_instructor, app_ta, app_student;
GO

-- Admin
GRANT CONTROL ON DATABASE::SmartUniversity TO app_admin;

-- Instructor
GRANT SELECT ON Department      TO app_instructor;
GRANT SELECT ON Semester        TO app_instructor;
GRANT SELECT ON Course          TO app_instructor;
GRANT SELECT ON Instructor      TO app_instructor;
GRANT SELECT ON CourseAssistant TO app_instructor;
DENY  SELECT ON Student         TO app_instructor;
DENY  SELECT ON [User]          TO app_instructor;
GRANT SELECT ON vw_MyCourseStudents   TO app_instructor;
GRANT SELECT ON vw_MyCourseGrades     TO app_instructor;
GRANT SELECT ON vw_MyCourseAttendance TO app_instructor;
GRANT SELECT, INSERT, UPDATE, DELETE ON [Session]    TO app_instructor;
GRANT SELECT, INSERT, UPDATE, DELETE ON Attendance   TO app_instructor;
GRANT SELECT, INSERT, UPDATE, DELETE ON Exam         TO app_instructor;
GRANT SELECT, INSERT, UPDATE, DELETE ON Grade        TO app_instructor;
GRANT SELECT, INSERT, UPDATE, DELETE ON Registration TO app_instructor;
GRANT SELECT ON Feedback TO app_instructor;
GRANT INSERT, DELETE ON CourseAssistant TO app_instructor;

-- TA
GRANT SELECT ON Department      TO app_ta;
GRANT SELECT ON Semester        TO app_ta;
GRANT SELECT ON Course          TO app_ta;
GRANT SELECT ON Instructor      TO app_ta;
GRANT SELECT ON CourseAssistant TO app_ta;
DENY  SELECT ON Student         TO app_ta;
DENY  SELECT ON [User]          TO app_ta;
GRANT SELECT ON vw_MyCourseStudents   TO app_ta;
GRANT SELECT ON vw_MyCourseAttendance TO app_ta;
GRANT SELECT, INSERT, UPDATE ON [Session]  TO app_ta;
GRANT SELECT, INSERT, UPDATE ON Attendance TO app_ta;
GRANT SELECT ON Exam TO app_ta;
DENY  INSERT, UPDATE, DELETE ON Exam  TO app_ta;
DENY  SELECT, INSERT, UPDATE, DELETE ON Grade TO app_ta;
DENY  INSERT, UPDATE, DELETE ON Registration TO app_ta;
GRANT SELECT ON Registration TO app_ta;

-- Student
GRANT SELECT ON Department TO app_student;
GRANT SELECT ON Semester   TO app_student;
GRANT SELECT ON Course     TO app_student;
DENY  SELECT ON Student        TO app_student;
DENY  SELECT ON [User]         TO app_student;
DENY  SELECT ON Grade          TO app_student;
DENY  SELECT ON Attendance     TO app_student;
DENY  SELECT ON SemesterGPA    TO app_student;
DENY  SELECT ON RiskPrediction TO app_student;
DENY  SELECT ON Registration   TO app_student;
DENY  SELECT, INSERT, UPDATE, DELETE ON [Session] TO app_student;
DENY  INSERT, UPDATE, DELETE ON Grade        TO app_student;
DENY  INSERT, UPDATE, DELETE ON Attendance   TO app_student;
DENY  INSERT, UPDATE, DELETE ON Registration TO app_student;
GRANT SELECT ON vw_MyStudentProfile TO app_student;
GRANT SELECT ON vw_MyGrades         TO app_student;
GRANT SELECT ON vw_MyAttendance     TO app_student;
GRANT INSERT, SELECT ON Feedback    TO app_student;
GO

/* =========================================================
   5) SEED DATA
   ========================================================= */

-- Departments
INSERT INTO Department(Name) VALUES
('Computer Science'),('Mathematics'),('Physics'),('Engineering'),('Business');

-- Semesters
INSERT INTO Semester(Name,StartDate,EndDate,IsActive) VALUES
('Fall 2024',  '2024-09-15','2025-01-20',0),
('Spring 2025','2025-02-10','2025-06-15',0),
('Fall 2025',  '2025-09-15','2026-01-20',0),
('Spring 2026','2026-02-10','2026-06-15',1);

-- Users
INSERT INTO [User](Email,PasswordHash,FullName,Role) VALUES
('admin@uni.edu',      'hash_admin', 'Dr. Admin',          'Admin'),
('khalil@uni.edu',     'hash_instr',  'Dr. Khalil Mansour', 'Instructor'),
('nasser@uni.edu',     'hash_instr',  'Dr. Nasser Awad',    'Instructor'),
('awad@uni.edu',       'hash_instr',  'Dr. Awad Saleh',     'Instructor'),
('fares@uni.edu',      'hash_instr',  'Dr. Fares Habib',    'Instructor'),
('saleh@uni.edu',      'hash_instr',  'Dr. Saleh Qasim',    'Instructor'),
('student1000@uni.edu','hash_stud',   'Sara Hassan',        'Student'),
('student1001@uni.edu','hash_stud',   'Ahmed Khalil',       'Student'),
('student1002@uni.edu','hash_stud',   'Layla Nasser',       'Student');

-- Instructors
INSERT INTO Instructor(UserID,DepartmentID,Phone,HireDate)
SELECT u.UserID, d.DepartmentID, p.Phone, p.HireDate
FROM (VALUES
 ('khalil@uni.edu','Computer Science','+20 100 111 2233','2018-09-01'),
 ('nasser@uni.edu','Mathematics',     '+20 100 222 3344','2015-02-15'),
 ('awad@uni.edu',  'Computer Science','+20 100 333 4455','2020-01-10'),
 ('fares@uni.edu', 'Physics',         '+20 100 444 5566','2012-08-20'),
 ('saleh@uni.edu', 'Business',        '+20 100 555 6677','2019-03-12')
) AS p(Email,Dept,Phone,HireDate)
JOIN [User] u ON u.Email = p.Email
JOIN Department d ON d.Name = p.Dept;

-- Students
INSERT INTO Student(UserID,DepartmentID,NationalID,Gender,Nationality,BirthDate,Mobile,EnrollmentYear,CurrentLevel,CGPA,AttendanceRate,RiskLevel)
SELECT u.UserID, d.DepartmentID, s.NID, s.Gender, 'Egyptian', s.BirthDate, s.Mobile, 2023, s.Lvl, s.CGPA, s.Att, s.Risk
FROM (VALUES
 ('student1000@uni.edu','Computer Science','29901000001','Female','2003-05-10','+20 1011000001',2,3.45,92.0,'Low'),
 ('student1001@uni.edu','Mathematics',     '29901000002','Male',  '2002-07-21','+20 1011000002',3,2.10,65.0,'High'),
 ('student1002@uni.edu','Computer Science','29901000003','Female','2003-11-03','+20 1011000003',2,2.75,80.0,'Medium')
) AS s(Email,Dept,NID,Gender,BirthDate,Mobile,Lvl,CGPA,Att,Risk)
JOIN [User] u ON u.Email = s.Email
JOIN Department d ON d.Name = s.Dept;

-- Courses
INSERT INTO Course(Code,Name,Credits,DepartmentID,InstructorID)
SELECT c.Code, c.Name, c.Credits, d.DepartmentID, i.InstructorID
FROM (VALUES
 ('CS101','Intro to Programming',3,'Computer Science','khalil@uni.edu'),
 ('MA201','Linear Algebra',      4,'Mathematics',     'nasser@uni.edu'),
 ('CS305','Machine Learning',    3,'Computer Science','awad@uni.edu'),
 ('PH102','Physics II',          4,'Physics',         'fares@uni.edu'),
 ('BU210','Microeconomics',      3,'Business',        'saleh@uni.edu')
) AS c(Code,Name,Credits,Dept,InstrEmail)
JOIN Department d ON d.Name = c.Dept
JOIN [User] u     ON u.Email = c.InstrEmail
JOIN Instructor i ON i.UserID = u.UserID;

-- Sample Registrations (active semester)
DECLARE @ActiveSem INT = (SELECT SemesterID FROM Semester WHERE IsActive = 1);
INSERT INTO Registration(StudentID,CourseID,SemesterID,Status)
SELECT st.StudentID, c.CourseID, @ActiveSem, 'enrolled'
FROM Student st
CROSS JOIN Course c
WHERE c.Code IN ('CS101','MA201','CS305');

-- Sample Exam
INSERT INTO Exam(CourseID,SemesterID,ExamType,ExamDate,StartTime,EndTime,Room)
SELECT c.CourseID, @ActiveSem, 'Midterm', '2026-04-15', '09:00', '11:00', 'Hall 101'
FROM Course c
WHERE c.Code = 'CS101';

-- Sample Feedback
INSERT INTO Feedback(StudentID,CourseID,FeedbackText,Sentiment)
SELECT st.StudentID, c.CourseID,
       'The lectures are engaging and well-paced.', 'Positive'
FROM Student st
JOIN [User] u ON u.UserID = st.UserID
JOIN Course c ON c.Code = 'CS101'
WHERE u.Email = 'student1000@uni.edu';

-- Sample Session + QR
INSERT INTO [Session](CourseID,InstructorID,SemesterID,SessionDate,StartTime,EndTime,SessionType,QRCode,QRExpiry)
SELECT c.CourseID, c.InstructorID, @ActiveSem, '2026-05-01', '09:00', '10:30', 'Lecture',
       'QR-CS101-DEMO-001', '2026-05-01T10:30:00'
FROM Course c
WHERE c.Code = 'CS101';
GO