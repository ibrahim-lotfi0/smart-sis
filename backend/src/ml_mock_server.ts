import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8000;

app.post('/predict-risk', (req, res) => {
  const { student_id, attendance_rate, cgpa, level } = req.body;
  const start = Date.now();

  let riskLevel = 'Low';
  let recommendations = [];
  let probs = { Low: 90, Medium: 7, High: 3 };

  const attendance = parseFloat(attendance_rate) || 0;
  const gpa = parseFloat(cgpa) || 0;

  // ── Official Bylaws Logic (Innovation University 2024/2025) ──────────────
  if (gpa < 2.0 || attendance < 75) {
    riskLevel = 'High';
    probs = { Low: 5, Medium: 15, High: 80 };
    
    if (gpa < 2.0) {
      recommendations.push("⚠️ Article (23): Academic Probation. Student is restricted to a maximum of 12 credit hours this semester.");
      recommendations.push("🔴 Mandatory academic counseling to improve CGPA above 2.0 to avoid dismissal (Article 23, p.21).");
    }
    if (attendance < 75) {
      recommendations.push("🚫 Article (10.9): Attendance below 75%. Student is at risk of being barred from final examinations.");
    }
    recommendations.push("📉 Subject-specific tutoring required for all core computing (CF) courses.");
    
  } else if (gpa < 2.5 || attendance < 85) {
    riskLevel = 'Medium';
    probs = { Low: 20, Medium: 65, High: 15 };
    recommendations = [
      "🔸 Warning: CGPA is approaching the 2.0 probation threshold. Early intervention required.",
      "🔸 Monitor attendance closely to maintain the 75% minimum legal requirement.",
      "🔸 Recommend attending teaching assistant (TA) office hours for difficult modules.",
      "🔸 Article (22): Student may repeat passed courses with points < 2.0 to improve CGPA."
    ];
  } else {
    riskLevel = 'Low';
    probs = { Low: 92, Medium: 6, High: 2 };
    recommendations = [
      "✅ Performance exceeds the minimum 2.0 graduation requirement (Article 15).",
      "🌟 Article (25): Eligible for 'Declaration of Honor' if CGPA remains above 3.0.",
      "📈 Encourage participation in advanced research or graduation project labs (Article 34).",
      "💡 Potential for taking 21 credit hours next semester if CGPA stays above 3.0 (Article 14.1.a)."
    ];
  }

  const response = {
    student_id: student_id,
    risk_level: riskLevel,
    confidence: 85 + Math.floor(Math.random() * 14),
    cgpa: cgpa,
    attendance_rate: attendance_rate,
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
