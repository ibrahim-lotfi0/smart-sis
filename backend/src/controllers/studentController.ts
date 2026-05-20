import { Response } from 'express';
import { poolPromise, sql } from '../config/db';

const ML_API = process.env.ML_API_URL || 'http://127.0.0.1:8000';


export const getStudentProfile = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT * FROM vw_StudentProfile WHERE StudentID = (SELECT StudentID FROM Student WHERE UserID = @userId)');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching student profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentGrades = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT g.GradeID, c.Code, c.Name AS CourseName, sem.Name AS Semester,
               g.NumericGrade, g.LetterGrade, g.GradePoints, g.GradedAt
        FROM Grade g
        JOIN Registration r ON r.RegistrationID = g.RegistrationID
        JOIN Course c       ON c.CourseID = r.CourseID
        JOIN Semester sem   ON sem.SemesterID = r.SemesterID
        WHERE r.StudentID = (SELECT StudentID FROM Student WHERE UserID = @userId)
      `);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching student grades:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentAttendance = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT a.AttendanceID, c.Code, c.Name AS CourseName, s.SessionDate, s.StartTime, a.Status, a.Method
        FROM Attendance a
        JOIN [Session] s ON s.SessionID = a.SessionID
        JOIN Course c    ON c.CourseID = s.CourseID
        WHERE a.StudentID = (SELECT StudentID FROM Student WHERE UserID = @userId)
        ORDER BY s.SessionDate DESC, s.StartTime DESC
      `);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching student attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentCourses = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT c.CourseID, c.Code, c.Name, c.Credits, d.Name AS Department,
               u.FullName AS Instructor, sem.Name AS Semester, r.Status, r.RegistrationID
        FROM Course c
        JOIN Registration r ON r.CourseID = c.CourseID
        JOIN Semester sem ON sem.SemesterID = r.SemesterID
        JOIN Department d ON d.DepartmentID = c.DepartmentID
        LEFT JOIN Instructor i ON i.InstructorID = c.InstructorID
        LEFT JOIN [User] u ON u.UserID = i.UserID
        WHERE r.StudentID = (SELECT StudentID FROM Student WHERE UserID = @userId)
          AND r.Status != 'dropped'
        ORDER BY sem.StartDate DESC, c.Code
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching student courses:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentSchedule = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT 
            DATENAME(dw, s.SessionDate) AS Day,
            FORMAT(s.StartTime, 'hh:mm tt') + ' - ' + FORMAT(s.EndTime, 'hh:mm tt') AS Time,
            c.Code,
            c.Name,
            'Online/TBD' AS Room,
            s.SessionType AS Type
        FROM [Session] s
        JOIN Course c ON c.CourseID = s.CourseID
        JOIN Registration r ON r.CourseID = c.CourseID
        JOIN Semester sem ON sem.SemesterID = s.SemesterID
        WHERE r.StudentID = (SELECT StudentID FROM Student WHERE UserID = @userId)
          AND sem.IsActive = 1
        ORDER BY s.SessionDate, s.StartTime
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching student schedule:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentExams = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT e.ExamDate AS Date, c.Code, e.ExamType AS Type, 
               FORMAT(e.StartTime, 'hh:mm tt') + ' - ' + FORMAT(e.EndTime, 'hh:mm tt') AS Time, 
               e.Room
        FROM Exam e
        JOIN Course c ON c.CourseID = e.CourseID
        JOIN Registration r ON r.CourseID = c.CourseID
        JOIN Semester sem ON sem.SemesterID = e.SemesterID
        WHERE r.StudentID = (SELECT StudentID FROM Student WHERE UserID = @userId)
          AND sem.IsActive = 1
        ORDER BY e.ExamDate, e.StartTime
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching student exams:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/student/feedback  ─  Submit feedback + NLP sentiment via ML server
export const submitFeedback = async (req: any, res: Response) => {
  try {
    const { courseId, feedbackText } = req.body;

    if (!courseId || !feedbackText || !feedbackText.trim())
      return res.status(400).json({ error: 'courseId and feedbackText are required.' });
    if (feedbackText.trim().length < 5)
      return res.status(400).json({ error: 'Feedback must be at least 5 characters.' });

    const pool = await poolPromise;

    // 1. Resolve StudentID from JWT userId
    const stRes = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT StudentID FROM Student WHERE UserID = @userId');
    if (stRes.recordset.length === 0)
      return res.status(404).json({ error: 'Student not found.' });
    const studentId = stRes.recordset[0].StudentID;

    let sentiment = 'Neutral';
    let confidence = 0;
    let probabilities = { Negative: 0, Neutral: 100, Positive: 0 };
    let threshold_applied = false;
    let latency_ms = 0;
    let ml_unavailable = false;

    // 2. Call NLP ML model for sentiment
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const mlRes = await fetch(`${ML_API}/predict-sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_text: feedbackText.trim() }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (mlRes.ok) {
        const mlData: any = await mlRes.json();
        sentiment         = mlData.sentiment;
        confidence        = mlData.confidence;
        probabilities     = mlData.probabilities;
        threshold_applied = mlData.threshold_applied;
        latency_ms        = mlData.latency_ms;
      } else {
        ml_unavailable = true;
      }
    } catch (mlErr: any) {
      // ML server is down → fallback to Neutral, still save feedback
      ml_unavailable = true;
    }

    // 3. Save to DB
    await pool.request()
      .input('studentId',    sql.Int,            studentId)
      .input('courseId',     sql.Int,            parseInt(courseId))
      .input('feedbackText', sql.NVarChar(2000), feedbackText.trim())
      .input('sentiment',    sql.NVarChar(10),   sentiment)
      .query(`
        INSERT INTO Feedback (StudentID, CourseID, FeedbackText, Sentiment, SubmittedAt)
        VALUES (@studentId, @courseId, @feedbackText, @sentiment, SYSUTCDATETIME())
      `);

    return res.json({
      success: true, sentiment, confidence, probabilities,
      threshold_applied, latency_ms, ml_unavailable,
      message: ml_unavailable
        ? 'Feedback saved. ML analysis unavailable — classified as Neutral.'
        : 'Your feedback was analyzed and saved successfully.'
    });
  } catch (err: any) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

// GET /api/student/feedback  ─  Student views their own feedback history
export const getFeedbackHistory = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT f.FeedbackID, c.Code AS CourseCode, c.Name AS CourseName,
               f.FeedbackText, f.Sentiment, f.SubmittedAt
        FROM Feedback f
        JOIN Course c  ON c.CourseID  = f.CourseID
        JOIN Student s ON s.StudentID = f.StudentID
        WHERE s.UserID = @userId
        ORDER BY f.SubmittedAt DESC
      `);
    res.json(result.recordset);
  } catch (err: any) {
    console.error('Error fetching feedback history:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};


export const registerCourse = async (req: any, res: Response) => {
  try {
    const { courseId } = req.body;
    const pool = await poolPromise;
    
    const activeSem = await pool.request().query('SELECT SemesterID FROM Semester WHERE IsActive = 1');
    if (activeSem.recordset.length === 0) return res.status(400).json({ message: 'No active semester' });
    const semesterId = activeSem.recordset[0].SemesterID;

    const courseIdParsed = parseInt(courseId);

    const check = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .input('courseId', sql.Int, courseIdParsed)
      .input('semId', sql.Int, semesterId)
      .query('SELECT RegistrationID FROM Registration WHERE StudentID = (SELECT StudentID FROM Student WHERE UserID = @userId) AND CourseID = @courseId AND SemesterID = @semId');

    if (check.recordset.length > 0) return res.status(400).json({ message: 'Already registered for this course' });

    await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .input('courseId', sql.Int, courseIdParsed)
      .input('semId', sql.Int, semesterId)
      .query('INSERT INTO Registration (StudentID, CourseID, SemesterID, Status) SELECT StudentID, @courseId, @semId, \'enrolled\' FROM Student WHERE UserID = @userId');

    res.status(201).json({ message: 'Successfully registered for course' });
  } catch (err) {
    console.error('Error registering course:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyRiskFactors = async (req: any, res: Response) => {
  try {
    const pool = await poolPromise;
    const userId = req.user.userId;
    
    // Fetch Attendance Rate
    const attRes = await pool.request()
      .input('uid', sql.Int, userId)
      .query('SELECT AttendanceRate FROM Student WHERE UserID = @uid');
    
    const attendance = attRes.recordset[0]?.AttendanceRate || 0;

    // Fetch Exams for CS101 (or latest exams) to capture Midterm, Quiz 1, Quiz 2
    const examsRes = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`
        SELECT e.ExamType, e.ExamDate, eg.Score, eg.MaxScore
        FROM ExamGrade eg
        JOIN Exam e ON e.ExamID = eg.ExamID
        JOIN Student s ON s.StudentID = eg.StudentID
        WHERE s.UserID = @uid AND e.CourseID = (SELECT CourseID FROM Course WHERE Code='CS101')
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
    console.error('Error fetching student risk factors:', err);
    res.status(500).json({ message: 'Error fetching risk factors' });
  }
};
