import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8000;

app.post('/predict-risk', (req, res) => {
  const { student_id, attendance_rate, quiz1, quiz2, midterm } = req.body;
  const start = Date.now();

  let riskLevel = 'Low';
  let recommendations = [];
  let probs = { Low: 90, Medium: 7, High: 3 };

  const attendance = parseFloat(attendance_rate) !== undefined ? parseFloat(attendance_rate) : 85;
  const q1 = parseFloat(quiz1) !== undefined ? parseFloat(quiz1) : 7;
  const q2 = parseFloat(quiz2) !== undefined ? parseFloat(quiz2) : 7;
  const mid = parseFloat(midterm) !== undefined ? parseFloat(midterm) : 14;

  // ── Quiz, Attendance, and Midterm Risk Logic ──────────────────────────────
  if (attendance < 75 || mid < 10 || (q1 < 5 && q2 < 5)) {
    riskLevel = 'High';
    probs = { Low: 5, Medium: 15, High: 80 };
    
    if (attendance < 75) {
      recommendations.push("🚫 Article (10.9): Attendance below 75%. Student is at risk of being barred from final examinations.");
    }
    if (mid < 10) {
      recommendations.push("⚠️ Critical Midterm Alert: Score is below 50% (failed). Academic coaching and makeup section attendance are mandatory.");
    }
    if (q1 < 5 && q2 < 5) {
      recommendations.push("📉 Both Quiz scores are below 50% (failed). Immediate tutoring required in core courses.");
    }
    recommendations.push("🔴 Mandatory academic counseling required to improve overall coursework grades.");
    
  } else if (attendance < 85 || mid < 14 || (q1 < 5 || q2 < 5)) {
    riskLevel = 'Medium';
    probs = { Low: 25, Medium: 60, High: 15 };
    
    if (attendance < 85) {
      recommendations.push("🔸 Warning: Attendance rate is approaching the 75% minimum legal requirement.");
    }
    if (mid < 14) {
      recommendations.push("🔸 Midterm score is in the danger zone (50% - 70%). Recommend attending teaching assistant office hours.");
    }
    if (q1 < 5 || q2 < 5) {
      recommendations.push("🔸 Warning: At least one quiz score is below average (failed). Review weak subject modules.");
    }
    recommendations.push("🔸 Suggest attending academic workshop review sessions before the final exam.");
  } else {
    riskLevel = 'Low';
    probs = { Low: 93, Medium: 5, High: 2 };
    recommendations = [
      "✅ Performance meets all safety standards for coursework.",
      "🌟 Outstanding work! Maintain current course study pace to secure honors standing."
    ];
  }

  const response = {
    student_id: student_id,
    risk_level: riskLevel,
    confidence: 85 + Math.floor(Math.random() * 14),
    quiz1: q1,
    quiz2: q2,
    midterm: mid,
    attendance_rate: attendance,
    probabilities: probs,
    recommendations: recommendations,
    latency_ms: Date.now() - start + 5 // Simulating small delay
  };

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`🚀 Mock ML API Server running on http://localhost:${PORT}`);
  console.log(`Listening for risk prediction requests...`);
});
