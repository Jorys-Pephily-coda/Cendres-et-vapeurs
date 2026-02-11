### Lancer le site

# Terminal 1
cd backend
python3 seed.py
uvicorn main:app --reload

# Terminal 2
cd frontend
npm install
npm run dev

### Lien
http://localhost:5173/