const API_BASE = '/api';

// State
let state = {
    condition: 'stroke',
    checklist: [],
    completedCount: 0
};

// DOM Elements
const checklistContainer = document.getElementById('checklist-container');
const progressText = document.getElementById('progress-text');
const energyFill = document.querySelector('.energy-fill');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchChecklist();
    setupNavigation();
    setupForms();
});

// Navigation Logic
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
    });
    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Update nav state if jumped from a button
    document.querySelectorAll('.nav-item').forEach(n => {
        if(n.getAttribute('data-tab') === tabId) {
            n.classList.add('active');
        } else {
            n.classList.remove('active');
        }
    });

    if(tabId === 'summary') {
        fetchDoctorSummary();
    } else if (tabId === 'community') {
        fetchCommunityPosts();
    }
}

// Ensure global access
window.switchTab = switchTab;

// API Calls & Rendering
async function fetchChecklist() {
    try {
        const res = await fetch(`${API_BASE}/checklist?condition=${state.condition}`);
        const data = await res.json();
        
        if(data.success) {
            state.checklist = data.checklist;
            renderChecklist();
        }
    } catch (error) {
        console.error("Failed to fetch checklist:", error);
        checklistContainer.innerHTML = `<div class="text-danger p-4">Error loading protocol. Make sure backend is running.</div>`;
    }
}

function renderChecklist() {
    checklistContainer.innerHTML = '';
    state.completedCount = state.checklist.filter(i => i.done).length;
    updateProgress();

    state.checklist.forEach(item => {
        const div = document.createElement('div');
        div.className = `checklist-item ${item.done ? 'checked' : ''}`;
        div.innerHTML = `
            <div class="check-circle"></div>
            <div class="item-text">${item.text}</div>
            <div class="badge badge-ai" style="margin: 0 0 0 auto; opacity: 0.5;">${item.category}</div>
        `;
        
        div.addEventListener('click', () => toggleChecklist(item.id));
        checklistContainer.appendChild(div);
    });
}

function toggleChecklist(id) {
    const item = state.checklist.find(i => i.id === id);
    if(item) {
        item.done = !item.done;
        renderChecklist();
        
        // if all done, show toast
        if (state.completedCount === state.checklist.length) {
            showToast("Excellent! Daily protocol completed.");
            // Send log to backend
            fetch(`${API_BASE}/log-checklist`, {
                method: 'POST',
                body: JSON.stringify({ items: state.checklist })
            }).catch(e=>console.log(e));
        }
    }
}

function updateProgress() {
    if(state.checklist.length === 0) return;
    const calc = Math.round((state.completedCount / state.checklist.length) * 100);
    progressText.innerText = `${calc}%`;
    
    // Quick circular progress hack with CSS gradient overlay
    const ring = document.querySelector('.progress-ring');
    if(ring) ring.style.background = `conic-gradient(var(--secondary) ${calc}%, rgba(255,255,255,0.1) 0)`;
}

// Form Handlers
function setupForms() {
    // Burnout Form
    document.getElementById('burnout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const q1 = parseInt(document.getElementById('q1').value);
        const q2 = parseInt(document.getElementById('q2').value);
        const q3_raw = parseInt(document.getElementById('q3').value);
        const q3 = 11 - q3_raw; // Invert to align high=bad logic
        
        const btn = e.target.querySelector('button');
        btn.innerText = "Analyzing...";
        
        try {
            const res = await fetch(`${API_BASE}/burnout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: [q1, q2, q3] })
            });
            const data = await res.json();
            
            document.getElementById('burnout-form').classList.add('hidden');
            const resBox = document.getElementById('burnout-result');
            resBox.classList.remove('hidden');
            
            document.getElementById('burnout-score-display').innerText = `Energy Score: ${data.score.toFixed(1)} / 10`;
            document.getElementById('burnout-message').innerText = data.message;
            if(data.isHighRisk) {
                resBox.classList.add('bg-danger-tint');
                showToast("High risk detected. Take immediate rest.");
            } else {
                resBox.classList.add('bg-success-tint');
            }

            // update side widget
            energyFill.style.width = `${((10 - data.score) / 10) * 100}%`;
            document.querySelector('.status-msg').innerText = "Last checked: Just now. " + (data.isHighRisk ? "Warning: Rest needed." : "Stable.");
            
        } catch(err) {
            console.error(err);
            btn.innerText = "Analyze My Energy";
            showToast("Network Error logging survey", true);
        }
    });

    // Escalate Form
    document.getElementById('escalate-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const sym = document.getElementById('symptom-type').value;
        const det = document.getElementById('symptom-details').value;
        const btn = e.target.querySelector('button[type="submit"]');
        btn.innerText = "Sending...";
        
        try {
            const res = await fetch(`${API_BASE}/escalate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptom: sym, details: det })
            });
            const data = await res.json();
            
            document.getElementById('escalate-form').classList.add('hidden');
            const box = document.getElementById('escalate-result');
            box.classList.remove('hidden');
            document.getElementById('escalate-message').innerText = data.message;
            
            showToast("Emergency signal sent successfully.");
        } catch(err) {
            btn.innerText = "Escalate to Doctor";
            showToast("Failed to send escalation", true);
        }
    });

    // Header buttons
    document.getElementById('red-flag-header-btn').addEventListener('click', () => {
        switchTab('escalate');
    });

    // Community Form
    document.getElementById('community-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('community-post-content').value;
        const btn = e.target.querySelector('button');
        btn.innerText = "Sharing...";
        
        try {
            const res = await fetch(`${API_BASE}/community`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const data = await res.json();
            
            if(data.success) {
                document.getElementById('community-post-content').value = '';
                fetchCommunityPosts();
                showToast("Problem shared with community!");
            }
        } catch(err) {
            showToast("Failed to post issue", true);
        }
        btn.innerText = "Share Problem";
    });
}

async function fetchDoctorSummary() {
    const box = document.getElementById('whatsapp-message');
    box.innerHTML = `<div class="loading-state text-sm"><i class="fa-solid fa-circle-notch fa-spin"></i> Synthesizing patient data...</div>`;
    
    try {
        const res = await fetch(`${API_BASE}/doctor-summary`);
        const data = await res.json();
        if(data.success) {
            setTimeout(() => {
                box.innerHTML = `<div class="msg-bubble">${data.summary}</div>`;
            }, 600); // UI delay for realism
        }
    } catch(err) {
        box.innerHTML = `<div class="msg-bubble text-danger">Cloud AI unreachable. Check server connection.</div>`;
    }
}

async function fetchCommunityPosts() {
    const feed = document.getElementById('community-feed');
    feed.innerHTML = `<div class="loading-state text-sm"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading community posts...</div>`;
    try {
        const res = await fetch(`${API_BASE}/community`);
        const data = await res.json();
        
        if (data.success && data.posts) {
            feed.innerHTML = '';
            data.posts.forEach(post => {
                feed.innerHTML += `
                    <div class="msg-bubble" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); width: 100%; text-align: left;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <strong style="color:var(--text-light);"><i class="fa-solid fa-user"></i> ${post.author}</strong>
                            <small style="color:rgba(255,255,255,0.5);">${post.time}</small>
                        </div>
                        <div style="color: #fff;">${post.content}</div>
                    </div>
                `;
            });
        }
    } catch(err) {
        feed.innerHTML = `<div class="text-danger p-4">Could not load posts.</div>`;
    }
}

// Helpers
function showToast(msg, isError = false) {
    toastMsg.innerText = msg;
    if(isError) toastEl.style.color = "var(--danger)";
    else toastEl.style.color = "white";
    
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3500);
}
