import { Request, Response } from 'express';
import { poolPromise, sql } from '../config/db';
import bcrypt from 'bcryptjs';

// Helper for User creation
async function createUserRecord(pool: any, fullName: string, email: string, password: string, role: string) {
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.request()
    .input('name', sql.NVarChar, fullName)
    .input('email', sql.NVarChar, email)
    .input('pass', sql.NVarChar, hash)
    .input('role', sql.NVarChar, role)
    .query('INSERT INTO [User] (FullName, Email, PasswordHash, Role) OUTPUT INSERTED.UserID VALUES (@name, @email, @pass, @role)');
  return result.recordset[0].UserID;
}

// Audit Logger (console only - SystemLog table not in current schema)
async function logAction(pool: any, userId: number | null, action: string, details: string) {
  console.log(`[AUDIT] ${action}: ${details}`);
}

export const createStudent = async (req: Request, res: Response) => {
  console.log('Create Student Request:', req.body);
  const { fullName, email, password, departmentId, level, enrollmentYear, nationalId, gender, nationality, birthDate, mobile } = req.body;
  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const userId = await createUserRecord(transaction, fullName, email, password, 'Student');
      
      // Use provided NationalID or generate a random one to avoid UNIQUE constraint violation
      const finalNID = nationalId || ('NID' + Date.now().toString().slice(-6) + Math.floor(Math.random()*1000).toString());

      await transaction.request()
        .input('userId', sql.Int, userId)
        .input('dept', sql.Int, parseInt(departmentId))
        .input('lvl', sql.Int, parseInt(level) || 1)
        .input('year', sql.Int, parseInt(enrollmentYear) || new Date().getFullYear())
        .input('nid', sql.NVarChar, finalNID)
        .input('gender', sql.NVarChar, gender || null)
        .input('nationality', sql.NVarChar, nationality || null)
        .input('birthDate', sql.Date, birthDate ? new Date(birthDate) : null)
        .input('mobile', sql.NVarChar, mobile || null)
        .query(`INSERT INTO Student (UserID, DepartmentID, CurrentLevel, EnrollmentYear, NationalID, Gender, Nationality, BirthDate, Mobile) 
                VALUES (@userId, @dept, @lvl, @year, @nid, @gender, @nationality, @birthDate, @mobile)`);
      
      await transaction.commit();
      await logAction(pool, null, 'CREATE_STUDENT', `Created student ${fullName} (${email})`);
      res.status(201).json({ message: 'Student created successfully' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err: any) {
    console.error('Error creating student:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const createInstructor = async (req: Request, res: Response) => {
  console.log('Create Instructor Request:', req.body);
  const { fullName, email, password, departmentId, phone } = req.body;
  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const userId = await createUserRecord(transaction, fullName, email, password, 'Instructor');
      await transaction.request()
        .input('userId', sql.Int, userId)
        .input('dept', sql.Int, parseInt(departmentId))
        .input('phone', sql.NVarChar, phone)
        .input('hireDate', sql.Date, new Date())
        .query('INSERT INTO Instructor (UserID, DepartmentID, Phone, HireDate) VALUES (@userId, @dept, @phone, @hireDate)');
      
      await transaction.commit();
      await logAction(pool, null, 'CREATE_INSTRUCTOR', `Created instructor ${fullName} (${email})`);
      res.status(201).json({ message: 'Instructor created successfully' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err: any) {
    console.error('Error creating instructor:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
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
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getHighRiskStudents = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM vw_HighRiskStudents');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error in getHighRiskStudents:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
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
  } catch (err) {
    console.error('Error in getAllStudents:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllInstructors = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT i.InstructorID, i.UserID, u.FullName, u.Email, u.IsActive, d.Name AS Department, d.DepartmentID, i.Phone, i.HireDate,
             ISNULL((SELECT COUNT(*) FROM Course c WHERE c.InstructorID = i.InstructorID), 0) AS Courses
      FROM Instructor i
      JOIN [User] u ON u.UserID = i.UserID
      JOIN Department d ON d.DepartmentID = i.DepartmentID
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error in getAllInstructors:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
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
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  console.log('Create Department Request:', req.body);
  try {
    const { name } = req.body;
    const pool = await poolPromise;
    await pool.request().input('name', sql.NVarChar, name).query('INSERT INTO Department (Name) VALUES (@name)');
    res.status(201).json({ message: 'Department created' });
  } catch (err: any) { 
    console.error('Error creating department:', err);
    res.status(500).json({ message: err.message || 'Server error' }); 
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Department WHERE DepartmentID = @id');
    res.json({ message: 'Department deleted' });
  } catch (err) { 
    console.error('Error deleting department:', err);
    res.status(500).json({ message: 'Server error' }); 
  }
};

export const createCourse = async (req: Request, res: Response) => {
  console.log('Create Course Request:', req.body);
  try {
    const { code, name, credits, departmentId, instructorId } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('code', sql.NVarChar, code).input('name', sql.NVarChar, name)
      .input('credits', sql.Int, parseInt(credits))
      .input('dept', sql.Int, parseInt(departmentId))
      .input('inst', sql.Int, instructorId ? parseInt(instructorId) : null)
      .query('INSERT INTO Course (Code, Name, Credits, DepartmentID, InstructorID) VALUES (@code, @name, @credits, @dept, @inst)');
    res.status(201).json({ message: 'Course created' });
  } catch (err) { 
    console.error('Error creating course:', err);
    res.status(500).json({ message: 'Server error' }); 
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Course WHERE CourseID = @id');
    res.json({ message: 'Course deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const roleReq = await pool.request().input('id', sql.Int, req.params.id).query('SELECT Role FROM [User] WHERE UserID = @id');
    if (roleReq.recordset.length === 0) return res.status(404).json({ message: 'Not found' });
    const role = roleReq.recordset[0].Role;
    
    if (role === 'Student') await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Student WHERE UserID = @id');
    else if (role === 'Instructor' || role === 'TA') await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Instructor WHERE UserID = @id');
    
    await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM [User] WHERE UserID = @id');
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT c.CourseID, c.Code, c.Name, c.Credits, d.Name as Department, u.FullName as Instructor
      FROM Course c
      JOIN Department d ON d.DepartmentID = c.DepartmentID
      LEFT JOIN Instructor i ON i.InstructorID = c.InstructorID
      LEFT JOIN [User] u ON u.UserID = i.UserID
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, departmentId, level, gender, nationality, birthDate, mobile, nationalId, cgpa, riskLevel, attendanceRate } = req.body;
    const pool = await poolPromise;
    
    if (fullName || email) {
      await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, fullName || null)
        .input('email', sql.NVarChar, email || null)
        .query('UPDATE [User] SET FullName = COALESCE(@name, FullName), Email = COALESCE(@email, Email) WHERE UserID = @id');
    }
    
    await pool.request()
      .input('id', sql.Int, id)
      .input('dept', sql.Int, departmentId ? parseInt(departmentId) : null)
      .input('lvl', sql.Int, level ? parseInt(level) : null)
      .input('gender', sql.NVarChar, gender || null)
      .input('nationality', sql.NVarChar, nationality || null)
      .input('birthDate', sql.Date, birthDate ? new Date(birthDate) : null)
      .input('mobile', sql.NVarChar, mobile || null)
      .input('nid', sql.NVarChar, nationalId || null)
      .input('cgpa', sql.Decimal(3,2), cgpa ? parseFloat(cgpa) : null)
      .input('att', sql.Decimal(5,2), attendanceRate ? parseFloat(attendanceRate) : null)
      .input('risk', sql.NVarChar, riskLevel || null)
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
        .input('uid', sql.Int, id)
        .query('SELECT StudentID FROM Student WHERE UserID = @uid');
      
      if (studentRes.recordset.length > 0) {
        const studentId = studentRes.recordset[0].StudentID;
        await pool.request()
          .input('sid', sql.Int, studentId)
          .input('risk', sql.NVarChar, riskLevel)
          .input('conf', sql.Int, mlConfidence)
          .input('gpa', sql.Decimal(3,2), parseFloat(mlGpa) || 0)
          .input('att', sql.Decimal(5,2), parseFloat(mlAttendance) || 0)
          .query(`INSERT INTO RiskPrediction (StudentID, PredictedRisk, Confidence, GPAUsed, AttendanceUsed, PredictedAt) 
                  VALUES (@sid, @risk, @conf, @gpa, @att, GETDATE())`);
      }
    }
    
    res.json({ message: 'Student updated and ML prediction logged' });
    await logAction(pool, null, 'UPDATE_STUDENT', `Updated student ID ${id}`);
  } catch (err: any) { 
    console.error('Error updating student:', err);
    res.status(500).json({ message: err.message || 'Server error' }); 
  }
};

export const updateInstructor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, departmentId, phone } = req.body;
    const pool = await poolPromise;
    
    if (fullName || email) {
      await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, fullName || null)
        .input('email', sql.NVarChar, email || null)
        .query('UPDATE [User] SET FullName = COALESCE(@name, FullName), Email = COALESCE(@email, Email) WHERE UserID = @id');
    }
    
    await pool.request()
      .input('id', sql.Int, id)
      .input('dept', sql.Int, departmentId ? parseInt(departmentId) : null)
      .input('phone', sql.NVarChar, phone || null)
      .query(`UPDATE Instructor SET 
        DepartmentID = COALESCE(@dept, DepartmentID),
        Phone = COALESCE(@phone, Phone)
        WHERE UserID = @id`);
    
    await logAction(pool, null, 'UPDATE_INSTRUCTOR', `Updated instructor ID ${id}`);
    res.json({ message: 'Instructor updated' });
  } catch (err: any) { 
    console.error('Error updating instructor:', err);
    res.status(500).json({ message: err.message || 'Server error' }); 
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .query('UPDATE Department SET Name = @name WHERE DepartmentID = @id');
    res.json({ message: 'Department updated' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, credits, departmentId, instructorId } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('code', sql.NVarChar, code).input('name', sql.NVarChar, name)
      .input('credits', sql.Int, parseInt(credits))
      .input('dept', sql.Int, parseInt(departmentId))
      .input('inst', sql.Int, instructorId ? parseInt(instructorId) : null)
      .query('UPDATE Course SET Code = @code, Name = @name, Credits = @credits, DepartmentID = @dept, InstructorID = @inst WHERE CourseID = @id');
    res.json({ message: 'Course updated' });
    await logAction(pool, null, 'UPDATE_COURSE', `Updated course ID ${id}`);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// ── New System Settings Endpoints ──

export const getSemesters = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Semester ORDER BY StartDate DESC');
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const updateSemester = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const pool = await poolPromise;
    if (isActive) {
      await pool.request().query('UPDATE Semester SET IsActive = 0');
    }
    await pool.request().input('id', sql.Int, id).input('act', sql.Bit, isActive ? 1 : 0).query('UPDATE Semester SET IsActive = @act WHERE SemesterID = @id');
    res.json({ message: 'Semester updated' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

export const getSystemLogs = async (req: Request, res: Response) => {
  // SystemLog table not in current schema — return static placeholder
  res.json([{ Action: 'INFO', Details: 'System started successfully', Timestamp: new Date().toISOString(), FullName: 'System' }]);
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, id).input('act', sql.Bit, isActive ? 1 : 0).query('UPDATE [User] SET IsActive = @act WHERE UserID = @id');
    res.json({ message: 'User status updated' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};

// GET /api/admin/feedback  ─  All feedback with sentiment stats for NLP dashboard
export const getAdminFeedback = async (req: Request, res: Response) => {
  try {
    const pool = await poolPromise;
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
    const rows     = result.recordset;
    const positive = rows.filter((r: any) => r.Sentiment === 'Positive').length;
    const neutral  = rows.filter((r: any) => r.Sentiment === 'Neutral').length;
    const negative = rows.filter((r: any) => r.Sentiment === 'Negative').length;
    res.json({ feedback: rows, stats: { total: rows.length, positive, neutral, negative } });
  } catch (err) {
    console.error('Error fetching admin feedback:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentRiskFactors = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    
    // Fetch Attendance Rate
    const attRes = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT AttendanceRate FROM Student WHERE StudentID = @id');
    
    const attendance = attRes.recordset[0]?.AttendanceRate || 0;

    // Fetch Exams for CS101 (or latest exams) to capture Midterm, Quiz 1, Quiz 2
    const examsRes = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT e.ExamType, e.ExamDate, eg.Score, eg.MaxScore
        FROM ExamGrade eg
        JOIN Exam e ON e.ExamID = eg.ExamID
        WHERE eg.StudentID = @id
        ORDER BY e.ExamDate ASC
      `);

    let midterm = 0, quiz1 = 0, quiz2 = 0;
    let quizCount = 0;
    
    examsRes.recordset.forEach((row: any) => {
      if (row.ExamType === 'Midterm') midterm = row.Score;
      if (row.ExamType === 'Quiz') {
        quizCount++;
        if (quizCount === 1) quiz1 = row.Score;
        if (quizCount === 2) quiz2 = row.Score;
      }
    });

    res.json({ attendance, midterm, quiz1, quiz2 });
  } catch (err) {
    console.error('Error fetching risk factors:', err);
    res.status(500).json({ message: 'Error fetching risk factors' });
  }
};
