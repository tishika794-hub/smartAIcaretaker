const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock Data
let checklists = {
  stroke: [
    { id: 1, text: "Check blood pressure (Target: < 130/80)", category: "vitals", done: false },
    { id: 2, text: "Administer prescribed anticoagulants", category: "meds", done: false },
    { id: 3, text: "15-minute guided physiotherapy (Arm Extension)", category: "physio", done: false },
    { id: 4, text: "Check for any facial drooping or slurred speech", category: "watch-outs", done: false },
    { id: 5, text: "Ensure adequate hydration (1.5L +)", category: "nutrition", done: false }
  ],
  dementia: [
    { id: 1, text: "Administer Donepezil as prescribed", category: "meds", done: false },
    { id: 2, text: "Review day’s schedule & photos with patient", category: "cognitive", done: false },
    { id: 3, text: "Check locks and secure wandering hazards", category: "safety", done: false },
    { id: 4, text: "Monitor for sudden confusion/agitation spikes", category: "watch-outs", done: false }
  ],
  cancer: [
    { id: 1, text: "Provide anti-nausea meds 30 mins before food", category: "meds", done: false },
    { id: 2, text: "Record pain levels on a 1-10 scale", category: "vitals", done: false },
    { id: 3, text: "Check temperature (Report if > 100.4°F)", category: "vitals", done: false },
    { id: 4, text: "Encourage 300 calories of protein intake", category: "nutrition", done: false }
  ]
};

// Simulated Database logs
let patientLogs = [];

// API endpoints
app.get('/api/checklist', (req, res) => {
  const { condition } = req.query;
  const list = checklists[condition ? condition.toLowerCase() : 'stroke'] || checklists['stroke'];
  res.json({ success: true, checklist: list });
});

app.post('/api/burnout', (req, res) => {
  const { answers } = req.body;
  // Simple mock scoring based on survey
  const score = Array.isArray(answers) ? answers.reduce((a, b) => a + b, 0) / answers.length : 5;
  const isHighRisk = score > 7;
  
  const respiteMessage = isHighRisk 
    ? "Your burnout score is high. It is critical for the patient's wellbeing that you rest. We have found 3 respite providers nearby." 
    : "You are doing great. Keep tracking your energy levels daily.";

  res.json({ success: true, score, isHighRisk, message: respiteMessage });
});

app.post('/api/escalate', (req, res) => {
  const { symptom, details } = req.body;
  console.log(`[ESCALATION] Red flag reported by Caregiver: ${symptom} - ${details}`);
  // Simulate SMS sending to doctor
  setTimeout(() => {
    res.json({ success: true, message: "Escalation sent to Dr. Sharma. Expected response in 15 mins." });
  }, 1000); // 1s simulation delay
});

app.post('/api/log-checklist', (req, res) => {
    const { items } = req.body;
    patientLogs.push({ date: new Date(), items });
    res.json({ success: true, count: patientLogs.length });
});

app.get('/api/doctor-summary', (req, res) => {
  // Simulate Claude API summarization 
  res.json({
    success: true, 
    summary: "Patient Adherence: 85%. \nKey Events: Mild nausea reported on Tuesday, subsided with medication. BP stable (avg 125/78) across the week.\nCaregiver Status: Stable (Burnout Score 4/10)." 
  });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
