# TaskFlow AI

Full-stack project & kanban app with role-based access and a local Ollama AI assistant.

## Structure

- `backend/` — FastAPI, SQLAlchemy, Alembic, PostgreSQL, LangChain + Ollama
- `frontend/` — Vite + React + TypeScript + Tailwind + RTK Query

## Quick start

### Backend

```bash
cd backend
uv sync
# copy ../.env.example to .env and set DB + JWT values
uv run alembic upgrade head
uv run fastapi dev main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Optional: set `VITE_API_URL` if the API is not at `http://localhost:8000`.

### AI chat

Requires [Ollama](https://ollama.com) running locally with model `qwen3:4b` (or change `OLLAMA_MODEL` in `.env`).
