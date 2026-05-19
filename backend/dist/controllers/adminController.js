"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentRiskFactors = exports.getAdminFeedback = exports.toggleUserStatus = exports.getSystemLogs = exports.updateSemester = exports.getSemesters = exports.updateCourse = exports.updateDepartment = exports.updateInstructor = exports.updateStudent = exports.getAllCourses = exports.deleteUser = exports.deleteCourse = exports.createCourse = exports.deleteDepartment = exports.createDepartment = exports.getDepartments = exports.getAllInstructors = exports.getAllStudents = exports.getHighRiskStudents = exports.getAdminStats = exports.createInstructor = exports.createStudent = void 0;
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Helper for User creation
async function createUserRecord(pool, fullName, email, password, role) {
    const hash = await bcryptjs_1.default.hash(password, 10);
    const result = await pool.request()
        .input('name', db_1.sql.NVarChar, fullName)
        .input('email', db_1.sql.NVarChar, email)
        .input('pass', db_1.sql.NVarChar, hash)
        .input('role', db_1.sql.NVarChar, role)
        .query('INSERT INTO [User] (FullName, Email, PasswordHash, Role) OUTPUT INSERTED.UserID VALUES (@name, @email, @pass, @role)');
    return result.recordset[0].UserID;
}
// Audit Logger (console only - SystemLog table not in current schema)
async function logAction(pool, userId, action, details) {
    console.log(`[AUDIT] ${action}: ${details}`);
}
const createStudent = async (req, res) => {
    console.log('Create Student Request:', req.body);
    const { fullName, email, password, departmentId, level, enrollmentYear, nationalId, gender, nationality, birthDate, mobile } = req.body;
    try {
        const pool = await db_1.poolPromise;
        const transaction = new db_1.sql.Transaction(pool);
        await transaction.begin();
        try {
            const userId = await createUserRecord(transaction, fullName, email, password, 'Student');
            // Use provided NationalID or generate a random one to avoid UNIQUE constraint violation
            const finalNID = nationalId || ('NID' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString());
            await transaction.request()
                .input('userId', db_1.sql.Int, userId)
                .input('dept', db_1.sql.Int, parseInt(departmentId))
                .input('lvl', db_1.sql.Int, parseInt(level) || 1)
                .input('year', db_1.sql.Int, parseInt(enrollmentYear) || new Date().getFullYear())
                .input('nid', db_1.sql.NVarChar, finalNID)
                .input('gender', db_1.sql.NVarChar, gender || null)
                .input('nationality', db_1.sql.NVarChar, nationality || null)
                .input('birthDate', db_1.sql.Date, birthDate ? new Date(birthDate) : null)
                .input('mobile', db_1.sql.NVarChar, mobile || null)
                .query(`INSERT INTO Student (UserID, DepartmentID, CurrentLevel, EnrollmentYear, NationalID, Gender, Nationality, BirthDate, Mobile) 
                VALUES (@userId, @dept, @lvl, @year, @nid, @gender, @nationality, @birthDate, @mobile)`);
            await transaction.commit();
            await logAction(pool, null, 'CREATE_STUDENT', `Created student ${fullName} (${email})`);
            res.status(201).json({ message: 'Student created successfully' });
        }
        catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
    catch (err) {
        console.error('Error creating student:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};
exports.createStudent = createStudent;
const createInstructor = async (req, res) => {
    console.log('Create Instructor Request:', req.body);
    const { fullName, email, password, departmentId, phone } = req.body;
    try {
        const pool = await db_1.poolPromise;
        const transaction = new db_1.sql.Transaction(pool);
        await transaction.begin();
        try {
            const userId = await createUserRecord(transaction, fullName, email, password, 'Instructor');
            await transaction.request()
                .input('userId', db_1.sql.Int, userId)
                .input('dept', db_1.sql.Int, parseInt(departmentId))
                .input('phone', db_1.sql.NVarChar, phone)
                .input('hireDate', db_1.sql.Date, new Date())
                .query('INSERT INTO Instructor (UserID, DepartmentID, Phone, HireDate) VALUES (@userId, @dept, @phone, @hireDate)');
            await transaction.commit();
            await logAction(pool, null, 'CREATE_INSTRUCTOR', `Created instructor ${fullName} (${email})`);
            res.status(201).json({ message: 'Instructor created successfully' });
        }
        catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
    catch (err) {
        console.error('Error creating instructor:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};
exports.createInstructor = createInstructor;
const getAdminStats = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const students = await pool.request().query('SELECT COUNT(*) as count FROM Student');
        const instructors = await pool.request().query('SELECT COUNT(*) as count FROM Instructor');
        const courses = await pool.request().query('SELECT COUNT(*) as count FROM Course');
        const highRisk = await pool.request().query("SELECT COUNT(*) as count FROM Student WHERE RiskLevel = 'High'");
        const activeSem = await pool.request().query('SELECT Name FROM Semester WHERE IsActive = 1');
        const stats = {
            studentCount: students.recordset[0].count,
            instructorCount: instructors.recordset[0].count,
            courseCount: courses.recordset[0].count,
            activeSemester: activeSem.recordset[0]?.Name || 'N/A',
            highRiskCount: highRisk.recordset[0].count,
            enrollmentRate: 85
        };
        console.log('Sending Stats:', stats);
        res.json(stats);
    }
    catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAdminStats = getAdminStats;
const getHighRiskStudents = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request().query('SELECT * FROM vw_HighRiskStudents');
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error in getHighRiskStudents:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getHighRiskStudents = getHighRiskStudents;
const getAllStudents = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request().query(`
      SELECT 
        s.StudentID, s.UserID, u.FullName, u.Email, u.IsActive,
        d.Name AS Department, d.DepartmentID,
        s.NationalID, s.Gender, s.Nationality, s.BirthDate, s.Mobile,
        s.CurrentLevel, s.EnrollmentYear, s.CGPA, s.AttendanceRate, s.RiskLevel
      FROM Student s
      JOIN [User] u ON u.UserID = s.UserID
      JOIN Department d ON d.DepartmentID = s.DepartmentID
    `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error in getAllStudents:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllStudents = getAllStudents;
const getAllInstructors = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request().query(`
      SELECT i.InstructorID, i.UserID, u.FullName, u.Email, u.IsActive, d.Name AS Department, d.DepartmentID, i.Phone, i.HireDate,
             ISNULL((SELECT COUNT(*) FROM Course c WHERE c.InstructorID = i.InstructorID), 0) AS Courses
      FROM Instructor i
      JOIN [User] u ON u.UserID = i.UserID
      JOIN Department d ON d.DepartmentID = i.DepartmentID
    `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error in getAllInstructors:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllInstructors = getAllInstructors;
const getDepartments = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request().query(`
      SELECT 
        d.DepartmentID, 
        d.Name,
        (SELECT COUNT(*) FROM Student s WHERE s.DepartmentID = d.DepartmentID) AS Students,
        (SELECT COUNT(*) FROM Instructor i WHERE i.DepartmentID = d.DepartmentID) AS Instructors,
        (SELECT COUNT(*) FROM Course c WHERE c.DepartmentID = d.DepartmentID) AS Courses,
        ISNULL((SELECT AVG(CGPA) FROM Student s WHERE s.DepartmentID = d.DepartmentID), 0) AS AvgGPA
      FROM Department d
    `);
        console.log(`Sending ${result.recordset.length} departments to frontend`);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getDepartments = getDepartments;
const createDepartment = async (req, res) => {
    console.log('Create Department Request:', req.body);
    try {
        const { name } = req.body;
        const pool = await db_1.poolPromise;
        await pool.request().input('name', db_1.sql.NVarChar, name).query('INSERT INTO Department (Name) VALUES (@name)');
        res.status(201).json({ message: 'Department created' });
    }
    catch (err) {
        console.error('Error creating department:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};
exports.createDepartment = createDepartment;
const deleteDepartment = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        await pool.request().input('id', db_1.sql.Int, req.params.id).query('DELETE FROM Department WHERE DepartmentID = @id');
        res.json({ message: 'Department deleted' });
    }
    catch (err) {
        console.error('Error deleting department:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteDepartment = deleteDepartment;
const createCourse = async (req, res) => {
    console.log('Create Course Request:', req.body);
    try {
        const { code, name, credits, departmentId, instructorId } = req.body;
        const pool = await db_1.poolPromise;
        await pool.request()
            .input('code', db_1.sql.NVarChar, code).input('name', db_1.sql.NVarChar, name)
            .input('credits', db_1.sql.Int, parseInt(credits))
            .input('dept', db_1.sql.Int, parseInt(departmentId))
            .input('inst', db_1.sql.Int, instructorId ? parseInt(instructorId) : null)
            .query('INSERT INTO Course (Code, Name, Credits, DepartmentID, InstructorID) VALUES (@code, @name, @credits, @dept, @inst)');
        res.status(201).json({ message: 'Course created' });
    }
    catch (err) {
        console.error('Error creating course:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createCourse = createCourse;
const deleteCourse = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        await pool.request().input('id', db_1.sql.Int, req.params.id).query('DELETE FROM Course WHERE CourseID = @id');
        res.json({ message: 'Course deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteCourse = deleteCourse;
const deleteUser = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const roleReq = await pool.request().input('id', db_1.sql.Int, req.params.id).query('SELECT Role FROM [User] WHERE UserID = @id');
        if (roleReq.recordset.length === 0)
            return res.status(404).json({ message: 'Not found' });
        const role = roleReq.recordset[0].Role;
        if (role === 'Student')
            await pool.request().input('id', db_1.sql.Int, req.params.id).query('DELETE FROM Student WHERE UserID = @id');
        else if (role === 'Instructor' || role === 'TA')
            await pool.request().input('id', db_1.sql.Int, req.params.id).query('DELETE FROM Instructor WHERE UserID = @id');
        await pool.request().input('id', db_1.sql.Int, req.params.id).query('DELETE FROM [User] WHERE UserID = @id');
        res.json({ message: 'User deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteUser = deleteUser;
const getAllCourses = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request().query(`
      SELECT c.CourseID, c.Code, c.Name, c.Credits, d.Name as Department, u.FullName as Instructor
      FROM Course c
      JOIN Department d ON d.DepartmentID = c.DepartmentID
      LEFT JOIN Instructor i ON i.InstructorID = c.InstructorID
      LEFT JOIN [User] u ON u.UserID = i.UserID
    `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllCourses = getAllCourses;
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, departmentId, level, gender, nationality, birthDate, mobile, nationalId, cgpa, riskLevel, attendanceRate } = req.body;
        const pool = await db_1.poolPromise;
        if (fullName || email) {
            await pool.request()
                .input('id', db_1.sql.Int, id)
                .input('name', db_1.sql.NVarChar, fullName || null)
                .input('email', db_1.sql.NVarChar, email || null)
                .query('UPDATE [User] SET FullName = COALESCE(@name, FullName), Email = COALESCE(@email, Email) WHERE UserID = @id');
        }
        await pool.request()
            .input('id', db_1.sql.Int, id)
            .input('dept', db_1.sql.Int, departmentId ? parseInt(departmentId) : null)
            .input('lvl', db_1.sql.Int, level ? parseInt(level) : null)
            .input('gender', db_1.sql.NVarChar, gender || null)
            .input('nationality', db_1.sql.NVarChar, nationality || null)
            .input('birthDate', db_1.sql.Date, birthDate ? new Date(birthDate) : null)
            .input('mobile', db_1.sql.NVarChar, mobile || null)
            .input('nid', db_1.sql.NVarChar, nationalId || null)
            .input('cgpa', db_1.sql.Decimal(3, 2), cgpa ? parseFloat(cgpa) : null)
            .input('att', db_1.sql.Decimal(5, 2), attendanceRate ? parseFloat(attendanceRate) : null)
            .input('risk', db_1.sql.NVarChar, riskLevel || null)
            .query(`UPDATE Student SET 
        DepartmentID = COALESCE(@dept, DepartmentID), 
        CurrentLevel = COALESCE(@lvl, CurrentLevel),
        Gender = COALESCE(@gender, Gender),
        Nationality = COALESCE(@nationality, Nationality),
        BirthDate = COALESCE(@birthDate, BirthDate),
        Mobile = COALESCE(@mobile, Mobile),
        NationalID = COALESCE(@nid, NationalID),
        CGPA = COALESCE(@cgpa, CGPA),
        AttendanceRate = COALESCE(@att, AttendanceRate),
        RiskLevel = COALESCE(@risk, RiskLevel)
        WHERE UserID = @id`);
        // New: If ML data is provided, also log into RiskPrediction table
        const { mlConfidence, mlGpa, mlAttendance } = req.body;
        if (riskLevel && mlConfidence) {
            // Get StudentID first
            const studentRes = await pool.request()
                .input('uid', db_1.sql.Int, id)
                .query('SELECT StudentID FROM Student WHERE UserID = @uid');
            if (studentRes.recordset.length > 0) {
                const studentId = studentRes.recordset[0].StudentID;
                await pool.request()
                    .input('sid', db_1.sql.Int, studentId)
                    .input('risk', db_1.sql.NVarChar, riskLevel)
                    .input('conf', db_1.sql.Int, mlConfidence)
                    .input('gpa', db_1.sql.Decimal(3, 2), parseFloat(mlGpa) || 0)
                    .input('att', db_1.sql.Decimal(5, 2), parseFloat(mlAttendance) || 0)
                    .query(`INSERT INTO RiskPrediction (StudentID, PredictedRisk, Confidence, GPAUsed, AttendanceUsed, PredictedAt) 
                  VALUES (@sid, @risk, @conf, @gpa, @att, GETDATE())`);
            }
        }
        res.json({ message: 'Student updated and ML prediction logged' });
        await logAction(pool, null, 'UPDATE_STUDENT', `Updated student ID ${id}`);
    }
    catch (err) {
        console.error('Error updating student:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};
exports.updateStudent = updateStudent;
const updateInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, departmentId, phone } = req.body;
        const pool = await db_1.poolPromise;
        if (fullName || email) {
            await pool.request()
                .input('id', db_1.sql.Int, id)
                .input('name', db_1.sql.NVarChar, fullName || null)
                .input('email', db_1.sql.NVarChar, email || null)
                .query('UPDATE [User] SET FullName = COALESCE(@name, FullName), Email = COALESCE(@email, Email) WHERE UserID = @id');
        }
        await pool.request()
            .input('id', db_1.sql.Int, id)
            .input('dept', db_1.sql.Int, departmentId ? parseInt(departmentId) : null)
            .input('phone', db_1.sql.NVarChar, phone || null)
            .query(`UPDATE Instructor SET 
        DepartmentID = COALESCE(@dept, DepartmentID),
        Phone = COALESCE(@phone, Phone)
        WHERE UserID = @id`);
        await logAction(pool, null, 'UPDATE_INSTRUCTOR', `Updated instructor ID ${id}`);
        res.json({ message: 'Instructor updated' });
    }
    catch (err) {
        console.error('Error updating instructor:', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};
exports.updateInstructor = updateInstructor;
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const pool = await db_1.poolPromise;
        await pool.request()
            .input('id', db_1.sql.Int, id)
            .input('name', db_1.sql.NVarChar, name)
            .query('UPDATE Department SET Name = @name WHERE DepartmentID = @id');
        res.json({ message: 'Department updated' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateDepartment = updateDepartment;
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, credits, departmentId, instructorId } = req.body;
        const pool = await db_1.poolPromise;
        await pool.request()
            .input('id', db_1.sql.Int, id)
            .input('code', db_1.sql.NVarChar, code).input('name', db_1.sql.NVarChar, name)
            .input('credits', db_1.sql.Int, parseInt(credits))
            .input('dept', db_1.sql.Int, parseInt(departmentId))
            .input('inst', db_1.sql.Int, instructorId ? parseInt(instructorId) : null)
            .query('UPDATE Course SET Code = @code, Name = @name, Credits = @credits, DepartmentID = @dept, InstructorID = @inst WHERE CourseID = @id');
        res.json({ message: 'Course updated' });
        await logAction(pool, null, 'UPDATE_COURSE', `Updated course ID ${id}`);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateCourse = updateCourse;
// ── New System Settings Endpoints ──
const getSemesters = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request().query('SELECT * FROM Semester ORDER BY StartDate DESC');
        res.json(result.recordset);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getSemesters = getSemesters;
const updateSemester = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const pool = await db_1.poolPromise;
        if (isActive) {
            await pool.request().query('UPDATE Semester SET IsActive = 0');
        }
        await pool.request().input('id', db_1.sql.Int, id).input('act', db_1.sql.Bit, isActive ? 1 : 0).query('UPDATE Semester SET IsActive = @act WHERE SemesterID = @id');
        res.json({ message: 'Semester updated' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateSemester = updateSemester;
const getSystemLogs = async (req, res) => {
    // SystemLog table not in current schema — return static placeholder
    res.json([{ Action: 'INFO', Details: 'System started successfully', Timestamp: new Date().toISOString(), FullName: 'System' }]);
};
exports.getSystemLogs = getSystemLogs;
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const pool = await db_1.poolPromise;
        await pool.request().input('id', db_1.sql.Int, id).input('act', db_1.sql.Bit, isActive ? 1 : 0).query('UPDATE [User] SET IsActive = @act WHERE UserID = @id');
        res.json({ message: 'User status updated' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.toggleUserStatus = toggleUserStatus;
// GET /api/admin/feedback  ─  All feedback with sentiment stats for NLP dashboard
const getAdminFeedback = async (req, res) => {
    try {
        const pool = await db_1.poolPromise;
        const result = await pool.request().query(`
      SELECT f.FeedbackID, u.FullName AS StudentName, u.Email,
             d.Name AS Department, c.Code AS CourseCode, c.Name AS CourseName,
             f.FeedbackText, f.Sentiment, f.SubmittedAt
      FROM Feedback f
      JOIN Student    s ON s.StudentID    = f.StudentID
      JOIN [User]     u ON u.UserID       = s.UserID
      JOIN Department d ON d.DepartmentID = s.DepartmentID
      JOIN Course     c ON c.CourseID     = f.CourseID
      ORDER BY f.SubmittedAt DESC
    `);
        const rows = result.recordset;
        const positive = rows.filter((r) => r.Sentiment === 'Positive').length;
        const neutral = rows.filter((r) => r.Sentiment === 'Neutral').length;
        const negative = rows.filter((r) => r.Sentiment === 'Negative').length;
        res.json({ feedback: rows, stats: { total: rows.length, positive, neutral, negative } });
    }
    catch (err) {
        console.error('Error fetching admin feedback:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAdminFeedback = getAdminFeedback;
const getStudentRiskFactors = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await db_1.poolPromise;
        // Fetch Attendance Rate
        const attRes = await pool.request()
            .input('id', db_1.sql.Int, id)
            .query('SELECT AttendanceRate FROM Student WHERE StudentID = @id');
        const attendance = attRes.recordset[0]?.AttendanceRate || 0;
        // Fetch Exams for CS101 (or latest exams) to capture Midterm, Quiz 1, Quiz 2
        const examsRes = await pool.request()
            .input('id', db_1.sql.Int, id)
            .query(`
        SELECT e.ExamType, e.ExamDate, eg.Score, eg.MaxScore
        FROM ExamGrade eg
        JOIN Exam e ON e.ExamID = eg.ExamID
        WHERE eg.StudentID = @id
        ORDER BY e.ExamDate ASC
      `);
        let midterm = 0, quiz1 = 0, quiz2 = 0;
        let quizCount = 0;
        examsRes.recordset.forEach((row) => {
            if (row.ExamType === 'Midterm')
                midterm = row.Score;
            if (row.ExamType === 'Quiz') {
                quizCount++;
                if (quizCount === 1)
                    quiz1 = row.Score;
                if (quizCount === 2)
                    quiz2 = row.Score;
            }
        });
        res.json({ attendance, midterm, quiz1, quiz2 });
    }
    catch (err) {
        console.error('Error fetching risk factors:', err);
        res.status(500).json({ message: 'Error fetching risk factors' });
    }
};
exports.getStudentRiskFactors = getStudentRiskFactors;
