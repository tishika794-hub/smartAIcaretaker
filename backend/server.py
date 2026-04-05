import http.server
import socketserver
import json
import urllib.parse
import time
import os

PORT = int(os.environ.get('PORT', 8000))

checklists = {
    'stroke': [
        {'id': 1, 'text': 'Check blood pressure (Target: < 130/80)', 'category': 'vitals', 'done': False},
        {'id': 2, 'text': 'Administer prescribed anticoagulants', 'category': 'meds', 'done': False},
        {'id': 3, 'text': '15-minute guided physiotherapy (Arm Extension)', 'category': 'physio', 'done': False},
        {'id': 4, 'text': 'Check for any facial drooping or slurred speech', 'category': 'watch-outs', 'done': False},
        {'id': 5, 'text': 'Ensure adequate hydration (1.5L +)', 'category': 'nutrition', 'done': False}
    ],
    'dementia': [
        {'id': 1, 'text': 'Administer Donepezil as prescribed', 'category': 'meds', 'done': False},
        {'id': 2, 'text': 'Review day’s schedule & photos with patient', 'category': 'cognitive', 'done': False},
        {'id': 3, 'text': 'Check locks and secure wandering hazards', 'category': 'safety', 'done': False},
        {'id': 4, 'text': 'Monitor for sudden confusion/agitation spikes', 'category': 'watch-outs', 'done': False}
    ],
    'cancer': [
        {'id': 1, 'text': 'Provide anti-nausea meds 30 mins before food', 'category': 'meds', 'done': False},
        {'id': 2, 'text': 'Record pain levels on a 1-10 scale', 'category': 'vitals', 'done': False},
        {'id': 3, 'text': 'Check temperature (Report if > 100.4°F)', 'category': 'vitals', 'done': False},
        {'id': 4, 'text': 'Encourage 300 calories of protein intake', 'category': 'nutrition', 'done': False}
    ]
}

patient_logs = []

community_posts = [
    {'author': 'Sarah L.', 'time': '2 hours ago', 'content': 'My dad keeps refusing to take his donepezil because he thinks it is poisonous. Any tips?'},
    {'author': 'Rahul G.', 'time': '5 hours ago', 'content': 'I am so exhausted juggling my job and caring for my wife post-stroke. Just needed to vent.'}
]

class CarerOSBackendAPI(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve files from the frontend directory
        frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
        super().__init__(*args, directory=frontend_dir, **kwargs)

    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        # Allow CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)
        
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/api/checklist':
            query = urllib.parse.parse_qs(parsed_path.query)
            condition = query.get('condition', ['stroke'])[0].lower()
            list_data = checklists.get(condition, checklists['stroke'])
            
            self._set_headers()
            self.wfile.write(json.dumps({'success': True, 'checklist': list_data}).encode())
        elif parsed_path.path == '/api/doctor-summary':
            self._set_headers()
            summary = "Patient Adherence: 85%. \nKey Events: Mild nausea reported on Tuesday. BP stable (avg 125/78).\nCaregiver Status: Stable (Burnout Score 4/10)."
            self.wfile.write(json.dumps({'success': True, 'summary': summary}).encode())
        elif parsed_path.path == '/api/community':
            self._set_headers()
            self.wfile.write(json.dumps({'success': True, 'posts': community_posts}).encode())
        else:
            # Fall back to serving static files from the frontend directory
            super().do_GET()

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode('utf-8'))
        except:
            body = {}

        if parsed_path.path == '/api/burnout':
            answers = body.get('answers', [])
            score = sum(answers)/len(answers) if len(answers) > 0 else 5
            is_high_risk = score > 7
            msg = "Your burnout score is high. It is critical for the patient's wellbeing that you rest. We have found 3 respite providers nearby." if is_high_risk else "You are doing great. Keep tracking your energy levels daily."
            
            self._set_headers()
            self.wfile.write(json.dumps({'success': True, 'score': score, 'isHighRisk': is_high_risk, 'message': msg}).encode())
            
        elif parsed_path.path == '/api/escalate':
            symptom = body.get('symptom', '')
            details = body.get('details', '')
            print(f"[ESCALATION] Red flag reported: {symptom} - {details}")
            # Simulate slight delay
            time.sleep(1)
            self._set_headers()
            self.wfile.write(json.dumps({'success': True, 'message': "Escalation sent to Dr. Sharma. Expected response in 15 mins."}).encode())
            
        elif parsed_path.path == '/api/log-checklist':
            items = body.get('items', [])
            patient_logs.append({'timestamp': time.time(), 'items': items})
            self._set_headers()
            self.wfile.write(json.dumps({'success': True, 'count': len(patient_logs)}).encode())
            
        elif parsed_path.path == '/api/community':
            content = body.get('content', '')
            post = {'author': 'You', 'time': 'Just now', 'content': content}
            community_posts.insert(0, post) # inject at top
            self._set_headers()
            self.wfile.write(json.dumps({'success': True, 'post': post}).encode())
            
        else:
            self.send_error(404, "Not Found")

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), CarerOSBackendAPI) as httpd:
        print(f"Backend API running on http://localhost:{PORT}")
        httpd.serve_forever()
