# Knowli Project Tracker

Internal app to track and filter Knowli projects by client, domain, and type.

## Tech Stack
- Frontend: React + TailwindCSS
- Backend: Flask + SQLite

## Run Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Then commit and push it:
```bash
git add README.md
git commit -m "Add README with basic project info"
git push
