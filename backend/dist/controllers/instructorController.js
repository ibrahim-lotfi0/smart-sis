"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionAttendance = exports.assignTA = exports.getAssignedTAs = exports.getAvailableTAs = exports.saveGrades = exports.getPendingGrades = exports.getInstructorSessions = exports.createSession = exports.getCourseStudents = exports.getInstructorCourses = void 0;
const db_1 = require("../config/db");
const getInstructorCourses = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request()
            .input('userId', db_1.sql.Int, req.user.userId)
            .query(`
        SELECT c.CourseID, c.Code, c.Name, c.Credits, d.Name as DepartmentName,
               ISNULL(ce.EnrolledCount, 0) as Enrolled, 30 as MaxCapacity
        FROM Course c
        JOIN Department d ON c.DepartmentID = d.DepartmentID
        LEFT JOIN vw_CourseEnrollment ce ON ce.CourseID = c.CourseID AND ce.Semester = (SELECT Name FROM Semester WHERE IsActive = 1)
        WHERE c.InstructorID = (SELECT InstructorID FROM Instructor WHERE UserID = @userId)
      `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error fetching instructor courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getInstructorCourses = getInstructorCourses;
const getCourseStudents = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request()
            .input('userId', db_1.sql.Int, req.user.userId)
            .query(`
        SELECT r.RegistrationID, r.StudentID, u.FullName, u.Email, c.Code, c.Name AS CourseName,
               sem.Name AS Semester, r.Status,
               st.CurrentLevel, st.NationalID, st.Mobile, st.Gender,
               st.CGPA, st.AttendanceRate AS Attendance, st.RiskLevel, st.EnrollmentYear
        FROM Registration r
        JOIN Student st ON st.StudentID = r.StudentID
        JOIN [User] u ON u.UserID = st.UserID
        JOIN Course c ON c.CourseID = r.CourseID
        JOIN Semester sem ON sem.SemesterID = r.SemesterID
        WHERE c.InstructorID = (SELECT InstructorID FROM Instructor WHERE UserID = @userId)
           OR c.CourseID IN (
              SELECT ca.CourseID FROM CourseAssistant ca
              WHERE ca.InstructorID = (SELECT InstructorID FROM Instructor WHERE UserID = @userId)
           )
      `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error fetching course students:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCourseStudents = getCourseStudents;
const createSession = async (req, res) => {
    console.log('Create Session Request:', req.body);
    const { courseId, sessionDate, startTime, endTime, sessionType, qrCode } = req.body;
    try {
        const pool = await db_1.poolPromise;
        const instructorResult = await pool.request()
            .input('userId', db_1.sql.Int, req.user.userId)
            .query('SELECT InstructorID FROM Instructor WHERE UserID = @userId');
        const instructorId = instructorResult.recordset[0].InstructorID;
        const activeSemester = await pool.request()
            .query('SELECT SemesterID FROM Semester WHERE IsActive = 1');
        const semesterId = activeSemester.recordset[0].SemesterID;
        await pool.request()
            .input('courseId', db_1.sql.Int, parseInt(courseId))
            .input('instructorId', db_1.sql.Int, instructorId)
            .input('semesterId', db_1.sql.Int, semesterId)
            .input('date', db_1.sql.Date, sessionDate)
            .input('start', db_1.sql.Time, startTime)
            .input('end', db_1.sql.Time, endTime)
            .input('type', db_1.sql.NVarChar, sessionType)
            .input('qr', db_1.sql.NVarChar, qrCode)
            .input('expiry', db_1.sql.DateTime2, new Date(Date.now() + 3600000)) // 1 hour expiry
            .query(`
        INSERT INTO [Session] (CourseID, InstructorID, SemesterID, SessionDate, StartTime, EndTime, SessionType, QRCode, QRExpiry)
        VALUES (@courseId, @instructorId, @semesterId, @date, @start, @end, @type, @qr, @expiry)
      `);
        res.status(201).json({ message: 'Session created successfully' });
    }
    catch (err) {
        console.error('Error creating session:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createSession = createSession;
const getInstructorSessions = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request()
            .input('userId', db_1.sql.Int, req.user.userId)
            .query(`
        SELECT s.SessionID, s.SessionDate AS Date, 
               FORMAT(s.StartTime, 'hh:mm tt') AS Time, 
               c.Code, s.SessionType AS Type,
               ISNULL((SELECT COUNT(*) FROM Attendance a WHERE a.SessionID = s.SessionID AND a.Status = 'Present'), 0) AS Present,
               ISNULL((SELECT COUNT(*) FROM Attendance a WHERE a.SessionID = s.SessionID AND a.Status = 'Absent'), 0) AS Absent
        FROM [Session] s
        JOIN Course c ON c.CourseID = s.CourseID
        WHERE s.InstructorID = (SELECT InstructorID FROM Instructor WHERE UserID = @userId)
          OR s.CourseID IN (
             SELECT CourseID FROM CourseAssistant ca 
             WHERE ca.InstructorID = (SELECT InstructorID FROM Instructor WHERE UserID = @userId)
          )
        ORDER BY s.SessionDate DESC, s.StartTime DESC
      `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getInstructorSessions = getInstructorSessions;
const getPendingGrades = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request()
            .input('userId', db_1.sql.Int, req.user.userId)
            .query(`
        SELECT r.RegistrationID, u.FullName, u.Email, c.Code AS CourseCode, c.Name AS CourseName,
               g.NumericGrade, g.LetterGrade, g.GradePoints, g.GradeID,
               g.GradedAt, r.Status AS RegistrationStatus
        FROM Registration r
        JOIN Student st ON st.StudentID = r.StudentID
        JOIN [User] u ON u.UserID = st.UserID
        JOIN Course c ON c.CourseID = r.CourseID
        JOIN Semester sem ON sem.SemesterID = r.SemesterID
        LEFT JOIN Grade g ON g.RegistrationID = r.RegistrationID
        WHERE c.InstructorID = (SELECT InstructorID FROM Instructor WHERE UserID = @userId)
          AND sem.IsActive = 1
        ORDER BY u.FullName, c.Code
      `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error fetching pending grades:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getPendingGrades = getPendingGrades;
const saveGrades = async (req, res) => {
    console.log('Save Grades Request:', req.body);
    try {
        const { registrationId, midterm, quiz } = req.body;
        const pool = await db_1.poolPromise;
        const regIdParsed = parseInt(registrationId);
        const total = (parseFloat(midterm) || 0) + (parseFloat(quiz) || 0);
        // Security check
        const ownership = await pool.request()
            .input('userId', db_1.sql.Int, req.user.userId)
            .input('regId', db_1.sql.Int, regIdParsed)
            .query(`
        SELECT r.RegistrationID 
        FROM Registration r
        JOIN Course c ON c.CourseID = r.CourseID
        WHERE r.RegistrationID = @regId 
          AND c.InstructorID = (SELECT InstructorID FROM Instructor WHERE UserID = @userId)
      `);
        if (ownership.recordset.length === 0)
            return res.status(403).json({ message: 'Unauthorized' });
        let letter = 'F', points = 0;
        if (total >= 90) {
            letter = 'A';
            points = 4.0;
        }
        else if (total >= 80) {
            letter = 'B';
            points = 3.0;
        }
        else if (total >= 70) {
            letter = 'C';
            points = 2.0;
        }
        else if (total >= 60) {
            letter = 'D';
            points = 1.0;
        }
        const check = await pool.request()
            .input('regId', db_1.sql.Int, regIdParsed)
            .query('SELECT GradeID FROM Grade WHERE RegistrationID = @regId');
        if (check.recordset.length > 0) {
            await pool.request()
                .input('regId', db_1.sql.Int, regIdParsed)
                .input('midterm', db_1.sql.Decimal(5, 2), total)
                .input('letter', db_1.sql.Char(1), letter)
                .input('points', db_1.sql.Decimal(3, 2), points)
                .query('UPDATE Grade SET NumericGrade = @midterm, LetterGrade = @letter, GradePoints = @points WHERE RegistrationID = @regId');
        }
        else {
            await pool.request()
                .input('regId', db_1.sql.Int, regIdParsed)
                .input('midterm', db_1.sql.Decimal(5, 2), total)
                .input('letter', db_1.sql.Char(1), letter)
                .input('points', db_1.sql.Decimal(3, 2), points)
                .query('INSERT INTO Grade (RegistrationID, NumericGrade, LetterGrade, GradePoints) VALUES (@regId, @midterm, @letter, @points)');
        }
        res.json({ message: 'Grades saved successfully' });
    }
    catch (err) {
        console.error('Error saving grades:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.saveGrades = saveGrades;
const getAvailableTAs = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        // Get TAs from the same department as the instructor
        const result = await pool.request()
            .input('userId', db_1.sql.Int, req.user.userId)
            .query(`
        SELECT i.InstructorID, u.FullName, d.Name as Department
        FROM Instructor i
        JOIN [User] u ON u.UserID = i.UserID
        JOIN Department d ON d.DepartmentID = i.DepartmentID
        WHERE u.Role IN ('TA', 'Instructor') 
          AND i.InstructorID != (SELECT InstructorID FROM Instructor WHERE UserID = @userId)
          AND i.DepartmentID = (SELECT DepartmentID FROM Instructor WHERE UserID = @userId)
      `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error fetching available TAs:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAvailableTAs = getAvailableTAs;
const getAssignedTAs = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request()
            .input('userId', db_1.sql.Int, req.user.userId)
            .query(`
        SELECT ca.CourseID, c.Code, c.Name as CourseName, u.FullName as TAName, i.InstructorID as TAID
        FROM CourseAssistant ca
        JOIN Course c ON c.CourseID = ca.CourseID
        JOIN Instructor i ON i.InstructorID = ca.InstructorID
        JOIN [User] u ON u.UserID = i.UserID
        WHERE c.InstructorID = (SELECT InstructorID FROM Instructor WHERE UserID = @userId)
      `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error fetching assigned TAs:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAssignedTAs = getAssignedTAs;
const assignTA = async (req, res) => {
    try {
        const { courseId, taId } = req.body;
        const pool = await db_1.poolPromise;
        // Check if already assigned
        const check = await pool.request()
            .input('c', db_1.sql.Int, courseId)
            .input('i', db_1.sql.Int, taId)
            .query('SELECT * FROM CourseAssistant WHERE CourseID = @c AND InstructorID = @i');
        if (check.recordset.length > 0)
            return res.status(400).json({ message: 'TA already assigned' });
        await pool.request()
            .input('courseId', db_1.sql.Int, parseInt(courseId))
            .input('taId', db_1.sql.Int, parseInt(taId))
            .query('INSERT INTO CourseAssistant (CourseID, InstructorID) VALUES (@courseId, @taId)');
        res.json({ message: 'TA assigned successfully' });
    }
    catch (err) {
        console.error('Error assigning TA:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.assignTA = assignTA;
const getSessionAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await db_1.poolPromise;
        const result = await pool.request()
            .input('sessId', db_1.sql.Int, parseInt(id))
            .query(`
        SELECT u.FullName, a.Status, a.RecordedAt AS AttendanceTime
        FROM Attendance a
        JOIN Student s ON s.StudentID = a.StudentID
        JOIN [User] u ON u.UserID = s.UserID
        WHERE a.SessionID = @sessId
      `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error fetching session attendance:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSessionAttendance = getSessionAttendance;
