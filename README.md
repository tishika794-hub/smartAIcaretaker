# CarerOS 💙 

**The AI Operating System for India's 10 Million Invisible Caregivers**

Welcome to the CarerOS Hackathon Prototype! This application is designed to be the first product in India built explicitly for the caregiver, not just the patient. By turning terrified family members into trained, supported, and monitored care partners through AI in under 2 minutes a day, CarerOS aims to significantly reduce caregiver burnout and patient hospital readmissions.

## 🚀 Features

1. **AI Daily Care Protocols**
   - Generates personalized daily checklists using condition-specific templates (e.g. Stroke, Dementia, Cancer).
   - Allows caregivers to check off treatments, medication, and physiotherapy tasks daily.

2. **Energy Check (Burnout Survey)**
   - A weekly continuous scoring system assessing caregiver exhaustion levels using a scientifically backed 3-question slide scale.
   - Triggers dynamic actionable respite advice based on risk scores.

3. **Emergency Red Flag Escalation**
   - Multi-signal escalation logging for severe symptoms (e.g., Slurred speech, High BP).
   - Simulates immediate SMS escalations to the patient's primary clinician.

4. **Doctor Summaries (Sunday Reports)**
   - Prepares an AI-synthesized, clinician-ready breakdown of the week's patient adherence and caregiver status.

## 💻 Tech Stack (Prototype)

Designed entirely without package managers (`npm`) to be perfectly portable for local hackathon demos:
- **Frontend**: Vanilla Javascript, HTML5, and CSS3. 
- **Design System**: Fully responsive Custom CSS with premium dark-mode Glassmorphism aesthetics and micro-animations.
- **Backend API**: Python 3 standard library `http.server` module to serve JSON REST requests locally and mock the intelligent Claude Engine layer logic.

## 🏃🏽‍♂️ How to Run Locally

You can launch both the frontend application and the backend simulator with a single click using the provided script.

1. Download or clone this repository.
2. Ensure you have **Python 3** installed on your system.
3. Simply double click on the `run.cmd` file in the main folder.
   - This opens two background console windows serving the python files.
   - It will automatically pop open a web browser to `http://localhost:8080/`.

*When you are done testing the prototype, just close the newly opened command prompt windows.*

## 🏆 Hackathon Target Criteria

**Target Users:** Adult children caring for parents, spouses managing chronic illness.
**Core Distribution Moat:** Adopted exclusively at the moment of highest-trust: Hospital Discarge. Recommended by Clinicians.
**Business Viability:** B2B Hospitals (reduce readmission penalties), B2B2C Insurers (healthier patient outcomes). Always 100% Free for the Caregiver.

---
*"We don't sell to caregivers — they always use it free. CarerOS is not a healthcare app. It's the missing layer of the Indian healthcare system."*
