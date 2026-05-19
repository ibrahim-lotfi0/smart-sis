"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
    }
    else if (attendance < 85 || mid < 14 || (q1 < 5 || q2 < 5)) {
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
    }
    else {
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
// ── POST /predict-sentiment (NLP) ────────────────────────────────────────────
app.post('/predict-sentiment', (req, res) => {
    const { feedback_text } = req.body;
    const start = Date.now();
    if (!feedback_text || !feedback_text.trim()) {
        return res.status(400).json({ error: 'feedback_text is required.' });
    }
    const text = feedback_text.toLowerCase();
    // Simple keyword-based NLP mock
    const positiveWords = ['excellent', 'great', 'amazing', 'good', 'helpful', 'love', 'best',
        'fantastic', 'wonderful', 'perfect', 'awesome', 'enjoy', 'clear', 'understand',
        'outstanding', 'impressive', 'superb', 'brilliant', 'well', 'nice', 'happy',
        'satisfied', 'pleased', 'effective', 'useful', 'engaging', 'interesting', 'fun'];
    const negativeWords = ['bad', 'terrible', 'awful', 'boring', 'confusing', 'hate',
        'worst', 'poor', 'useless', 'waste', 'difficult', 'hard', 'unclear', 'boring',
        'disappointing', 'frustrated', 'unhappy', 'slow', 'problem', 'issue', 'fail',
        'failed', 'wrong', 'error', 'missing', 'incomplete', 'terrible', 'horrible'];
    let posScore = 0;
    let negScore = 0;
    positiveWords.forEach(w => { if (text.includes(w))
        posScore++; });
    negativeWords.forEach(w => { if (text.includes(w))
        negScore++; });
    let sentiment;
    let confidence;
    let probabilities;
    if (posScore > negScore && posScore > 0) {
        sentiment = 'Positive';
        const base = Math.min(95, 60 + posScore * 8);
        confidence = base + Math.floor(Math.random() * 5);
        probabilities = { Positive: confidence, Neutral: Math.floor((100 - confidence) * 0.7), Negative: Math.ceil((100 - confidence) * 0.3) };
    }
    else if (negScore > posScore && negScore > 0) {
        sentiment = 'Negative';
        const base = Math.min(95, 60 + negScore * 8);
        confidence = base + Math.floor(Math.random() * 5);
        probabilities = { Negative: confidence, Neutral: Math.floor((100 - confidence) * 0.7), Positive: Math.ceil((100 - confidence) * 0.3) };
    }
    else {
        sentiment = 'Neutral';
        confidence = 55 + Math.floor(Math.random() * 20);
        probabilities = { Neutral: confidence, Positive: Math.floor((100 - confidence) / 2), Negative: Math.ceil((100 - confidence) / 2) };
    }
    res.json({
        sentiment,
        confidence,
        probabilities,
        threshold_applied: confidence < 70,
        latency_ms: Date.now() - start + 3
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Mock ML API Server running on http://localhost:${PORT}`);
    console.log(`   /predict-risk      → ML Academic Risk`);
    console.log(`   /predict-sentiment → NLP Sentiment Analysis`);
});
